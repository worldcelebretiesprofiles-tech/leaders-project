import { query } from "../db";

const defaultLeaderData = {
  roles: [
    { icon: "ShieldCheck", label: "Human Rights Advocate" },
    { icon: "Landmark", label: "Founder & Chairman — WHRC" },
    { icon: "Globe2", label: "Country Director — UNPKFC India" },
    { icon: "Briefcase", label: "Entrepreneur" },
    { icon: "Sparkles", label: "UN Geneva Representative" }
  ],
  stats: [
    { value: "2017", label: "WHRC founded" },
    { value: "4,000+", label: "Youth mobilised for peace" },
    { value: "8+", label: "Years of advocacy" },
    { value: "76th", label: "CESCR session, UN Geneva" },
    { value: "3", label: "National & global awards" },
    { value: "2", label: "States covered (AP & TS)" }
  ],
  bio: [
    { k: "Name", v: "Dr. Ravuri Balaraju" },
    { k: "Place of birth", v: "Andhra Pradesh, India" },
    { k: "Education", v: "MA Sociology, Dr. B.R. Ambedkar University (2007–2009)" },
    { k: "Schooling", v: "St. Paul's High School" },
    { k: "Current designation", v: "Founder & Chairman, World Human Rights Council (WHRC)" },
    { k: "Present location", v: "Hyderabad, Telangana, India" },
    { k: "Organisation website", v: "whrcheadquarters.org · whrc.co.in" },
    { k: "Instagram", v: "@dr.ravuribalaraju" },
    { k: "Profession", v: "Social reformer, Human rights advocate, Entrepreneur" },
    { k: "Philosophy", v: "Inspired by Dr. B.R. Ambedkar — servant-leadership, education, self-reliance" }
  ],
  biography: {
    earlyLife: "Dr. Ravuri Balaraju was born in Andhra Pradesh to a family that instilled in him a deep sense of community and social responsibility.",
    career: "Dr. Balaraju founded the World Human Rights Council (WHRC) in May 2017 to bridge the gap between grassroots communities and global human rights."
  },
  timeline: [
    { 
      period: "May 2017 – Present", 
      title: "Founder & Chairman — World Human Rights Council (WHRC)", 
      body: "Built WHRC from the ground up into a comprehensive human rights body operating across Andhra Pradesh and Telangana, with international partnerships and UN representation.",
      highlight: "Founded grassroots movement",
      icon: "ShieldCheck",
      span: "lg:col-span-2"
    },
    { 
      period: "Jan 2023 – Sep 2025", 
      title: "Country Director India — UNPKFC", 
      body: "Mobilised 4,000+ youth for peace initiatives and represented India at UN Geneva during the 76th CESCR session — a historic milestone.",
      highlight: "UN Geneva Representative",
      icon: "Globe2",
      span: "lg:col-span-1"
    },
    { 
      period: "2024 – Present", 
      title: "Managing Director — Winbal Integrated India", 
      body: "Heads Winbal Integrated India, overseeing diversified operations across the real estate and integrated services sector.",
      highlight: "Strategic Business Leadership",
      icon: "Briefcase",
      span: "lg:col-span-1"
    },
    { 
      period: "2021 – Present", 
      title: "Director — Winbal Windows Private Limited", 
      body: "Leads business operations and strategic planning, integrating corporate growth with community-responsible business practices.",
      highlight: "Ethical Entrepreneurship",
      icon: "Building2",
      span: "lg:col-span-1"
    },
    { 
      period: "Ongoing", 
      title: "Regional Director — IHRA (AP & Telangana)", 
      body: "Coordinating regional advocacy programs and connecting local communities with global human rights frameworks.",
      highlight: "Global Advocacy Link",
      icon: "MapPin",
      span: "lg:col-span-1"
    }
  ],
  orgFocus: [
    "Grievance redressal", "Legal aid", "Women & child rights",
    "Farmers' welfare", "Awareness campaigns", "International affairs"
  ],
  initiatives: [
    { icon: "Megaphone", title: "Anti-drug awareness drives", body: "WHRC has conducted large-scale anti-drug awareness campaigns across Telangana and coastal Andhra, targeting youth in schools, colleges, and rural communities. The drives aim to prevent substance abuse through education, peer engagement, and community leadership programs." },
    { icon: "Users", title: "Youth empowerment & peace mobilisation", body: "As Country Director of UNPKFC India, Dr. Balaraju mobilised over 4,000 youth for peace-building activities. WHRC also runs leadership workshops and entrepreneurship awareness sessions, most recently supporting student entrepreneurs at programs in Addanki." },
    { icon: "Heart", title: "Rural & farmers' welfare", body: "Dedicated rural upliftment schemes for farming communities in Andhra Pradesh and Telangana, including awareness on government schemes, legal rights, and access to institutional support. Special focus on small and marginal farmers in coastal Andhra districts." },
    { icon: "Scale", title: "Legal aid for the marginalised", body: "WHRC provides free legal guidance and representation support for victims of discrimination, rights violations, and social injustice. This includes women facing domestic abuse, Dalit communities facing caste discrimination, and labourers facing exploitation." },
    { icon: "Globe2", title: "UNPKFC India office — 2025", body: "A landmark achievement in Dr. Balaraju's international advocacy work: the formal opening of the UNPKFC India office in 2025, establishing a permanent institutional presence for peace and conflict resolution activities in India under his leadership." },
    { icon: "ShieldCheck", title: "Visakhapatnam awareness drives", body: "WHRC has conducted focused civic rights education and anti-discrimination campaigns in Visakhapatnam, expanding its reach to coastal Andhra communities. These drives cover constitutional rights, women's safety, and access to government welfare schemes." }
  ],
  awards: [
    { year: "2017", title: "Best Social Service Award", org: "Karnataka Chalanachitra Parisrama", body: "Recognised for outstanding commitment to grassroots community welfare and social reform during the inaugural year of WHRC.", img: "/assets/1.png" },
    { year: "2025", title: "Global Leadership Achievement", org: "International Recognition", body: "Conferred for exceptional leadership in international human rights advocacy, bridging local community needs with global policy frameworks.", img: "/assets/2.jpeg" },
    { year: "2025", title: "Royal Maharlika Award", org: "Global Honours", body: "A prestigious international honor recognizing humanitarian excellence and a lifelong dedication to upholding global human dignity and peace.", img: "/assets/3.jpeg" },
    { year: "2025", title: "UN Geneva Representation", org: "76th CESCR Session · UN HQ", body: "Honored for representing India at the 76th CESCR session at the United Nations Headquarters, bringing the voices of Telangana and AP to the world stage.", img: "/assets/4.jpeg" },
    { year: "2025", title: "Peace Mobilisation Award", org: "UNPKFC India", body: "Awarded by UNPKFC India for the successful mobilization of over 4,000 youth in national peace-building and conflict resolution initiatives.", img: "/assets/5.jpeg" },
    { year: "2025", title: "Social Reformer Excellence", org: "State Level Recognition", body: "State-level recognition for transformative social impact and dedicated service towards the upliftment of marginalized communities in rural India.", img: "/assets/6.jpeg" },
    { year: "2025", title: "Humanitarian Service Medal", org: "International Human Rights Council", body: "Conferred by the International Human Rights Council for unwavering dedication to providing legal aid and protection to victims of rights violations.", img: "/assets/7.jpeg" },
    { year: "2025", title: "Community Upliftment Honour", org: "Farmers Welfare Association", body: "Recognized by the Farmers Welfare Association for pioneering work in sustainable rural development and advocating for the rights of small-scale farmers.", img: "/assets/8.jpeg" },
    { year: "2025", title: "Youth Icon Award", org: "National Youth Leadership Forum", body: "Honored by the National Youth Leadership Forum as a leading inspiration for the next generation of social reformers and human rights advocates.", img: "/assets/9.jpeg" },
    { year: "2025", title: "Constitutional Awareness Award", org: "Legal Literacy Mission", body: "Awarded for extensive legal literacy campaigns that educated thousands of coastal Andhra residents on their fundamental constitutional rights.", img: "/assets/10.jpeg" },
    { year: "2025", title: "Institutional Builder Award", org: "Leadership Excellence Summit", body: "Recognizing the strategic vision and leadership required to scale WHRC into a multi-program advocacy platform with global partnerships.", img: "/assets/11.jpeg" },
    { year: "2022", title: "Dr.B.R.Ambedkar Statue Inauguration", org: "Special Guest · Varagani", body: "Invited as a Special Guest for the historic inauguration of the Dr. B.R. Ambedkar statue, honoring the legacy of India's social visionary.", img: "/assets/13.jpeg" },
    { year: "2017", title: "Shanthi Bharath Award", org: "Sikharam Art Theatres · Hyderabad", body: "Conferred for significant contributions to social peace and cultural harmony through dedicated community service.", img: "/assets/14.jpeg" },
    { year: "2017", title: "Bharath World Records Certificate", org: "Bharath Arts Academy & ABC Foundation", body: "Achieved a world record recognition at Ravindra Bharathi, Hyderabad, for outstanding humanitarian and cultural contributions.", img: "/assets/15.jpeg" },
    { year: "2017", title: "Cultural Book of Records Certificate", org: "ABC Foundation & ABC Foundation", body: "Recognised for high achievements in cultural preservation and social service leadership activities.", img: "/assets/16.jpeg" },
    { year: "2022", title: "Varagani Statue Inaugral Guest", org: "Community Development", body: "Guest of honour at the Dr. B.R. Ambedkar statue inauguration at Varagani, Andhra Pradesh, promoting his ideas of equality.", img: "/assets/17.jpeg" },
    { year: "2024", title: "Addanki Student Entrepreneur Advisor", org: "State Youth Forum", body: "Mentored student entrepreneurs on business strategy and community integration at the Addanki local leadership meet.", img: "/assets/18.jpeg" }
  ],
  recent: [
    { title: "UN Geneva 76th CESCR Session", body: "Represented civil society issues at the UN Geneva headquarters, advocating for socioeconomic rights and youth empowerment." },
    { title: "UNPKFC National Office 2025", body: "Inaugurated the permanent Indian chapter office, establishing a hub for national peace campaigns." },
    { title: "WHRC Coastal Andhra Grievance Redressal Campaign", body: "Led regional teams to resolve local community and farm grievances in Guntur, Bapatla, and Visakhapatnam." }
  ],
  inspirations: [
    { name: "Dr. B.R. Ambedkar", quote: "Educate. Agitate. Organise.", body: "The legendary architect of the Indian Constitution whose teachings on social justice, community organization, and education form the core guiding light of all WHRC actions." },
    { name: "Buddha", quote: "Be a light unto yourself (Appo Deepo Bhava).", body: "Guided by the principles of compassion, self-determination, and wisdom in leadership and community service." },
    { name: "Nelson Mandela", quote: "It always seems impossible until it's done.", body: "An inspiration for lifelong dedication to peace-building, reconciliation, and the eradication of systemic human inequality." }
  ],
  connect: {
    instagram: "@dr.ravuribalaraju",
    website: "whrcheadquarters.org"
  },
  certificates: [
    { title: "Constitutional Mediation Specialist", issuer: "Advocacy Institute", year: "2018" },
    { title: "Human Rights Policy & Advocacy Cert", issuer: "UN Association of India", year: "2021" }
  ],
  myInitiatives: [
    { title: "Youth Advocacy Program", description: "Training the next generation of civil rights leaders.", icon: "Users" }
  ],
  newsArticles: [
    { title: "Advancing Grassroot Rights: An Interview with Dr. Balaraju", source: "The National Chronicle", date: "May 2026", link: "https://example.com/interview" },
    { title: "WHRC Opens New Grievance Chapters in Telangana", source: "Daily Insight", date: "March 2026", link: "https://example.com/whrc-chapters" }
  ],
  recentActivities: [
    { title: "Conducted grievance redressal seminar", desc: "Addressed legal compliance and mediation strategies for community leaders.", date: "June 18, 2026" },
    { title: "Inaugurated the civic awareness center", desc: "Set up a community support center for legal literacy and counseling.", date: "May 24, 2026" }
  ]
};

async function seed() {
  console.log("Seeding database...");
  
  console.log("Truncating profiles, professional_expertise, categories, and subcategories...");
  await query("TRUNCATE profiles, professional_expertise, categories, subcategories CASCADE;");
  console.log("Truncation complete.");



  // 2. Seed default categories & subcategories if empty
  const catCheck = await query("SELECT COUNT(*) FROM categories");
  const catCount = parseInt(catCheck.rows[0].count, 10);
  let defaultCatId: number | null = null;
  let defaultSubcatId: number | null = null;

  if (catCount === 0) {
    console.log("Seeding categories & subcategories...");
    
    // Category 1
    const cat1 = await query(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
      ["Human Rights & Peace Advocacy", "human-rights-peace-advocacy"]
    );
    defaultCatId = cat1.rows[0].id;
    
    const sub1_1 = await query(
      "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3) RETURNING id",
      [defaultCatId, "UN Representatives", "un-representatives"]
    );
    defaultSubcatId = sub1_1.rows[0].id;
    
    await query(
      "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3)",
      [defaultCatId, "Grassroots Advocates", "grassroots-advocates"]
    );

    // Category 2
    const cat2 = await query(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
      ["Social Welfare & Reform", "social-welfare-reform"]
    );
    const cat2Id = cat2.rows[0].id;
    
    await query(
      "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3)",
      [cat2Id, "Youth Mobilizers", "youth-mobilizers"]
    );

    // Category 3
    const cat3 = await query(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
      ["Corporate & Entrepreneurship", "corporate-entrepreneurship"]
    );
    const cat3Id = cat3.rows[0].id;
    
    await query(
      "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3)",
      [cat3Id, "Ethical Founders", "ethical-founders"]
    );
    
    console.log("Categories & subcategories seeded successfully.");
  } else {
    console.log("Categories already exist. Skipping.");
    const firstCat = await query("SELECT id FROM categories ORDER BY id ASC LIMIT 1");
    if (firstCat.rows.length > 0) {
      defaultCatId = firstCat.rows[0].id;
      const firstSub = await query(
        "SELECT id FROM subcategories WHERE category_id = $1 ORDER BY id ASC LIMIT 1",
        [defaultCatId]
      );
      if (firstSub.rows.length > 0) {
        defaultSubcatId = firstSub.rows[0].id;
      }
    }
  }

  // 3. Seed default profiles if empty
  const profileCheck = await query("SELECT COUNT(*) FROM profiles");
  const profileCount = parseInt(profileCheck.rows[0].count, 10);

  if (profileCount === 0) {
    console.log("Seeding default profile (Dr. Ravuri Balaraju)...");
    const seedQuery = `
      INSERT INTO profiles (slug, name, title, subtitle, portrait, category_id, subcategory_id, data, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PUBLISHED')
    `;
    const values = [
      "dr-ravuri-balaraju",
      "Dr. Ravuri Balaraju",
      "Founder & Chairman, World Human Rights Council",
      "Founder & Chairman, World Human Rights Council · Social Reformer & Entrepreneur · Hyderabad, Telangana.",
      "/assets/leader-portrait.webp",
      defaultCatId,
      defaultSubcatId,
      JSON.stringify(defaultLeaderData)
    ];
    await query(seedQuery, values);
    console.log("Default profile seeded successfully.");
  } else {
    console.log("Profiles already exist. Skipping profile seeding.");
  }

  // 4. Seed default professional expertise if empty
  const ravuriProfile = await query("SELECT id FROM profiles WHERE slug = $1", ["dr-ravuri-balaraju"]);
  if (ravuriProfile.rows.length > 0) {
    const profileId = ravuriProfile.rows[0].id;
    const expertiseCheck = await query("SELECT id FROM professional_expertise WHERE profile_id = $1", [profileId]);
    if (expertiseCheck.rows.length === 0) {
      const expertiseQuery = `
        INSERT INTO professional_expertise (
          profile_id, roles, expertise_areas, services_offered, industries_served,
          who_i_help, languages, years_experience, professional_summary, keywords,
          is_available_for_consultation, cta_text, impact_statistics, achievements,
          featured_services, is_published,
          status, published_at, published_by, section_visibility, contact_types,
          professional_journey, current_activities, how_i_help, services_consultations,
          professional_gallery, publications, media_interviews, testimonials,
          organizations_associations, contact_collaboration
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, CURRENT_TIMESTAMP, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
        )
      `;
      const expertiseValues = [
        profileId,
        JSON.stringify([
          { id: "role-1", label: "Human Rights Pioneer", icon: "ShieldCheck" },
          { id: "role-2", label: "Social Entrepreneur", icon: "Briefcase" },
          { id: "role-3", label: "Leadership Mentor", icon: "GraduationCap" },
          { id: "role-4", label: "UN Geneva Representative", icon: "Globe2" },
          { id: "role-5", label: "Founder & Chairman — WHRC", icon: "Landmark" }
        ]),
        JSON.stringify([
          { name: "Human Rights Advocacy", description: "Providing legal and constitutional advice to protect civil liberties and advocate for marginalized communities.", icon: "ShieldCheck" },
          { name: "Conflict Resolution & Mediation", description: "Mediating disputes in rural areas and resolving community level grievances through structured mediation pathways.", icon: "Scale" },
          { name: "Social Entrepreneurship", description: "Integrating sustainable commercial enterprise with social welfare and civic development.", icon: "Briefcase" },
          { name: "Leadership Development", description: "Training youth leaders and public representatives in servant-leadership and ethical advocacy.", icon: "GraduationCap" },
          { name: "Public Policy Advisory", description: "Advising state departments, councils, and NGOs on statutory alignment and civic outreach.", icon: "Building" },
          { name: "Community Welfare Mobilisation", description: "Building large-scale awareness campaigns, organizing peace rallies, and managing regional relief operations.", icon: "Users" }
        ]),
        JSON.stringify(["Constitutional Consulting", "Leadership Mentoring", "Public Speaking", "Community Mobilization", "Grievance Redressal Workshops"]),
        JSON.stringify([
          { name: "Non-Profit & Advocacy", description: "Directing campaigns and structuring state/regional mediation systems.", image: { secure_url: "/assets/13.jpeg", public_id: "ind_advocacy", alt_text: "Advocacy meet panel", caption: "Panel debate on human rights", uploaded_at: "2026-06-24T00:00:00Z" } },
          { name: "Legal & Mediation Services", description: "Working with advocates to run grievance redressal cells for vulnerable groups.", image: { secure_url: "/assets/7.jpeg", public_id: "ind_legal", alt_text: "Legal desk files", caption: "Grievance filing session", uploaded_at: "2026-06-24T00:00:00Z" } },
          { name: "Corporate CSR & Management", description: "Assisting businesses in building socially-responsible local service models.", image: { secure_url: "/assets/15.jpeg", public_id: "ind_csr", alt_text: "CSR meeting room", caption: "CSR strategy conference", uploaded_at: "2026-06-24T00:00:00Z" } }
        ]),
        JSON.stringify([
          { name: "Grassroots NGOs", description: "Supporting local organizations in building compliance and counseling wings.", image: { secure_url: "/assets/17.jpeg", public_id: "help_ngos", alt_text: "Community group discussion", caption: "Capacity building meetup", uploaded_at: "2026-06-24T00:00:00Z" } },
          { name: "Youth Activists", description: "Empowering next generation peace advocates to prevent substance abuse in rural AP.", image: { secure_url: "/assets/18.jpeg", public_id: "help_youth", alt_text: "Young leaders class", caption: "Student mentoring seminar", uploaded_at: "2026-06-24T00:00:00Z" } },
          { name: "Farming Communities", description: "Providing legal advice and administrative support to small-scale farmers in resolving disputes.", image: { secure_url: "/assets/8.jpeg", public_id: "help_farmers", alt_text: "Rural farmers discussion", caption: "Farmers welfare consultation", uploaded_at: "2026-06-24T00:00:00Z" } }
        ]),
        JSON.stringify(["English", "Telugu", "Hindi"]),
        "25 Years",
        `<p>Dr. Ravuri Balaraju has dedicated over two decades to human rights advocacy and social reform. As the Founder and Chairman of the World Human Rights Council, he has established grievance redressal frameworks and mentored thousands of community workers.</p><p>His work intersects grassroots mobilization, administrative policy advisory, and ethical corporate development. He advises community groups and governmental agencies on civil rights protections and civic leadership training.</p>`,
        JSON.stringify(["human rights advocate", "social reformer", "community mentor", "legal advisor", "civic activist", "youth peacebuilder", "csr strategist"]),
        true,
        "Connect Now",
        JSON.stringify([
          { value: "10,000+", label: "Lives Impacted" },
          { value: "500+", label: "Workshops Conducted" },
          { value: "50+", label: "Regional Chapters" },
          { value: "4,000+", label: "Youth Mobilised" },
          { value: "100+", label: "Corporate Clients" },
          { value: "25+", label: "Years of Advocacy" }
        ]),
        JSON.stringify([
          { title: "Conducted 1000+ Human Rights and Mediation Sessions", description: "Resolved local disputes and legal awareness across Andhra Pradesh and Telangana.", image: { secure_url: "/assets/4.jpeg", public_id: "ach_un", alt_text: "UN Geneva assembly hall", caption: "Delegation briefing at Geneva HQ", uploaded_at: "2026-06-24T00:00:00Z" }, featured: false },
          { title: "Built 50+ Regional Grievance Chapters across South India", description: "Created physical helpline centers for civic grievances.", image: { secure_url: "/assets/7.jpeg", public_id: "ach_chapters", alt_text: "Legal desk files", caption: "Helpline administrative desk", uploaded_at: "2026-06-24T00:00:00Z" }, featured: true },
          { title: "Trained 5000+ Youth Leaders in civic advocacy and rights awareness", description: "Conducted capacity building programs.", image: { secure_url: "/assets/2.jpeg", public_id: "ach_youth", alt_text: "Youth peace rally", caption: "Volunteers group photo", uploaded_at: "2026-06-24T00:00:00Z" }, featured: false },
          { title: "UN Geneva Civil Society Delegation", description: "Represented Indian advocacy groups and highlighted grassroots development strategies at the United Nations.", image: { secure_url: "/assets/3.jpeg", public_id: "ach_geneva", alt_text: "UN assembly briefing", caption: "Briefing delegates at UN Geneva", uploaded_at: "2026-06-24T00:00:00Z" }, featured: false }
        ]),
        JSON.stringify([
          {
            title: "Special Advisory Consultation",
            description: "Providing advisory services on policy alignment, grievance redressal systems, and statutory compliance for international NGOs and community bodies.",
            icon: "ShieldCheck",
            cta: "Request Advisory",
            featured: false
          },
          {
            title: "Leadership Mentorship",
            description: "One-on-one leadership development for emerging human rights defenders, young community organizers, and ethical entrepreneurs.",
            icon: "Users",
            cta: "Apply for Mentorship",
            featured: true
          },
          {
            title: "CSR Consulting Session",
            description: "Helping businesses formulate and execute high-impact local community initiatives that foster long-term goodwill and compliance.",
            icon: "Briefcase",
            cta: "Book CSR Session",
            featured: false
          }
        ]),
        true, // is_published = true
        "published", // status
        "System Seeder", // published_by
        JSON.stringify({
          roles: true,
          journey: true,
          activities: true,
          expertise: true,
          howIHelp: true,
          services: true,
          gallery: true,
          stats: true,
          achievements: true,
          publications: true,
          media: true,
          testimonials: true,
          orgs: true,
          whoIHelp: true,
          languages: true,
          industries: true,
          keywords: true,
          summary: true,
          contact: true
        }), // section_visibility
        JSON.stringify(["Consultation", "Speaking Engagement", "Mentoring"]), // contact_types
        JSON.stringify([
          { id: "pj-1", year: "2017", title: "Founder & Chairman", organization: "World Human Rights Council (WHRC)", description: "Formed the council to advocate for civil liberties and coordinate grassroots grievance clinics.", startDate: "2017", endDate: "Present", image: { secure_url: "/assets/1.png", public_id: "pj_whrc", alt_text: "WHRC Crest", caption: "WHRC Emblem", uploaded_at: "2026-06-24T00:00:00Z" } },
          { id: "pj-2", year: "2023", title: "Country Director India", organization: "UNPKFC", description: "Led national operations for the United Nations Peacekeepers Federal Council in India, mobilizing youth groups.", startDate: "2023", endDate: "2025", image: { secure_url: "/assets/2.jpeg", public_id: "pj_unpkfc", alt_text: "UNPKFC badge", caption: "UNPKFC Emblem", uploaded_at: "2026-06-24T00:00:00Z" } },
          { id: "pj-3", year: "2010", title: "Senior Social Reformer", organization: "Grassroots Community Alliance", description: "Directed local youth literacy and anti-substance abuse drives across coastal Andhra Pradesh.", startDate: "2010", endDate: "2016", image: { secure_url: "/assets/13.jpeg", public_id: "pj_alliance", alt_text: "Grassroots community work", caption: "Advocacy camp in AP", uploaded_at: "2026-06-24T00:00:00Z" } },
          { id: "pj-4", year: "2021", title: "Director", organization: "Winbal Windows Private Limited", description: "Overseeing business operations, aligning corporate social responsibility (CSR) initiatives with community welfare projects.", startDate: "2021", endDate: "Present", image: { secure_url: "/assets/15.jpeg", public_id: "pj_winbal", alt_text: "Winbal windows team meeting", caption: "Winbal office headquarters", uploaded_at: "2026-06-24T00:00:00Z" } }
        ]), // professional_journey
        JSON.stringify([
          { id: "ca-1", title: "UN Geneva Human Rights Representation", description: "Delivering recommendations during the 76th CESCR session at the United Nations HQ in Geneva.", date: "Ongoing", image: { secure_url: "/assets/4.jpeg", public_id: "ca_un_geneva", alt_text: "UN Geneva assembly hall", caption: "United Nations Geneva Session", uploaded_at: "2026-06-24T00:00:00Z" } },
          { id: "ca-2", title: "Grassroots Literacy Campaigns", description: "Conducting constitutional rights awareness seminars for rural communities in AP & Telangana.", date: "Ongoing", image: { secure_url: "/assets/17.jpeg", public_id: "ca_literacy", alt_text: "Grassroots awareness drive", caption: "Literacy seminar at Visakhapatnam", uploaded_at: "2026-06-24T00:00:00Z" } },
          { id: "ca-3", title: "Youth Peace Mobilisation", description: "Directing drug-free awareness campaigns in schools and colleges across AP and Telangana, mobilizing over 4,000 volunteers.", date: "Ongoing", image: { secure_url: "/assets/2.jpeg", public_id: "ca_peace", alt_text: "Youth seminar group", caption: "Anti-drug seminar address", uploaded_at: "2026-06-24T00:00:00Z" } },
          { id: "ca-4", title: "Rural Grievance Redressal Clinics", description: "Setting up weekly grievance camps to offer free legal consultation and mediation support for small-scale farmers.", date: "Ongoing", image: { secure_url: "/assets/7.jpeg", public_id: "ca_grievance", alt_text: "Grievance camp desk", caption: "Grievance camp advisory", uploaded_at: "2026-06-24T00:00:00Z" } }
        ]), // current_activities
        JSON.stringify([
          { name: "Grassroots Legal Clinics", description: "Setting up free advice sessions in remote rural mandals to assist families with legal rights.", icon: "Scale", image: { secure_url: "/assets/7.jpeg", public_id: "hih_legal_clinic", alt_text: "Legal clinic guidance", caption: "Direct mediation clinic in AP", uploaded_at: "2026-06-24T00:00:00Z" } },
          { name: "Youth Peace Mentoring", description: "Coaching young activists to lead non-violent advocacy movements in their communities.", icon: "Users", image: { secure_url: "/assets/2.jpeg", public_id: "hih_youth_peace", alt_text: "Students listening to presentation", caption: "Youth peace rally program", uploaded_at: "2026-06-24T00:00:00Z" } },
          { name: "NGO Policy Alignment", description: "Helping local non-profits structure their grievance redressal and civil rights frameworks to comply with international regulations.", icon: "ShieldCheck", image: { secure_url: "/assets/13.jpeg", public_id: "hih_ngo_policy", alt_text: "Advocacy meeting discussion", caption: "NGO alignment briefing", uploaded_at: "2026-06-24T00:00:00Z" } },
          { name: "Corporate CSR Strategy", description: "Advising companies on designing impactful corporate social responsibility programs that address real community needs.", icon: "Briefcase", image: { secure_url: "/assets/15.jpeg", public_id: "hih_csr", alt_text: "Corporate CSR presentation", caption: "Corporate CSR briefing", uploaded_at: "2026-06-24T00:00:00Z" } }
        ]), // how_i_help
        JSON.stringify([
          {
            title: "Special Advisory Consultation",
            description: "Direct briefing and policy advisory on civic and legal mediation pathways for NGOs and community groups.",
            image: { secure_url: "/assets/6.jpeg", public_id: "serv_advisory", alt_text: "Consultation advisory", caption: "Advisory session at Hyderabad", uploaded_at: "2026-06-24T00:00:00Z" },
            ctaText: "Schedule Briefing",
            featured: false
          },
          {
            title: "Speaking Keynote Programs",
            description: "Custom addresses and lectures on constitutional rights, grassroots peace-building, and ethical leadership.",
            image: { secure_url: "/assets/5.jpeg", public_id: "serv_keynote", alt_text: "Podium speech by Dr. Balaraju", caption: "Keynote presentation at national summit", uploaded_at: "2026-06-24T00:00:00Z" },
            ctaText: "Book Speaking",
            featured: true
          },
          {
            title: "Leadership Mentoring Session",
            description: "One-on-one sessions for young social entrepreneurs and peace builders to scale their impact.",
            image: { secure_url: "/assets/2.jpeg", public_id: "serv_mentoring", alt_text: "Mentoring session", caption: "Coaching session in Hyderabad", uploaded_at: "2026-06-24T00:00:00Z" },
            ctaText: "Apply for Mentoring",
            featured: false
          }
        ]), // services_consultations (this is what maps to servicesConsultations in UI)
        JSON.stringify([
          {
            image: { secure_url: "/assets/8.jpeg", public_id: "gal_award", alt_text: "Receiving Royal Maharlika Award", caption: "Royal Maharlika Honor ceremony", uploaded_at: "2026-06-24T00:00:00Z" },
            title: "Royal Maharlika Award Ceremony",
            description: "Receiving recognition for humanitarian contributions in 2025.",
            date: "2025"
          },
          {
            image: { secure_url: "/assets/14.jpeg", public_id: "gal_shanthi", alt_text: "Group photo at Ravindra Bharathi", caption: "Shanthi Bharath awardees meet", uploaded_at: "2026-06-24T00:00:00Z" },
            title: "Shanthi Bharath Awards Meet",
            description: "Gathering of social reformers in Hyderabad, 2017.",
            date: "2017"
          },
          {
            image: { secure_url: "/assets/4.jpeg", public_id: "gal_un_geneva", alt_text: "Dr. Balaraju inside UN Geneva assembly hall", caption: "Addressing delegates at UN Geneva", uploaded_at: "2026-06-24T00:00:00Z" },
            title: "UN Geneva 76th CESCR Session",
            description: "Delivered regional reports to United Nations committee representatives.",
            date: "2025"
          },
          {
            image: { secure_url: "/assets/13.jpeg", public_id: "gal_varagani", alt_text: "Varagani statue guest address", caption: "Varagani statue inaugural speech", uploaded_at: "2026-06-24T00:00:00Z" },
            title: "Varagani Statue Inauguration",
            description: "Attended as Chief Guest for the Dr. B.R. Ambedkar statue installation, promoting equality.",
            date: "2022"
          },
          {
            image: { secure_url: "/assets/18.jpeg", public_id: "gal_addanki", alt_text: "Mentoring students at Addanki", caption: "Student entrepreneur meet at Addanki", uploaded_at: "2026-06-24T00:00:00Z" },
            title: "Addanki Student Entrepreneur Summit",
            description: "Mentoring young minds on building sustainable business ventures.",
            date: "2024"
          }
        ]), // professional_gallery
        JSON.stringify([
          {
            id: "pub-1",
            title: "Human Rights Handbook for Grassroots Workers",
            publisher: "WHRC Press",
            date: "2022",
            link: "https://example.com/handbook",
            featured: true,
            description: "A comprehensive manual guiding local advocates on human rights mediation and constitutional protections.",
            image: { secure_url: "/assets/15.jpeg", public_id: "pub_1", alt_text: "Handbook cover", caption: "Official WHRC manual cover", uploaded_at: "2026-06-24T00:00:00Z" }
          },
          {
            id: "pub-2",
            title: "Youth Peacebuilding & Civic Responsibility",
            publisher: "UNPKFC Journal",
            date: "2024",
            link: "https://example.com/peacebuilding",
            featured: false,
            description: "A research paper detailing effective strategies to mobilize youth against drugs and build community leaders.",
            image: { secure_url: "/assets/16.jpeg", public_id: "pub_2", alt_text: "Research paper cover", caption: "UNPKFC Research Journal article", uploaded_at: "2026-06-24T00:00:00Z" }
          },
          {
            id: "pub-3",
            title: "Mediation Pathways in Rural Communities",
            publisher: "Legal Literacy Press",
            date: "2020",
            link: "https://example.com/mediation",
            featured: false,
            description: "A guide to resolving local agrarian and land disputes through peaceful arbitration.",
            image: { secure_url: "/assets/1.png", public_id: "pub_3", alt_text: "Mediation guide cover", caption: "Mediation guide cover page", uploaded_at: "2026-06-24T00:00:00Z" }
          }
        ]), // publications
        JSON.stringify([
          {
            title: "Interview on Spiritual and Social Reform",
            description: "Broadcasted on national television, exploring how legal mediation and community service intersect.",
            image: { secure_url: "/assets/3.jpeg", public_id: "med_tv", alt_text: "TV Studio interview screenshot", caption: "Live broadcast studio", uploaded_at: "2026-06-24T00:00:00Z" },
            link: "https://example.com/interview",
            date: "2025"
          },
          {
            title: "Grassroots Grievance Redressal Feature",
            description: "A detailed documentary on WHRC's legal help desks operating in rural Telangana and AP.",
            image: { secure_url: "/assets/6.jpeg", public_id: "med_doc", alt_text: "Legal desk documentation video", caption: "Grievance redressal documentary cover", uploaded_at: "2026-06-24T00:00:00Z" },
            link: "https://example.com/documentary",
            date: "2024"
          },
          {
            title: "Youth Mobilisation for Peace Interview",
            description: "Discussion with global delegates on creating youth-led community centers.",
            image: { secure_url: "/assets/2.jpeg", public_id: "med_peace", alt_text: "Peace summit panel discussion", caption: "Panel debate in New Delhi", uploaded_at: "2026-06-24T00:00:00Z" },
            link: "https://example.com/peace-interview",
            date: "2025"
          }
        ]), // media_interviews
        JSON.stringify([
          {
            id: "test-1",
            name: "P. Ramakrishna",
            designation: "Rural Community Organizer",
            testimonial: "Dr. Ravuri Balaraju's guidance in legal mediation has transformed our grievance resolution process in local villages.",
            featured: true,
            image: { secure_url: "/assets/10.jpeg", public_id: "test_1", alt_text: "Ramakrishna portrait", caption: "Ramakrishna profile", uploaded_at: "2026-06-24T00:00:00Z" }
          },
          {
            id: "test-2",
            name: "Sarah D'Souza",
            designation: "UN Geneva Liaison Coordinator",
            testimonial: "An inspiring leader whose reports on regional human rights challenges have provided valuable insights to our international sessions.",
            featured: false,
            image: { secure_url: "/assets/4.jpeg", public_id: "test_2", alt_text: "Sarah D'Souza profile", caption: "Liaison Coordinator", uploaded_at: "2026-06-24T00:00:00Z" }
          },
          {
            id: "test-3",
            name: "M. Srinivas Rao",
            designation: "Entrepreneur & Youth Activist",
            testimonial: "Mentoring under Dr. Balaraju helped me launch Winbal CSR initiatives, creating active employment for youth in our village.",
            featured: false,
            image: { secure_url: "/assets/6.jpeg", public_id: "test_3", alt_text: "Srinivas Rao profile", caption: "Winbal employee coordinator", uploaded_at: "2026-06-24T00:00:00Z" }
          }
        ]), // testimonials
        JSON.stringify([
          {
            name: "World Human Rights Council (WHRC)",
            position: "Founder & Chairman",
            description: "Directing South India advocacy, organizing grievance redressal cells, and establishing regional mediation chapters.",
            logo: { secure_url: "/assets/1.png", public_id: "org_whrc", alt_text: "WHRC crest logo", caption: "WHRC Emblem", uploaded_at: "2026-06-24T00:00:00Z" }
          },
          {
            name: "UNPKFC India",
            position: "Country Director",
            description: "Coordinating national youth peace-building programs and leading UN delegations.",
            logo: { secure_url: "/assets/2.jpeg", public_id: "org_unpkfc", alt_text: "UNPKFC badge logo", caption: "UNPKFC Emblem", uploaded_at: "2026-06-24T00:00:00Z" }
          },
          {
            name: "Winbal Integrated India",
            position: "Managing Director",
            description: "Designing business strategies centered on ethical operations and local employment.",
            logo: { secure_url: "/assets/15.jpeg", public_id: "org_winbal", alt_text: "Winbal Integrated crest logo", caption: "Winbal Emblem", uploaded_at: "2026-06-24T00:00:00Z" }
          }
        ]), // organizations_associations
        JSON.stringify({
          ctaText: "Request Consultation",
          description: "Reach out to schedule speaking engagements, human rights advisory briefings, or NGO structural mentoring.",
          image: { secure_url: "/assets/6.jpeg", public_id: "contact_banner", alt_text: "Dr. Balaraju writing at office desk", caption: "Office administrative chambers", uploaded_at: "2026-06-24T00:00:00Z" }
        }) // contact_collaboration
      ];
      await query(expertiseQuery, expertiseValues);
      console.log("Default professional expertise seeded successfully.");
    } else {
      console.log("Professional expertise already seeded. Skipping.");
    }
  }
}

seed()
  .then(() => {
    console.log("Seeding completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
