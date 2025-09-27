const { pool } = require('../db');

class Prompt {
  static async getAll() {
    try {
      const result = await pool.query('SELECT * FROM prompts ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      throw new Error('Error fetching prompts: ' + error.message);
    }
  }

  static async getByCategory(category) {
    try {
      const result = await pool.query('SELECT * FROM prompts WHERE category = $1 ORDER BY created_at DESC', [category]);
      return result.rows;
    } catch (error) {
      throw new Error('Error fetching prompts by category: ' + error.message);
    }
  }

  static async create(category, imageUrl, promptText) {
    try {
      const result = await pool.query(
        'INSERT INTO prompts (category, image_url, prompt_text) VALUES ($1, $2, $3) RETURNING *',
        [category, imageUrl, promptText]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('Error creating prompt: ' + error.message);
    }
  }

  static async update(id, category, imageUrl, promptText) {
    try {
      const result = await pool.query(
        'UPDATE prompts SET category = $1, image_url = $2, prompt_text = $3 WHERE id = $4 RETURNING *',
        [category, imageUrl, promptText, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('Error updating prompt: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM prompts WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Error deleting prompt: ' + error.message);
    }
  }

  static async getById(id) {
    try {
      const result = await pool.query('SELECT * FROM prompts WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Error fetching prompt by ID: ' + error.message);
    }
  }
}

module.exports = Prompt;