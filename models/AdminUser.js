const { pool } = require('../db');
const bcrypt = require('bcrypt');

class AdminUser {
  static async create(username, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const result = await pool.query(
        'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
        [username, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('Error creating admin user: ' + error.message);
    }
  }

  static async findByUsername(username) {
    try {
      const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Error finding admin user: ' + error.message);
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error('Error validating password: ' + error.message);
    }
  }
}

module.exports = AdminUser;