const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create tables if they don't exist
const initDB = async () => {
  try {
    const client = await pool.connect();
    
    // Create prompts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        image_url TEXT NOT NULL,
        prompt_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default prompts if table is empty
    const promptCount = await client.query('SELECT COUNT(*) FROM prompts');
    if (parseInt(promptCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO prompts (category, image_url, prompt_text) VALUES
        ('Men', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 'Professional portrait of a confident business person in modern office setting, wearing a stylish navy suit, crisp lighting, contemporary corporate lifestyle'),
        ('Women', 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop', 'Elegant professional woman in modern urban setting, sophisticated business attire, warm natural lighting, contemporary lifestyle aesthetic'),
        ('Couple', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop', 'Happy couple walking together in modern urban setting, stylish casual attire, warm natural lighting, contemporary lifestyle, subtle romance'),
        ('Kids', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop', 'Cheerful children playing in modern playground, bright colorful clothing, world sunny atmosphere, outdoor lighting, joyful family atmosphere')
      `);
    }

    client.release();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

module.exports = { pool, initDB };