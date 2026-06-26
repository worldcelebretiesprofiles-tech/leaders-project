import { query } from "../db";

async function run() {
  try {
    const res = await query("SELECT id, name FROM profiles WHERE slug = 'dr-ravuri-balaraju'");
    if (res.rows.length === 0) {
      console.log("No profile found with slug 'dr-ravuri-balaraju'");
      return;
    }
    const profile = res.rows[0];
    console.log("Found Profile:", profile);

    const expRes = await query("SELECT * FROM professional_expertise WHERE profile_id = $1", [profile.id]);
    if (expRes.rows.length === 0) {
      console.log("No professional_expertise found for profile id:", profile.id);
      return;
    }
    const exp = expRes.rows[0];
    console.log("Section Visibility:", exp.section_visibility);
    console.log("Journey count:", exp.professional_journey?.length);
    console.log("Activities count:", exp.current_activities?.length);
    console.log("Expertise Areas count:", exp.expertise_areas?.length);
    console.log("How I Help count:", exp.how_i_help?.length);
    console.log("Services count:", exp.services_consultations?.length);
    console.log("Gallery count:", exp.professional_gallery?.length);
    console.log("Stats count:", exp.impact_statistics?.length);
    console.log("Achievements count:", exp.achievements?.length);
    console.log("Publications count:", exp.publications?.length);
    console.log("Media count:", exp.media_interviews?.length);
    console.log("Testimonials count:", exp.testimonials?.length);
    console.log("Orgs count:", exp.organizations_associations?.length);
    console.log("Who I Help count:", exp.who_i_help?.length);
    console.log("Industries count:", exp.industries_served?.length);
    console.log("Keywords count:", exp.keywords?.length);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
