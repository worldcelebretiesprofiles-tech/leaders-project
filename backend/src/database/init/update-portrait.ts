import { query } from "../db";

async function run() {
  try {
    console.log("Updating Dr. Ravuri Balaraju's portrait in database...");
    const res = await query(
      "UPDATE profiles SET portrait = $1 WHERE slug = $2 RETURNING id, name, portrait",
      ["/assets/Bala Raju.jpeg", "dr-ravuri-balaraju"]
    );
    if (res.rows.length === 0) {
      console.log("Profile not found!");
    } else {
      console.log("Updated successfully:", res.rows[0]);
    }
  } catch (err) {
    console.error("Error updating database:", err);
  } finally {
    process.exit(0);
  }
}

run();
