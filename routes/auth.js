const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');
const router = express.Router();

// POST /api/login - Admin login
router.post('/', 
  [
    body('username').notEmpty().trim().escape(),
    body('password').notEmpty().isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;
      
      // Check environment variables first (for initial setup)
      const envUsername = process.env.ADMIN_USERNAME;
      const envPassword = process.env.ADMIN_PASSWORD;
      
      if (username === envUsername && password === envPassword) {
        req.session.isAdmin = true;
        req.session.username = username;
        return res.json({ 
          success: true, 
          message: 'Login successful',
          user: { username }
        });
      }
      
      // Check database for admin users
      const adminUser = await AdminUser.findByUsername(username);
      if (!adminUser) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isValidPassword = await AdminUser.validatePassword(password, adminUser.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      req.session.isAdmin = true;
      req.session.username = username;
      req.session.userId = adminUser.id;
      
      res.json({ 
        success: true, 
        message: 'Login successful',
        user: { 
          id: adminUser.id,
          username: adminUser.username 
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// POST /api/logout - Admin logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// GET /api/auth/status - Check authentication status
router.get('/status', (req, res) => {
  if (req.session && req.session.isAdmin) {
    res.json({ 
      authenticated: true, 
      username: req.session.username 
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;