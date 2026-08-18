import { query } from "../database/db";

export class ProfileRepository {
  static async getProfiles(categoryId?: number, subcategoryId?: number, sortBy = "id", sortOrder = "ASC", limit?: number, offset?: number, status?: string) {
    let queryText = `
      SELECT p.id, p.slug, p.name, p.title, p.subtitle, p.portrait, p.data, p.category_id, p.subcategory_id, p.status, p.owner_id,
             p.current_version_id, p.latest_version_number, p.is_published, p.submitted_at, p.last_published_at, p.change_summary,
             c.name AS category_name, c.slug AS category_slug,
             s.name AS subcategory_name, s.slug AS subcategory_slug,
             pe.roles, pe.expertise_areas, pe.services_offered, pe.industries_served,
             pe.who_i_help, pe.languages, pe.years_experience, pe.professional_summary, pe.keywords,
             pe.is_available_for_consultation, pe.cta_text, pe.impact_statistics, pe.achievements,
             pe.featured_services, pe.is_published AS expertise_is_published,
             pe.status AS expertise_status, pe.published_at, pe.published_by, pe.section_visibility, pe.contact_types,
             pe.professional_journey, pe.current_activities, pe.how_i_help, pe.services_consultations,
             pe.professional_gallery, pe.publications, pe.media_interviews, pe.testimonials,
             pe.organizations_associations, pe.contact_collaboration,
             fd.father_name, fd.mother_name, fd.spouse_name, fd.children, fd.background, fd.images AS family_images,
             p.created_at, p.updated_at 
      FROM profiles p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN professional_expertise pe ON p.id = pe.profile_id
      LEFT JOIN family_details fd ON p.id = fd.profile_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (categoryId) {
      params.push(categoryId);
      queryText += ` AND p.category_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND p.status = $${params.length}`;
    }

    if (subcategoryId) {
      params.push(subcategoryId);
      queryText += ` AND p.subcategory_id = $${params.length}`;
    }

    queryText += ` ORDER BY p.${sortBy} ${sortOrder}`;

    if (limit) {
      params.push(limit);
      queryText += ` LIMIT $${params.length}`;
    }
    if (offset) {
      params.push(offset);
      queryText += ` OFFSET $${params.length}`;
    }

    const result = await query(queryText, params);
    return result.rows;
  }

  static async getProfileBySlug(slug: string) {
    const result = await query(
      `SELECT p.id, p.slug, p.name, p.title, p.subtitle, p.portrait, p.data, p.category_id, p.subcategory_id, p.status, p.owner_id,
              p.current_version_id, p.latest_version_number, p.is_published, p.submitted_at, p.last_published_at, p.change_summary,
              c.name AS category_name, c.slug AS category_slug,
              s.name AS subcategory_name, s.slug AS subcategory_slug,
              pe.roles, pe.expertise_areas, pe.services_offered, pe.industries_served,
              pe.who_i_help, pe.languages, pe.years_experience, pe.professional_summary, pe.keywords,
              pe.is_available_for_consultation, pe.cta_text, pe.impact_statistics, pe.achievements,
              pe.featured_services, pe.is_published AS expertise_is_published,
              pe.status AS expertise_status, pe.published_at, pe.published_by, pe.section_visibility, pe.contact_types,
              pe.professional_journey, pe.current_activities, pe.how_i_help, pe.services_consultations,
              pe.professional_gallery, pe.publications, pe.media_interviews, pe.testimonials,
              pe.organizations_associations, pe.contact_collaboration,
              fd.father_name, fd.mother_name, fd.spouse_name, fd.children, fd.background, fd.images AS family_images,
              p.created_at, p.updated_at 
       FROM profiles p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories s ON p.subcategory_id = s.id
       LEFT JOIN professional_expertise pe ON p.id = pe.profile_id
       LEFT JOIN family_details fd ON p.id = fd.profile_id
       WHERE p.slug = $1`,
      [slug]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async getProfileVersion(versionId: number) {
    const result = await query(
      `SELECT * FROM profile_versions WHERE id = $1`,
      [versionId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async checkProfileExistsById(id: number) {
    const result = await query("SELECT id FROM profiles WHERE id = $1", [id]);
    return result.rows.length > 0;
  }

  static async createProfile(profile: any, categoryId: number | null, subcategoryId: number | null, ownerId?: string, status: string = 'DRAFT') {
    const result = await query(
      `INSERT INTO profiles (slug, name, title, subtitle, portrait, category_id, subcategory_id, data, owner_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        profile.slug,
        profile.name || 'New Profile',
        profile.title || null,
        profile.subtitle || null,
        profile.portrait || null,
        categoryId,
        subcategoryId,
        JSON.stringify(profile.data || {}),
        ownerId || null,
        status
      ]
    );
    return result.rows[0].id;
  }

  static async getProfileByOwnerId(ownerId: string) {
    const result = await query(
      `SELECT p.id, p.slug, p.name, p.title, p.subtitle, p.portrait, p.data, p.category_id, p.subcategory_id, p.status, p.owner_id,
              p.current_version_id, p.latest_version_number, p.is_published, p.submitted_at, p.last_published_at, p.change_summary,
              c.name AS category_name, c.slug AS category_slug,
              s.name AS subcategory_name, s.slug AS subcategory_slug,
              pe.roles, pe.expertise_areas, pe.services_offered, pe.industries_served,
              pe.who_i_help, pe.languages, pe.years_experience, pe.professional_summary, pe.keywords,
              pe.is_available_for_consultation, pe.cta_text, pe.impact_statistics, pe.achievements,
              pe.featured_services, pe.is_published AS expertise_is_published,
              pe.status AS expertise_status, pe.published_at, pe.published_by, pe.section_visibility, pe.contact_types,
              pe.professional_journey, pe.current_activities, pe.how_i_help, pe.services_consultations,
              pe.professional_gallery, pe.publications, pe.media_interviews, pe.testimonials,
              pe.organizations_associations, pe.contact_collaboration,
              fd.father_name, fd.mother_name, fd.spouse_name, fd.children, fd.background, fd.images AS family_images,
              p.created_at, p.updated_at 
       FROM profiles p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories s ON p.subcategory_id = s.id
       LEFT JOIN professional_expertise pe ON p.id = pe.profile_id
       LEFT JOIN family_details fd ON p.id = fd.profile_id
       WHERE p.owner_id = $1`,
      [ownerId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async updateProfilePartial(id: number, partialData: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of Object.keys(partialData)) {
      if (['name', 'title', 'subtitle', 'portrait', 'category_id', 'subcategory_id', 'status', 'slug', 'change_summary'].includes(key)) {
        fields.push(`${key} = $${idx}`);
        values.push(partialData[key]);
        idx++;
      } else if (key === 'data') {
        fields.push(`data = data || $${idx}::jsonb`);
        values.push(JSON.stringify(partialData.data));
        idx++;
      }
    }

    if (fields.length === 0) return;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    if (partialData.status === 'SUBMITTED') {
      fields.push(`submitted_at = CURRENT_TIMESTAMP`);
    }
    values.push(id);
    
    const queryText = `UPDATE profiles SET ${fields.join(', ')} WHERE id = $${idx}`;
    await query(queryText, values);
  }

  static async updateProfile(id: number, profile: any, categoryId: number | null, subcategoryId: number | null) {
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
        id,
      ]
    );
  }

  static async deleteProfile(id: number) {
    await query("DELETE FROM profiles WHERE id = $1", [id]);
  }

  static async getProfessionalExpertise(profileId: number) {
    const result = await query("SELECT * FROM professional_expertise WHERE profile_id = $1", [profileId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async upsertProfessionalExpertise(profileId: number, data: any) {
    const calculatedStatus = data.status || (data.is_published ? "published" : "draft");
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
      JSON.stringify(data.roles || []),
      JSON.stringify(data.expertise_areas || []),
      JSON.stringify(data.services_offered || []),
      JSON.stringify(data.industries_served || []),
      JSON.stringify(data.who_i_help || []),
      JSON.stringify(data.languages || []),
      data.years_experience || "",
      data.professional_summary || "",
      JSON.stringify(data.keywords || []),
      data.is_available_for_consultation || false,
      data.cta_text || "Book Consultation",
      JSON.stringify(data.impact_statistics || []),
      JSON.stringify(data.achievements || []),
      JSON.stringify(data.featured_services || []),
      data.is_published || false,
      calculatedStatus,
      publishedAt,
      publishedBy,
      JSON.stringify(data.section_visibility || {}),
      JSON.stringify(data.contact_types || []),
      JSON.stringify(data.professional_journey || []),
      JSON.stringify(data.current_activities || []),
      JSON.stringify(data.how_i_help || []),
      JSON.stringify(data.services_consultations || []),
      JSON.stringify(data.professional_gallery || []),
      JSON.stringify(data.publications || []),
      JSON.stringify(data.media_interviews || []),
      JSON.stringify(data.testimonials || []),
      JSON.stringify(data.organizations_associations || []),
      JSON.stringify(data.contact_collaboration || {})
    ];

    const result = await query(upsertQuery, values);
    return result.rows[0].id;
  }

  static async getFamilyDetails(profileId: number) {
    const result = await query("SELECT * FROM family_details WHERE profile_id = $1", [profileId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async upsertFamilyDetails(profileId: number, data: any) {
    const upsertQuery = `
      INSERT INTO family_details (
        profile_id, father_name, mother_name, spouse_name, children, background, images, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP
      )
      ON CONFLICT (profile_id)
      DO UPDATE SET
        father_name = EXCLUDED.father_name,
        mother_name = EXCLUDED.mother_name,
        spouse_name = EXCLUDED.spouse_name,
        children = EXCLUDED.children,
        background = EXCLUDED.background,
        images = EXCLUDED.images,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id;
    `;
    const values = [
      profileId,
      data.father_name || "",
      data.mother_name || "",
      data.spouse_name || "",
      JSON.stringify(data.children || []),
      data.background || "",
      JSON.stringify(data.images || [])
    ];

    const result = await query(upsertQuery, values);
    return result.rows[0].id;
  }

  static async getSitemapData() {
    const profilesResult = await query("SELECT slug, updated_at FROM profiles");
    const categoriesResult = await query("SELECT slug FROM categories");
    return { profiles: profilesResult.rows, categories: categoriesResult.rows };
  }
}
