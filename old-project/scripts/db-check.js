const { Pool } = require('pg');
const { spawn } = require('child_process');

// Load environment variables from .env file if present
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'podplai',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
};

const requiredTables = [
  // Add your required table names here
  'users',
  'projects',
  'episodes',
  // Add more tables as needed
];

async function checkDatabaseTables() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('Checking database tables...');
    
    // Query to get all tables in the current database
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('All required tables exist in the database.');
      return true;
    } else {
      console.log(`Missing tables: ${missingTables.join(', ')}`);
      console.log('Running database migrations to create missing tables...');
      
      // Execute the db:push script to run migrations
      return new Promise((resolve, reject) => {
        const child = spawn('npm', ['run', 'db:push'], { 
          stdio: 'inherit',
          shell: true
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            console.log('Database setup completed successfully');
            resolve(true);
          } else {
            console.error('Database setup failed');
            reject(new Error('Database setup failed'));
          }
        });
      });
    }
  } catch (error) {
    console.error('Error checking database tables:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkDatabaseTables()
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
