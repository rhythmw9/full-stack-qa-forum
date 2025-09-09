import { Router } from "express";
import { query } from "../db.js";

const router = Router();


// Lists all categories
router.get("/", async (_req, res, next) => {
  try {
    const rows = await query(
      "SELECT id, name, slug FROM categories ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});


// Retrieve a single category by slug
router.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const rows = await query(
      "SELECT id, name, slug FROM categories WHERE slug = ? LIMIT 1",
      [slug]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Category not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
