import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

// GET /api/categories
router.get('/', async (req, res) => {
  const { rows } = await query(
    `SELECT id, name, slug, icon, display_order
     FROM categories
     WHERE is_active = TRUE
     ORDER BY display_order ASC`
  );
  res.json(rows);
});

export default router;
