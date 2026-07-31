import { query } from "./db";
import * as m001 from "./migrations/001_create_schema";
import * as m002 from "./migrations/002_add_admin_auth";
import * as m003 from "./migrations/003_create_professional_expertise";
import * as m004 from "./migrations/004_update_professional_expertise_spec";
import * as m005 from "./migrations/005_create_family_details";
import * as m006 from "./migrations/006_create_app_users";
import * as m007 from "./migrations/007_create_applications";
import * as m008 from "./migrations/008_link_profiles_to_users";
import * as m009 from "./migrations/009_create_profile_versions";
import * as m010 from "./migrations/010_add_audit_and_notifications";
import * as m011 from "./migrations/011_add_analytics";
import * as m012 from "./migrations/012_drop_admins_table";

interface Migration {
  name: string;
  up: string;
  down: string;
}

const migrations: Migration[] = [
  { name: "001_create_schema", up: m001.up, down: m001.down },
  { name: "002_add_admin_auth", up: m002.up, down: m002.down },
  { name: "003_create_professional_expertise", up: m003.up, down: m003.down },
  { name: "004_update_professional_expertise_spec", up: m004.up, down: m004.down },
  { name: "005_create_family_details", up: m005.up, down: m005.down },
  { name: "006_create_app_users", up: m006.up, down: m006.down },
  { name: "007_create_applications", up: m007.up, down: m007.down },
  { name: "008_link_profiles_to_users", up: m008.up, down: m008.down },
  { name: "009_create_profile_versions", up: m009.up, down: m009.down },
  { name: "010_add_audit_and_notifications", up: m010.up, down: m010.down },
  { name: "011_add_analytics", up: m011.up, down: m011.down },
  { name: "012_drop_admins_table", up: m012.up, down: m012.down }
];

async function ensureMigrationTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function runUp() {
  await ensureMigrationTable();
  
  const res = await query("SELECT migration_name FROM schema_migrations");
  const executed = new Set(res.rows.map((r: any) => r.migration_name));

  for (const migration of migrations) {
    const migrationName = migration.name;
    if (executed.has(migrationName)) {
      console.log(`Migration ${migrationName} already executed. Skipping.`);
      continue;
    }

    console.log(`Running migration: ${migrationName}`);
    
    await query("BEGIN");
    try {
      await query(migration.up);
      await query("INSERT INTO schema_migrations (migration_name) VALUES ($1)", [migrationName]);
      await query("COMMIT");
      console.log(`Successfully completed migration: ${migrationName}`);
    } catch (err) {
      await query("ROLLBACK");
      console.error(`Error executing migration ${migrationName}:`, err);
      process.exit(1);
    }
  }
}

async function runDown() {
  await ensureMigrationTable();

  const res = await query("SELECT migration_name FROM schema_migrations ORDER BY id DESC LIMIT 1");
  if (res.rows.length === 0) {
    console.log("No migrations to rollback.");
    return;
  }

  const lastMigrationName = res.rows[0].migration_name;
  const migration = migrations.find(m => m.name === lastMigrationName);

  if (!migration) {
    console.error(`Migration configuration for ${lastMigrationName} not found in runner registry!`);
    process.exit(1);
  }

  console.log(`Rolling back migration: ${lastMigrationName}`);

  await query("BEGIN");
  try {
    await query(migration.down);
    await query("DELETE FROM schema_migrations WHERE migration_name = $1", [lastMigrationName]);
    await query("COMMIT");
    console.log(`Successfully rolled back: ${lastMigrationName}`);
  } catch (err) {
    await query("ROLLBACK");
    console.error(`Error rolling back migration ${lastMigrationName}:`, err);
    process.exit(1);
  }
}

const command = process.argv[2] || "up";
if (command === "up") {
  runUp().then(() => {
    console.log("All migrations executed successfully.");
    process.exit(0);
  }).catch((err) => {
    console.error("Migration execution failed:", err);
    process.exit(1);
  });
} else if (command === "down") {
  runDown().then(() => {
    console.log("Rollback completed successfully.");
    process.exit(0);
  }).catch((err) => {
    console.error("Rollback execution failed:", err);
    process.exit(1);
  });
} else {
  console.error(`Unknown command: ${command}. Use 'up' or 'down'.`);
  process.exit(1);
}
