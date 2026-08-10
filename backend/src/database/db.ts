import pg from "pg";
import path from "node:path";
import fs from "node:fs";

// Manually parse .env in development to ensure DATABASE_URL is available in the Node process
if (typeof process !== "undefined" && process.env) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      envContent.split(/\r?\n/).forEach((line) => {
        // Match key=value ignoring comments
        const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          // Strip quotes if any
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.substring(1, value.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (err) {
    console.warn("Failed to load .env file manually:", err);
  }
}

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/leader_sphere";

let pool: pg.Pool | null = null;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const isLocalhost = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

    pool = new pg.Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
    });

    pool.on("error", (err) => {
      console.error("Unexpected error on idle PostgreSQL client", err);
    });
  }
  return pool;
}

export async function getClient(): Promise<pg.PoolClient> {
  return await getPool().connect();
}

export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await getPool().query(text, params);
    const duration = Date.now() - start;
    return res;
  } catch (err) {
    console.error("PostgreSQL Query Error:", {
      text,
      error: err instanceof Error ? err.message : err,
    });
    throw err;
  }
}
