const express = require('express');
const { body, validationResult } = require('express-validator');
const Prompt = require('../models/Prompt');
const router = express.Router();

// Middleware to check for admin authentication
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// GET /api/prompts - Get all prompts or by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let prompts;
    
    if (category && category !== 'All') {
      prompts = await Prompt.getByCategory(category);
    } else {
      prompts = await Prompt.getAll();
    }
    
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// POST /api/prompts - Create new prompt (admin only)
router.post('/', 
  requireAuth,
  [
    body('category').notEmpty().trim().escape(),
    body('image_url').isURL().withMessage('Must be a valid URL'),
    body('prompt_text').notEmpty().trim().isLength({ min: 10, max: 1000 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { category, image_url, prompt_text } = req.body;
      const newPrompt = await Prompt.create(category, image_url, prompt_text);
      
      res.status(201).json(newPrompt);
    } catch (error) {
      console.error('Error creating prompt:', error);
      res.status(500).json({ error: 'Failed to create prompt' });
    }
  }
);

// PUT /api/prompts/:id - Update prompt (admin only)
router.put('/:id', 
  requireAuth,
  [
    body('category').notEmpty().trim().escape(),
    body('image_url').isURL().withMessage('Must be a valid URL'),
    body('prompt_text').notEmpty().trim().isLength({ min: 10, max: 1000 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { category, image_url, prompt_text } = req.body;
      
      const updatedPrompt = await Prompt.update(id, category, image_url, prompt_text);
      
      if (!updatedPrompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }
      
      res.json(updatedPrompt);
    } catch (error) {
      console.error('Error updating prompt:', error);
      res.status(500).json({ error: 'Failed to update prompt' });
    }
  }
);

// DELETE /api/prompts/:id - Delete prompt (admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPrompt = await Prompt.delete(id);
    
    if (!deletedPrompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

module.exports = router;