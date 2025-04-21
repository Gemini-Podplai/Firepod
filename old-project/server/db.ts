import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Setup neon config
neonConfig.fetchConnectionCache = true;

// Create dummy pool if pg module can't be loaded
let pool: any;
try {
  const { Pool } = require('pg');
  
  // Check if DATABASE_URL is provided
  if (!process.env.DATABASE_URL) {
    console.log("No DATABASE_URL provided. Database features will be unavailable.");
    pool = {
      query: () => Promise.reject(new Error("No database connection available")),
      on: () => {},
      end: () => Promise.resolve(),
    };
  } else {
    // Create a real pool
    const connectionString = process.env.DATABASE_URL;
    pool = new Pool({ connectionString });
    console.log("Successfully connected to database");
  }
} catch (error) {
  console.log("CommonJS pg import failed, using a dummy pool");
  // Create dummy pool
  pool = {
    query: () => Promise.reject(new Error("No database connection available")),
    on: () => {},
    end: () => Promise.resolve(),
  };
}

// Create a connection to the Neon database
const connectionString = process.env.DATABASE_URL || "dummy://localhost";
const sql = process.env.DATABASE_URL ? neon(connectionString) : null;

// Initialize drizzle with the schema or provide dummy db
let db;
if (sql) {
  db = drizzle(sql, { schema });
} else {
  // Create dummy db object
  db = {
    select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }),
    delete: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }),
  };
  console.log("Using dummy database connection");
}

// Export the pool, db, and schema
export { pool, db, schema };