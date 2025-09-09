// Questions & Answers routes 

import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();


// Lists all questions for a given category
router.get("/", async (req, res, next) => {
  try {
    const slug = String(req.query.category || "").trim();
    if (!slug) return res.status(400).json({ error: "category query param is required" });

    const cats = await query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [slug]);
    if (!cats.length) return res.status(404).json({ error: "Category not found" });

    const categoryId = cats[0].id;

    // Get questions in this category
    const questions = await query(
      `SELECT q.id,
              q.title,
              q.body,
              q.created_at AS createdAt,
              u.username AS authorUsername,
              c.slug AS categorySlug
       FROM questions q
       JOIN users u ON u.id = q.author_id
       JOIN categories c ON c.id = q.category_id
       WHERE q.category_id = ?
       ORDER BY q.created_at DESC`,
      [categoryId]
    );

    if (!questions.length) return res.json([]); // no questions yet

    // Get all answers for these questions in one go
    const ids = questions.map((q) => q.id);
    const placeholders = ids.map(() => "?").join(",");
    const answers = await query(
      `SELECT a.id,
              a.question_id AS questionId,
              a.body,
              a.created_at AS createdAt,
              u.username AS authorUsername
       FROM answers a
       JOIN users u ON u.id = a.author_id
       WHERE a.question_id IN (${placeholders})
       ORDER BY a.created_at ASC`,
      ids
    );

    // Group answers by questionId
    const map = {};
    for (const ans of answers) {
      (map[ans.questionId] ||= []).push({
        id: ans.id,
        body: ans.body,
        createdAt: ans.createdAt,
        authorUsername: ans.authorUsername,
      });
    }

    const out = questions.map((q) => ({
      ...q,
      answers: map[q.id] || [],
    }));

    res.json(out);
  } catch (err) {
    next(err);
  }
});


// Creates a new question, validates it and sends it to database
router.post("/", requireAuth, async (req, res, next) => {
  try {
    let { title, body, categorySlug } = req.body || {};
    title = String(title || "").trim();
    body = String(body || "").trim();
    categorySlug = String(categorySlug || "").trim();

    if (!title || !body || !categorySlug) {
      return res.status(400).json({ error: "title, body, and categorySlug are required" });
    }
    if (title.length < 3) return res.status(400).json({ error: "Title too short" });
    if (body.length < 3) return res.status(400).json({ error: "Body too short" });

    const cats = await query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [categorySlug]);
    if (!cats.length) return res.status(400).json({ error: "Invalid category" });

    const categoryId = cats[0].id;

    const result = await query(
      "INSERT INTO questions (category_id, author_id, title, body) VALUES (?, ?, ?, ?)",
      [categoryId, req.user.id, title, body]
    );

    // Return the created question (without answers)
    const created = await query(
      `SELECT q.id,
              q.title,
              q.body,
              q.created_at AS createdAt,
              u.username AS authorUsername,
              c.slug AS categorySlug
       FROM questions q
       JOIN users u ON u.id = q.author_id
       JOIN categories c ON c.id = q.category_id
       WHERE q.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ ...created[0], answers: [] });
  } catch (err) {
    next(err);
  }
});


// Adds an answer to a specific question
router.post("/:id/answers", requireAuth, async (req, res, next) => {
  try {
    const questionId = Number(req.params.id);
    const answerBody = String((req.body && req.body.body) || "").trim();

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({ error: "Invalid question id" });
    }
    if (!answerBody || answerBody.length < 2) {
      return res.status(400).json({ error: "Answer body too short" });
    }

    // Ensure question exists
    const exists = await query("SELECT id FROM questions WHERE id = ? LIMIT 1", [questionId]);
    if (!exists.length) return res.status(404).json({ error: "Question not found" });

    const result = await query(
      "INSERT INTO answers (question_id, author_id, body) VALUES (?, ?, ?)",
      [questionId, req.user.id, answerBody]
    );

    const created = await query(
      `SELECT a.id,
              a.question_id AS questionId,
              a.body,
              a.created_at AS createdAt,
              u.username AS authorUsername
       FROM answers a
       JOIN users u ON u.id = a.author_id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
});


// Retrievs a single question by id along with its answers
router.get("/:id", async (req, res, next) => {
  try {
    const questionId = Number(req.params.id);
    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const rows = await query(
      `SELECT q.id,
              q.title,
              q.body,
              q.created_at AS createdAt,
              u.username AS authorUsername,
              c.slug AS categorySlug
       FROM questions q
       JOIN users u ON u.id = q.author_id
       JOIN categories c ON c.id = q.category_id
       WHERE q.id = ?`,
      [questionId]
    );
    if (!rows.length) return res.status(404).json({ error: "Question not found" });

    const answers = await query(
      `SELECT a.id,
              a.question_id AS questionId,
              a.body,
              a.created_at AS createdAt,
              u.username AS authorUsername
       FROM answers a
       JOIN users u ON u.id = a.author_id
       WHERE a.question_id = ?
       ORDER BY a.created_at ASC`,
      [questionId]
    );

    res.json({ ...rows[0], answers });
  } catch (err) {
    next(err);
  }
});

export default router;
