import express from "express";
import cors from "cors";
import path from "node:path";
import * as Sentry from "@sentry/node";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "./database/db";
import { authMiddleware } from "./middleware/auth";
import { apiLimiter, authLimiter } from "./middleware/rate-limiter";
import { securityHeaders } from "./middleware/security-headers";
import { uploadMiddleware, processAndUploadImage, SecuredUploadRequest } from "./middleware/upload-security";

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "default_dev_secret_key_change_in_prod";

// Initialize Sentry Node SDK if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
  });
  console.log("Sentry Node SDK initialized successfully.");
}

// 1. Enable secure security headers via Helmet
app.use(securityHeaders);

// 2. Configure Origin-Locked CORS policies
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://celebreties-profile.vercel.app"
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(","));
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Server-to-server or Curl)
      if (!origin) return callback(null, true);
      
      const cleanOrigin = origin.trim().replace(/\/$/, "");
      const isAllowed = allowedOrigins.some(allowed => cleanOrigin === allowed.trim().replace(/\/$/, ""));
      
      if (isAllowed || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.use(express.json());

// 3. Serve optimized mock uploads statically if running locally/fallback mode
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// 4. Rate limiting for API requests
app.use("/api/", apiLimiter);

/* ========================================================================= */
/* REST API ENDPOINTS (VERSIONED UNDER /api/v1/)                              */
/* ========================================================================= */

// --- 0. Admin Login ---
app.post("/api/v1/auth/login", authLimiter, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const result = await query("SELECT password_hash FROM admins WHERE username = $1", ["admin"]);
    if (result.rows.length === 0) {
      return res.status(500).json({
        error: "No administrator account found in database. Please run the seed script."
      });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ username: "admin", role: "admin" }, JWT_SECRET, {
      expiresIn: "365d",
    });

    res.json({ token });
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(500).json({ error: "An unexpected database or server error occurred" });
  }
});

// --- 1. Get Profiles (Database-Level Filter & Pagination) ---
app.get("/api/v1/profiles", async (req, res) => {
  const { category_id, subcategory_id, limit, offset, sort_by, order } = req.query;

  let queryText = `
    SELECT p.id, p.slug, p.name, p.title, p.subtitle, p.portrait, p.data, p.category_id, p.subcategory_id,
           c.name AS category_name, c.slug AS category_slug,
           s.name AS subcategory_name, s.slug AS subcategory_slug,
           pe.roles, pe.expertise_areas, pe.services_offered, pe.industries_served,
           pe.who_i_help, pe.languages, pe.years_experience, pe.professional_summary, pe.keywords,
           pe.is_available_for_consultation, pe.cta_text, pe.impact_statistics, pe.achievements,
           pe.featured_services, pe.is_published,
           pe.status, pe.published_at, pe.published_by, pe.section_visibility, pe.contact_types,
           pe.professional_journey, pe.current_activities, pe.how_i_help, pe.services_consultations,
           pe.professional_gallery, pe.publications, pe.media_interviews, pe.testimonials,
           pe.organizations_associations, pe.contact_collaboration,
           p.created_at, p.updated_at 
    FROM profiles p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    LEFT JOIN professional_expertise pe ON p.id = pe.profile_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (category_id) {
    params.push(parseInt(category_id as string, 10));
    queryText += ` AND p.category_id = $${params.length}`;
  }

  if (subcategory_id) {
    params.push(parseInt(subcategory_id as string, 10));
    queryText += ` AND p.subcategory_id = $${params.length}`;
  }

  // Sort validation
  const validSortColumns = ["id", "name", "created_at", "updated_at"];
  const sortBy = validSortColumns.includes(sort_by as string) ? (sort_by as string) : "id";
  const sortOrder = (order as string)?.toUpperCase() === "DESC" ? "DESC" : "ASC";
  queryText += ` ORDER BY p.${sortBy} ${sortOrder}`;

  // Pagination
  if (limit) {
    params.push(parseInt(limit as string, 10));
    queryText += ` LIMIT $${params.length}`;
  }
  if (offset) {
    params.push(parseInt(offset as string, 10));
    queryText += ` OFFSET $${params.length}`;
  }

  try {
    const result = await query(queryText, params);
    
    // Check if caller is admin
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        jwt.verify(token, JWT_SECRET);
        isAdmin = true;
      } catch (err) {}
    }

    const rows = result.rows.map((row: any) => {
      // If status is not published, strip expertise data from response for non-admins
      if (row.status && row.status !== "published" && !isAdmin) {
        const {
          roles, expertise_areas, services_offered, industries_served, who_i_help,
          languages, years_experience, professional_summary, keywords,
          is_available_for_consultation, cta_text, impact_statistics, achievements,
          featured_services, is_published, status, published_at, published_by,
          section_visibility, contact_types, professional_journey, current_activities,
          how_i_help, services_consultations, professional_gallery, publications,
          media_interviews, testimonials, organizations_associations, contact_collaboration,
          ...basicProfile
        } = row;
        return {
          ...basicProfile,
          is_published: false
        };
      }
      return row;
    });

    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch profiles:", err);
    res.status(500).json({ error: "Failed to fetch profiles from database" });
  }
});

// --- 2. Get Single Profile by Slug ---
app.get("/api/v1/profiles/:slug", async (req, res) => {
  let { slug } = req.params;
  
  // Normalize common spelling variations for Dr. Ravuri Balaraju
  if (
    slug === "dr-ravuru-balaraju" || 
    slug === "ravuru-balaraju" || 
    slug === "ravuri-balaraju"
  ) {
    slug = "dr-ravuri-balaraju";
  }

  try {
    const result = await query(
      `SELECT p.id, p.slug, p.name, p.title, p.subtitle, p.portrait, p.data, p.category_id, p.subcategory_id,
              c.name AS category_name, c.slug AS category_slug,
              s.name AS subcategory_name, s.slug AS subcategory_slug,
              pe.roles, pe.expertise_areas, pe.services_offered, pe.industries_served,
              pe.who_i_help, pe.languages, pe.years_experience, pe.professional_summary, pe.keywords,
              pe.is_available_for_consultation, pe.cta_text, pe.impact_statistics, pe.achievements,
              pe.featured_services, pe.is_published,
              pe.status, pe.published_at, pe.published_by, pe.section_visibility, pe.contact_types,
              pe.professional_journey, pe.current_activities, pe.how_i_help, pe.services_consultations,
              pe.professional_gallery, pe.publications, pe.media_interviews, pe.testimonials,
              pe.organizations_associations, pe.contact_collaboration,
              p.created_at, p.updated_at 
       FROM profiles p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories s ON p.subcategory_id = s.id
       LEFT JOIN professional_expertise pe ON p.id = pe.profile_id
       WHERE p.slug = $1`,
      [slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Leader profile not found" });
    }

    const row = result.rows[0];

    // Check if caller is admin
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        jwt.verify(token, JWT_SECRET);
        isAdmin = true;
      } catch (err) {}
    }

    const isPreview = req.query.preview === "true";

    // If status is not published, strip expertise data from response for public view (non-preview / non-admin)
    if (row.status && row.status !== "published" && !(isAdmin && isPreview)) {
      const {
        roles, expertise_areas, services_offered, industries_served, who_i_help,
        languages, years_experience, professional_summary, keywords,
        is_available_for_consultation, cta_text, impact_statistics, achievements,
        featured_services, is_published, status, published_at, published_by,
        section_visibility, contact_types, professional_journey, current_activities,
        how_i_help, services_consultations, professional_gallery, publications,
        media_interviews, testimonials, organizations_associations, contact_collaboration,
        ...basicProfile
      } = row;
      return res.json({
        ...basicProfile,
        is_published: false
      });
    }

    res.json(row);
  } catch (err) {
    console.error(`Failed to fetch profile for slug '${slug}':`, err);
    res.status(500).json({ error: "Failed to fetch leader profile" });
  }
});

// --- 3. Save Profile (Auth Required) ---
app.post("/api/v1/profiles", authMiddleware, async (req, res) => {
  const profile = req.body;
  if (!profile.name || !profile.slug) {
    return res.status(400).json({ error: "Name and Slug are required fields" });
  }

  const categoryId = profile.category_id ? parseInt(profile.category_id, 10) : null;
  const subcategoryId = profile.subcategory_id ? parseInt(profile.subcategory_id, 10) : null;

  try {
    if (profile.id) {
      // Update existing
      await query(
        `UPDATE profiles 
         SET slug = $1, name = $2, title = $3, subtitle = $4, portrait = $5, data = $6, category_id = $7, subcategory_id = $8, updated_at = CURRENT_TIMESTAMP
         WHERE id = $9`,
        [
          profile.slug,
          profile.name,
          profile.title,
          profile.subtitle,
          profile.portrait,
          JSON.stringify(profile.data),
          categoryId,
          subcategoryId,
          profile.id,
        ]
      );
      res.json({ success: true, id: profile.id });
    } else {
      // Insert new
      const result = await query(
        `INSERT INTO profiles (slug, name, title, subtitle, portrait, category_id, subcategory_id, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          profile.slug,
          profile.name,
          profile.title,
          profile.subtitle,
          profile.portrait,
          categoryId,
          subcategoryId,
          JSON.stringify(profile.data),
        ]
      );
      res.json({ success: true, id: result.rows[0].id });
    }
  } catch (err) {
    console.error("Failed to save profile:", err);
    res.status(500).json({ error: "Failed to save leader profile" });
  }
});

// --- 4. Delete Profile (Auth Required) ---
app.delete("/api/v1/profiles/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query("DELETE FROM profiles WHERE id = $1", [parseInt(id, 10)]);
    res.json({ success: true });
  } catch (err) {
    console.error(`Failed to delete profile with id ${id}:`, err);
    res.status(500).json({ error: "Failed to delete profile" });
  }
});

// --- 4.1. Get Professional Expertise for Admin (Auth Required) ---
app.get("/api/v1/profiles/:id/professional-expertise", authMiddleware, async (req, res) => {
  const profileId = parseInt(req.params.id, 10);
  try {
    const result = await query(
      "SELECT * FROM professional_expertise WHERE profile_id = $1",
      [profileId]
    );
    if (result.rows.length === 0) {
      // Return default draft values
      return res.json({
        profile_id: profileId,
        roles: [],
        expertise_areas: [],
        services_offered: [],
        industries_served: [],
        who_i_help: [],
        languages: [],
        years_experience: "",
        professional_summary: "",
        keywords: [],
        is_available_for_consultation: false,
        cta_text: "Book Consultation",
        impact_statistics: [],
        achievements: [],
        featured_services: [],
        is_published: false,
        status: "draft",
        published_at: null,
        published_by: null,
        section_visibility: {},
        contact_types: [],
        professional_journey: [],
        current_activities: [],
        how_i_help: [],
        services_consultations: [],
        professional_gallery: [],
        publications: [],
        media_interviews: [],
        testimonials: [],
        organizations_associations: [],
        contact_collaboration: {}
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Failed to fetch professional expertise for profile ${profileId}:`, err);
    res.status(500).json({ error: "Failed to fetch professional expertise" });
  }
});

// --- 4.2. Save Professional Expertise (Auth Required) ---
app.post("/api/v1/profiles/:id/professional-expertise", authMiddleware, async (req, res) => {
  const profileId = parseInt(req.params.id, 10);
  const data = req.body;

  try {
    const profileCheck = await query("SELECT id FROM profiles WHERE id = $1", [profileId]);
    if (profileCheck.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const {
      roles,
      expertise_areas,
      services_offered,
      industries_served,
      who_i_help,
      languages,
      years_experience,
      professional_summary,
      keywords,
      is_available_for_consultation,
      cta_text,
      impact_statistics,
      achievements,
      featured_services,
      is_published,
      status,
      section_visibility,
      contact_types,
      professional_journey,
      current_activities,
      how_i_help,
      services_consultations,
      professional_gallery,
      publications,
      media_interviews,
      testimonials,
      organizations_associations,
      contact_collaboration
    } = data;

    const calculatedStatus = status || (is_published ? "published" : "draft");
    const publishedAt = calculatedStatus === "published" ? new Date() : null;
    const publishedBy = calculatedStatus === "published" ? "admin" : null;

    const upsertQuery = `
      INSERT INTO professional_expertise (
        profile_id, roles, expertise_areas, services_offered, industries_served,
        who_i_help, languages, years_experience, professional_summary, keywords,
        is_available_for_consultation, cta_text, impact_statistics, achievements,
        featured_services, is_published, status, published_at, published_by,
        section_visibility, contact_types, professional_journey, current_activities,
        how_i_help, services_consultations, professional_gallery, publications,
        media_interviews, testimonials, organizations_associations, contact_collaboration,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, CURRENT_TIMESTAMP
      )
      ON CONFLICT (profile_id)
      DO UPDATE SET
        roles = EXCLUDED.roles,
        expertise_areas = EXCLUDED.expertise_areas,
        services_offered = EXCLUDED.services_offered,
        industries_served = EXCLUDED.industries_served,
        who_i_help = EXCLUDED.who_i_help,
        languages = EXCLUDED.languages,
        years_experience = EXCLUDED.years_experience,
        professional_summary = EXCLUDED.professional_summary,
        keywords = EXCLUDED.keywords,
        is_available_for_consultation = EXCLUDED.is_available_for_consultation,
        cta_text = EXCLUDED.cta_text,
        impact_statistics = EXCLUDED.impact_statistics,
        achievements = EXCLUDED.achievements,
        featured_services = EXCLUDED.featured_services,
        is_published = EXCLUDED.is_published,
        status = EXCLUDED.status,
        published_at = EXCLUDED.published_at,
        published_by = EXCLUDED.published_by,
        section_visibility = EXCLUDED.section_visibility,
        contact_types = EXCLUDED.contact_types,
        professional_journey = EXCLUDED.professional_journey,
        current_activities = EXCLUDED.current_activities,
        how_i_help = EXCLUDED.how_i_help,
        services_consultations = EXCLUDED.services_consultations,
        professional_gallery = EXCLUDED.professional_gallery,
        publications = EXCLUDED.publications,
        media_interviews = EXCLUDED.media_interviews,
        testimonials = EXCLUDED.testimonials,
        organizations_associations = EXCLUDED.organizations_associations,
        contact_collaboration = EXCLUDED.contact_collaboration,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id;
    `;

    const values = [
      profileId,
      JSON.stringify(roles || []),
      JSON.stringify(expertise_areas || []),
      JSON.stringify(services_offered || []),
      JSON.stringify(industries_served || []),
      JSON.stringify(who_i_help || []),
      JSON.stringify(languages || []),
      years_experience || "",
      professional_summary || "",
      JSON.stringify(keywords || []),
      is_available_for_consultation || false,
      cta_text || "Book Consultation",
      JSON.stringify(impact_statistics || []),
      JSON.stringify(achievements || []),
      JSON.stringify(featured_services || []),
      is_published || false,
      calculatedStatus,
      publishedAt,
      publishedBy,
      JSON.stringify(section_visibility || {}),
      JSON.stringify(contact_types || []),
      JSON.stringify(professional_journey || []),
      JSON.stringify(current_activities || []),
      JSON.stringify(how_i_help || []),
      JSON.stringify(services_consultations || []),
      JSON.stringify(professional_gallery || []),
      JSON.stringify(publications || []),
      JSON.stringify(media_interviews || []),
      JSON.stringify(testimonials || []),
      JSON.stringify(organizations_associations || []),
      JSON.stringify(contact_collaboration || {})
    ];

    const result = await query(upsertQuery, values);
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error(`Failed to save professional expertise for profile ${profileId}:`, err);
    res.status(500).json({ error: "Failed to save professional expertise" });
  }
});

// --- 5. Get Categories with Subcategories ---
app.get("/api/v1/categories", async (req, res) => {
  try {
    const catsResult = await query("SELECT id, name, slug FROM categories ORDER BY id ASC");
    const subcatsResult = await query("SELECT id, category_id, name, slug FROM subcategories ORDER BY id ASC");

    const categories = catsResult.rows.map((cat: any) => ({
      ...cat,
      subcategories: subcatsResult.rows.filter((sub: any) => sub.category_id === cat.id),
    }));

    res.json(categories);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    res.status(500).json({ error: "Failed to fetch categories from database" });
  }
});

// --- 6. Save Category (Auth Required) ---
app.post("/api/v1/categories", authMiddleware, async (req, res) => {
  const cat = req.body;
  if (!cat.name || !cat.slug) {
    return res.status(400).json({ error: "Category Name and Slug are required" });
  }
  try {
    if (cat.id) {
      await query("UPDATE categories SET name = $1, slug = $2 WHERE id = $3", [cat.name, cat.slug, cat.id]);
      res.json({ success: true, id: cat.id });
    } else {
      const result = await query(
        "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
        [cat.name, cat.slug]
      );
      res.json({ success: true, id: result.rows[0].id });
    }
  } catch (err) {
    console.error("Failed to save category:", err);
    res.status(500).json({ error: "Failed to save category" });
  }
});

// --- 7. Delete Category (Auth Required) ---
app.delete("/api/v1/categories/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query("DELETE FROM categories WHERE id = $1", [parseInt(id, 10)]);
    res.json({ success: true });
  } catch (err) {
    console.error(`Failed to delete category with id ${id}:`, err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// --- 8. Save Subcategory (Auth Required) ---
app.post("/api/v1/subcategories", authMiddleware, async (req, res) => {
  const sub = req.body;
  if (!sub.category_id || !sub.name || !sub.slug) {
    return res.status(400).json({ error: "Category ID, Name and Slug are required fields" });
  }
  try {
    if (sub.id) {
      await query("UPDATE subcategories SET category_id = $1, name = $2, slug = $3 WHERE id = $4", [
        parseInt(sub.category_id, 10),
        sub.name,
        sub.slug,
        sub.id,
      ]);
      res.json({ success: true, id: sub.id });
    } else {
      const result = await query(
        "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3) RETURNING id",
        [parseInt(sub.category_id, 10), sub.name, sub.slug]
      );
      res.json({ success: true, id: result.rows[0].id });
    }
  } catch (err) {
    console.error("Failed to save subcategory:", err);
    res.status(500).json({ error: "Failed to save subcategory" });
  }
});

// --- 9. Delete Subcategory (Auth Required) ---
app.delete("/api/v1/subcategories/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query("DELETE FROM subcategories WHERE id = $1", [parseInt(id, 10)]);
    res.json({ success: true });
  } catch (err) {
    console.error(`Failed to delete subcategory with id ${id}:`, err);
    res.status(500).json({ error: "Failed to delete subcategory" });
  }
});

// --- 10. Secure Image Upload (Auth Required + Security Verification + Sharp processing) ---
app.post(
  "/api/v1/upload",
  authMiddleware,
  uploadMiddleware.single("file"),
  processAndUploadImage,
  (req: SecuredUploadRequest, res) => {
    if (!req.optimizedUrl) {
      return res.status(500).json({ error: "Failed to upload and retrieve secure URL" });
    }
    res.json({
      url: req.optimizedUrl,
      thumbnailUrl: req.thumbnailUrl
    });
  }
);

// --- 11. Dynamic XML Sitemap compiled from DB ---
app.get("/api/v1/sitemap.xml", async (req, res) => {
  try {
    const profilesResult = await query("SELECT slug, updated_at FROM profiles");
    const categoriesResult = await query("SELECT slug FROM categories");

    const frontendUrl = process.env.FRONTEND_URL || "https://globalleadersphere.com";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add home
    xml += `  <url>\n`;
    xml += `    <loc>${frontendUrl}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Add categories
    for (const cat of categoriesResult.rows) {
      xml += `  <url>\n`;
      xml += `    <loc>${frontendUrl}/category/${cat.slug}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Add profiles
    for (const profile of profilesResult.rows) {
      const lastMod = profile.updated_at
        ? new Date(profile.updated_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      xml += `  <url>\n`;
      xml += `    <loc>${frontendUrl}/leader/${profile.slug}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>\n`;

    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (err) {
    console.error("Failed to generate sitemap.xml:", err);
    res.status(500).send("Error generating sitemap.xml");
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`   Global Leader Sphere Production API Server     `);
  console.log(`   Namespace Prefix: /api/v1/                     `);
  console.log(`   Port: ${PORT}                                  `);
  console.log(`==================================================`);
});
