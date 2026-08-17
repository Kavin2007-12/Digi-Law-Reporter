import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env if available
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const { Pool } = pg;

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'digi_law_reporter',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10)
};

console.log('⚡ Connecting to PostgreSQL Database:', dbConfig.database);

const pool = new Pool(dbConfig);

const executeSqlFile = async (filePath) => {
  console.log(`📄 Executing SQL script: ${path.basename(filePath)}`);
  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
};

const runDatabaseSetup = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL Server!');
    client.release();

    // 1. Run Schema Migrations
    const schemaDir = path.join(__dirname, 'schema');
    const sqlFiles = fs.readdirSync(schemaDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of sqlFiles) {
      await executeSqlFile(path.join(schemaDir, file));
    }

    // 2. Run Seed Data
    const seedFile = path.join(__dirname, 'seed/seed_data.sql');
    if (fs.existsSync(seedFile)) {
      await executeSqlFile(seedFile);
    }

    console.log('🎉 Database Schema & Seed Data initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Setup Failed:', error.message);
    console.error('👉 Make sure PostgreSQL server is running and credentials in backend/.env are correct.');
    process.exit(1);
  }
};

runDatabaseSetup();
