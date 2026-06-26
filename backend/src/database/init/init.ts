import pg from "pg";
import path from "node:path";
import fs from "node:fs";

// Manually parse .env to get the connection details for initialization
let databaseUrl = "postgres://postgres:postgres@localhost:5432/leader_sphere";

try {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.substring(1, value.length - 1);
        }
        if (key === "DATABASE_URL") {
          databaseUrl = value;
        }
      }
    });
  }
} catch (err) {
  console.warn("Could not parse .env file in init script:", err);
}

// Extract base connection string (to connect to 'postgres' system database)
// to check if target database exists and create it if not.
function getBaseUrl(url: string): { baseUrl: string; dbName: string } {
  try {
    const parsed = new URL(url);
    const dbName = parsed.pathname.substring(1);
    parsed.pathname = "/postgres"; // Connect to default postgres database
    return { baseUrl: parsed.toString(), dbName };
  } catch (e) {
    // Regex fallback if URL parsing fails
    const match = url.match(/^(postgres(?:ql)?:\/\/[^/]+\/)([^?]+)(.*)$/);
    if (match) {
      return { baseUrl: `${match[1]}postgres${match[3]}`, dbName: match[2] };
    }
    return { baseUrl: url, dbName: "leader_sphere" };
  }
}

const { baseUrl, dbName } = getBaseUrl(databaseUrl);

const defaultLeaderData = {
  roles: [
    { icon: "ShieldCheck", label: "Human Rights Advocate" },
    { icon: "Landmark", label: "Founder & Chairman — WHRC" },
    { icon: "Globe2", label: "Country Director — UNPKFC India" },
    { icon: "Briefcase", label: "Entrepreneur" },
    { icon: "Sparkles", label: "UN Geneva Representative" },
  ],
  stats: [
    { value: "2017", label: "WHRC founded" },
    { value: "4,000+", label: "Youth mobilised for peace" },
    { value: "8+", label: "Years of advocacy" },
    { value: "76th", label: "CESCR session, UN Geneva" },
    { value: "16+", label: "National & global awards" },
    { value: "2", label: "States covered (AP & TS)" },
  ],
  bio: [
    { k: "Name", v: "Dr. Ravuri Balaraju" },
    { k: "Place of birth", v: "Andhra Pradesh, India" },
    {
      k: "Education",
      v: "MA Sociology, Dr. B.R. Ambedkar University (2007–2009)",
    },
    { k: "Schooling", v: "St. Paul's High School" },
    {
      k: "Current designation",
      v: "Founder & Chairman, World Human Rights Council (WHRC)",
    },
    { k: "Present location", v: "Hyderabad, Telangana, India" },
    { k: "Organisation website", v: "whrcheadquarters.org · whrc.co.in" },
    { k: "Instagram", v: "@dr.ravuribalaraju" },
    {
      k: "Profession",
      v: "Social reformer, Human rights advocate, Entrepreneur",
    },
    {
      k: "Philosophy",
      v: "Inspired by Dr. B.R. Ambedkar — servant-leadership, education, self-reliance",
    },
  ],
  biography: {
    earlyLife:
      "Dr. Ravuri Balaraju was born in Andhra Pradesh to a family that instilled in him a deep sense of community and social responsibility.",
    career:
      "Dr. Balaraju founded the World Human Rights Council (WHRC) in May 2017 to bridge the gap between grassroots communities and global human rights.",
  },
  timeline: [
    {
      period: "May 2017 – Present",
      title: "Founder & Chairman — World Human Rights Council (WHRC)",
      body: "Built WHRC from the ground up into a comprehensive human rights body operating across Andhra Pradesh and Telangana, with international partnerships and UN representation.",
      highlight: "Founded grassroots movement",
      icon: "ShieldCheck",
      span: "lg:col-span-2",
    },
    {
      period: "Jan 2023 – Sep 2025",
      title: "Country Director India — UNPKFC",
      body: "Mobilised 4,000+ youth for peace initiatives and represented India at UN Geneva during the 76th CESCR session — a historic milestone.",
      highlight: "UN Geneva Representative",
      icon: "Globe2",
      span: "lg:col-span-1",
    },
    {
      period: "2024 – Present",
      title: "Managing Director — Winbal Integrated India",
      body: "Heads Winbal Integrated India, overseeing diversified operations across the real estate and integrated services sector.",
      highlight: "Strategic Business Leadership",
      icon: "Briefcase",
      span: "lg:col-span-1",
    },
    {
      period: "2021 – Present",
      title: "Director — Winbal Windows Private Limited",
      body: "Leads business operations and strategic planning, integrating corporate growth with community-responsible business practices.",
      highlight: "Ethical Entrepreneurship",
      icon: "Building2",
      span: "lg:col-span-1",
    },
    {
      period: "Ongoing",
      title: "Regional Director — IHRA (AP & Telangana)",
      body: "Coordinating regional advocacy programs and connecting local communities with global human rights frameworks.",
      highlight: "Global Advocacy Link",
      icon: "MapPin",
      span: "lg:col-span-1",
    },
  ],
  orgLabel: "Organisation",
  orgTitle: "About World Human Rights Council",
  orgSubtitle: "Founded May 2017 · Active across multiple States",
  orgWebsite: "whrcheadquarters.org",
  orgDescription: "A grassroots-based human rights council dedicated to grievance redressal, legal aid, social equity, and connecting local advocacy with global platforms.",
  orgFocus: [
    "Grievance redressal",
    "Legal aid",
    "Women & child rights",
    "Farmers' welfare",
    "Awareness campaigns",
    "International affairs",
  ],
  initiatives: [
    {
      icon: "Megaphone",
      title: "Anti-drug awareness drives",
      body: "WHRC has conducted large-scale anti-drug awareness campaigns across Telangana and coastal Andhra, targeting youth in schools, colleges, and rural communities. The drives aim to prevent substance abuse through education, peer engagement, and community leadership programs.",
    },
    {
      icon: "Users",
      title: "Youth empowerment & peace mobilisation",
      body: "As Country Director of UNPKFC India, Dr. Balaraju mobilised over 4,000 youth for peace-building activities. WHRC also runs leadership workshops and entrepreneurship awareness sessions, most recently supporting student entrepreneurs at programs in Addanki.",
    },
    {
      icon: "Heart",
      title: "Rural & farmers' welfare",
      body: "Dedicated rural upliftment schemes for farming communities in Andhra Pradesh and Telangana, including awareness on government schemes, legal rights, and access to institutional support. Special focus on small and marginal farmers in coastal Andhra districts.",
    },
    {
      icon: "Scale",
      title: "Legal aid for the marginalised",
      body: "WHRC provides free legal guidance and representation support for victims of discrimination, rights violations, and social injustice. This includes women facing domestic abuse, Dalit communities facing caste discrimination, and labourers facing exploitation.",
    },
    {
      icon: "Globe2",
      title: "UNPKFC India office — 2025",
      body: "A landmark achievement in Dr. Balaraju's international advocacy work: the formal opening of the UNPKFC India office in 2025, establishing a permanent institutional presence for peace and conflict resolution activities in India under his leadership.",
    },
    {
      icon: "ShieldCheck",
      title: "Visakhapatnam awareness drives",
      body: "WHRC has conducted focused civic rights education and anti-discrimination campaigns in Visakhapatnam, expanding its reach to coastal Andhra communities. These drives cover constitutional rights, women's safety, and access to government welfare schemes.",
    },
  ],
  awards: [
    {
      year: "2025",
      title: "Global Peacekeeper Volunteer Initiative",
      org: "GPVI · Bangkok, Thailand",
      body: "Awarded at the Royal Thai Air Force Officers' Club for valuable contributions to the Global Peacekeeper Volunteer Initiative Training Program.",
      img: "/assets/5.jpeg",
    },
    {
      year: "2025",
      title: "Global Leadership Summit 2025",
      org: "UN Anniversary · Bangkok",
      body: "Recognised for active participation in the Global Leadership Summit 2025, held at Kantarat Auditorium in honor of the 80th Anniversary of the United Nations.",
      img: "/assets/7.jpeg",
    },
    {
      year: "2024",
      title: "International Leadership Achievement Award",
      org: "Adventure of Humanity · Bangkok",
      body: "Honored for outstanding leadership and significant contributions to advancing global collaboration and progress at the Airforce Convention Hall.",
      img: "/assets/4.jpeg",
    },
    {
      year: "2023",
      title: "Global Peace & Humanitarian Awards",
      org: "Global Leadership Summit 2023",
      body: "Received the Certificate of Recognition during the Global Leadership Summit in Bangkok for impacting informative perspectives on human rights.",
      img: "/assets/6.jpeg",
    },
    {
      year: "2023",
      title: "Guest of Honor",
      org: "World Human Rights Day Celebrations",
      body: "Invited as Guest of Honor at Indian Heights School for the World Human Rights Day Celebrations organized by WHRC and UNPKFC.",
      img: "/assets/8.jpeg",
    },
    {
      year: "2022",
      title: "Humanity Excellence Awards 2022",
      org: "Humanity Matter · Guntur",
      body: "Conferred for Nobel and Excellent contribution for Peace Building and social welfare activities beyond boundaries.",
      img: "/assets/9.jpeg",
    },
    {
      year: "2022",
      title: "Dr. B.R. Ambedkar Statue Inauguration",
      org: "Special Guest · Varagani",
      body: "Invited as a Special Guest for the historic inauguration of the Dr. B.R. Ambedkar statue by Ambedkar Youth, Varagani.",
      img: "/assets/13.jpeg",
    },
    {
      year: "2021",
      title: "Nelson Mandela Nobel Peace Award",
      org: "Social & Welfare · Mumbai",
      body: "Presented at Sahara Star Mumbai for excellent contribution for Peace Building and serving humanity beyond boundaries.",
      img: "/assets/2.jpeg",
    },
    {
      year: "2021",
      title: "Doctor of Philosophy (Honoris Causa)",
      org: "The American University · USA",
      body: "Conferred the degree of Doctor of Philosophy in Social & Welfare in recognition of authorization bestowed by the Board of World Governing Council.",
      img: "/assets/3.jpeg",
    },
    {
      year: "2017",
      title: "Bharath World Records Certificate",
      org: "Bharath Arts Academy & ABC Foundation",
      body: "Awarded Best Journalist for excellence in journalism during the 2016-2017 awards function at Ravindra Bharathi, Hyderabad.",
      img: "/assets/15.jpeg",
    },
    {
      year: "2017",
      title: "Cultural Book of Records Certificate",
      org: "Bharath Arts Academy & ABC Foundation",
      body: "Registered in the Cultural Book of Records as participant in the 222 Members - 222 Minutes - 222 Awards function.",
      img: "/assets/16.jpeg",
    },
    {
      year: "2017",
      title: "Shanthibharath Award",
      org: "Sikharam Art Theatres · Hyderabad",
      body: "Presented during the 70th Indian Independence Day Celebration for dedicated service to the community.",
      img: "/assets/14.jpeg",
    },
    {
      year: "2017",
      title: "Best Social Service Award",
      org: "Karnataka Chalanachitra Parisrama",
      body: "Recognised for outstanding commitment to grassroots community welfare and social reform.",
      img: "/assets/1.png",
    },
    {
      year: "2010",
      title: "Guest of Honour",
      org: "Sri Aditya Degree College",
      body: "Invited as Guest of Honour at Sri Aditya Degree College, Bhimavaram, for institutional leadership engagement.",
      img: "/assets/11.jpeg",
    },
    {
      year: "2008",
      title: "Guest of Honour",
      org: "WHRC Anniversary · Guntur",
      body: "Recognised during the State Level Seminar and WHRC Anniversary celebrations in Guntur, Andhra Pradesh.",
      img: "/assets/10.jpeg",
    },
    {
      year: "2004",
      title: "NCC Certificate 'A'",
      org: "Ministry of Defence · India",
      body: "Successfully passed the NCC Certificate 'A' examination held in Guntur under the authority of the Ministry of Defence.",
      img: "/assets/12.jpeg",
    },
  ],
  recent: [
    {
      title: "UNPKFC India office inauguration — 2025",
      body: "Dr. Balaraju led the formal establishment and inauguration of the UNPKFC India office in 2025, marking a major milestone in institutionalising India's presence in global peace-keeping frameworks.",
    },
    {
      title: "Student entrepreneurship program — Addanki",
      body: "Attended and addressed a student entrepreneurship awareness program in Addanki, Andhra Pradesh, guiding aspiring student entrepreneurs on leadership and social responsibility.",
    },
    {
      title: "Rights awareness drive — Visakhapatnam",
      body: "Conducted human rights awareness campaigns in Visakhapatnam covering constitutional rights education, anti-discrimination outreach, and access to legal support.",
    },
    {
      title: "CSR leadership conference participation",
      body: "Actively participated in Corporate Social Responsibility (CSR) leadership events, representing the intersection of business and social impact.",
    },
    {
      title: "UN Geneva — 76th CESCR session representation",
      body: "Represented India at the United Nations Headquarters in Geneva during the 76th session of the Committee on Economic, Social and Cultural Rights.",
    },
  ],
  inspirations: [
    {
      name: "Dr. B.R. Ambedkar",
      quote:
        "A great man is different from an eminent one in that he is ready to be the servant of the society.",
      body: "Dr. Ambedkar's servant-leadership model underpins every initiative Dr. Balaraju undertakes through WHRC.",
    },
    {
      name: "Mahatma Jyotiba Phule",
      quote: "Education for all, dignity for all.",
      body: "Phule's lifelong fight against caste discrimination and advocacy for women's education resonates deeply in Dr. Balaraju's focus on gender rights and constitutional awareness campaigns.",
    },
    {
      name: "Vasudhaiva Kutumbakam",
      quote: "The world as one family.",
      body: "The ancient Indian philosophy forms the global vision of WHRC — that human dignity transcends borders, caste, religion, and nationality.",
    },
  ],
  connect: {
    instagram: "@dr.ravuribalaraju",
    website: "whrcheadquarters.org",
    council: "whrc.co.in",
  },
  certificates: [
    {
      image: "/assets/5.jpeg",
      title: "Global Peacekeeper Volunteer Initiative",
      org: "GPVI · Bangkok, Thailand",
      description: "Awarded at the Royal Thai Air Force Officers' Club for valuable contributions.",
      date: "2025-02-15",
      order: 1
    }
  ],
  myInitiatives: [
    {
      id: "init_1",
      title: "Anti-Drug Awareness Campaigns",
      images: [
        {
          image: "/assets/7.jpeg",
          title: "Anti-Drug Awareness Drive Guntur",
          description: "Conducting large-scale anti-drug awareness drives targeting youth in rural communities.",
          order: 1
        }
      ]
    }
  ],
  newsArticles: [
    {
      image: "/assets/4.jpeg",
      title: "Humanitarian Summit Highlights Advocacy",
      description: "A detailed coverage of the humanitarian summit and the role of youth mobilization.",
      source: "National News Agency",
      date: "2025-01-20",
      link: "https://example.com/news",
      order: 1
    }
  ],
  recentActivities: [
    {
      image: "/assets/6.jpeg",
      title: "UN Geneva 76th Session Representation",
      description: "Addressing delegates on economic, social, and cultural rights.",
      date: "2025-03-05",
      location: "Geneva, Switzerland",
      order: 1
    }
  ],
};

async function init() {
  console.log(`Connecting to Postgres system database: ${baseUrl}`);
  const client = new pg.Client({ connectionString: baseUrl });
  await client.connect();

  try {
    // 1. Check if the target database exists
    const checkDb = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (checkDb.rows.length === 0) {
      console.log(`Database '${dbName}' does not exist. Creating it...`);
      // CREATE DATABASE cannot run in a transaction block, so we execute it on standard system connection
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error("Error checking or creating database:", err);
  } finally {
    await client.end();
  }

  // 2. Connect to the actual target database to initialize tables
  console.log(`Connecting to database: ${databaseUrl}`);
  const targetClient = new pg.Client({ connectionString: databaseUrl });
  await targetClient.connect();

  try {
    // Create the categories and subcategories tables first
    console.log("Creating 'categories' and 'subcategories' tables if they do not exist...");
    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS subcategories (
        id SERIAL PRIMARY KEY,
        category_id INT REFERENCES categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_category_subcategory UNIQUE (category_id, name)
      );
    `);

    // Create the profiles table
    console.log("Creating 'profiles' table if it does not exist...");
    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        subtitle VARCHAR(255),
        portrait VARCHAR(500),
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);
    `);

    // Migrate profiles table to add category_id and subcategory_id columns if not present
    console.log("Running migrations on 'profiles' table for categories references...");
    await targetClient.query(`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS category_id INT REFERENCES categories(id) ON DELETE SET NULL;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subcategory_id INT REFERENCES subcategories(id) ON DELETE SET NULL;
    `);

    console.log("Database tables and columns are ready.");

    // Check if categories are empty, if so, seed default categories and subcategories
    const catCheck = await targetClient.query("SELECT COUNT(*) FROM categories");
    const catCount = parseInt(catCheck.rows[0].count, 10);

    let defaultCatId = null;
    let defaultSubcatId = null;

    if (catCount === 0) {
      console.log("Seeding default categories and subcategories...");
      
      // 1. Human Rights & Peace Advocacy
      const cat1 = await targetClient.query(
        "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
        ["Human Rights & Peace Advocacy", "human-rights-peace-advocacy"]
      );
      defaultCatId = cat1.rows[0].id;
      
      const sub1_1 = await targetClient.query(
        "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3) RETURNING id",
        [defaultCatId, "UN Representatives", "un-representatives"]
      );
      defaultSubcatId = sub1_1.rows[0].id;
      
      await targetClient.query(
        "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3)",
        [defaultCatId, "Grassroots Advocates", "grassroots-advocates"]
      );

      // 2. Social Welfare & Reform
      const cat2 = await targetClient.query(
        "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
        ["Social Welfare & Reform", "social-welfare-reform"]
      );
      const cat2Id = cat2.rows[0].id;
      
      await targetClient.query(
        "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3)",
        [cat2Id, "Youth Mobilizers", "youth-mobilizers"]
      );
      await targetClient.query(
        "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3)",
        [cat2Id, "Academic Reformers", "academic-reformers"]
      );

      // 3. Corporate & Entrepreneurship
      const cat3 = await targetClient.query(
        "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
        ["Corporate & Entrepreneurship", "corporate-entrepreneurship"]
      );
      const cat3Id = cat3.rows[0].id;
      
      await targetClient.query(
        "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3)",
        [cat3Id, "Ethical Founders", "ethical-founders"]
      );
      await targetClient.query(
        "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3)",
        [cat3Id, "CSR Executives", "csr-executives"]
      );

      console.log("Categories and subcategories successfully seeded.");
    } else {
      // If categories already exist, fetch the first category and subcategory to use as defaults
      const firstCat = await targetClient.query("SELECT id FROM categories ORDER BY id ASC LIMIT 1");
      if (firstCat.rows.length > 0) {
        defaultCatId = firstCat.rows[0].id;
        const firstSub = await targetClient.query("SELECT id FROM subcategories WHERE category_id = $1 ORDER BY id ASC LIMIT 1", [defaultCatId]);
        if (firstSub.rows.length > 0) {
          defaultSubcatId = firstSub.rows[0].id;
        }
      }
    }

    // Check if profiles are empty
    const checkCount = await targetClient.query("SELECT COUNT(*) FROM profiles");
    const count = parseInt(checkCount.rows[0].count, 10);

    if (count === 0) {
      console.log("No profiles found. Seeding default profile (Dr. Ravuri Balaraju)...");
      const seedQuery = `
        INSERT INTO profiles (slug, name, title, subtitle, portrait, category_id, subcategory_id, data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      const values = [
        "dr-ravuri-balaraju",
        "Dr. Ravuri Balaraju",
        "Founder & Chairman, World Human Rights Council",
        "Founder & Chairman, World Human Rights Council · Social Reformer & Entrepreneur · Hyderabad, Telangana.",
        "/assets/leader-portrait.jpg",
        defaultCatId,
        defaultSubcatId,
        JSON.stringify(defaultLeaderData),
      ];

      await targetClient.query(seedQuery, values);
      console.log("Seeding profile completed successfully!");
    } else {
      console.log(`Database already has ${count} profiles. Updating categories for seeded profiles if NULL...`);
      // Safe fallback update to ensure existing seeded profiles are linked
      if (defaultCatId && defaultSubcatId) {
        await targetClient.query(
          "UPDATE profiles SET category_id = $1, subcategory_id = $2 WHERE category_id IS NULL OR subcategory_id IS NULL",
          [defaultCatId, defaultSubcatId]
        );
        console.log("Profiles classifications updated successfully.");
      }
    }
  } catch (err) {
    console.error("Initialization failed:", err);
    process.exit(1);
  } finally {
    await targetClient.end();
  }

  console.log("Database successfully initialized!");
}

init();
