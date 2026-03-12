const express = require("express");
const mongoose = require("mongoose");
const Todo = require("../models/Todo");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.use(auth);

router.post("/", async (req, res, next) => {
  try {
    const { title, description } = req.body || {};
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const todo = await Todo.create({
      user: req.user._id,
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      isCompleted: false,
      createdAt: new Date(),
    });
    return res.status(201).json(todo);
  } catch (e) {
    next(e);
  }
});

// GET /api/todos?page=1&limit=10&search=abc&status=all|completed|active
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status : "all";

    const filter = { user: req.user._id };
    if (status === "completed") filter.isCompleted = true;
    if (status === "active") filter.isCompleted = false;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Todo.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Todo.countDocuments(filter),
    ]);

    return res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (e) {
    next(e);
  }
});

router.put("/mark-all/completed", async (req, res, next) => {
  try {
    const result = await Todo.updateMany(
      { user: req.user._id, isCompleted: false },
      { $set: { isCompleted: true } }
    );
    return res.json({ ok: true, modified: result.modifiedCount || 0 });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const todo = await Todo.findOne({ _id: id, user: req.user._id });
    if (!todo) return res.status(404).json({ message: "Not found" });
    return res.json(todo);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const updates = {};
    if ("title" in (req.body || {})) {
      if (typeof req.body.title !== "string" || !req.body.title.trim()) {
        return res.status(400).json({ message: "Title must be a non-empty string" });
      }
      updates.title = req.body.title.trim();
    }
    if ("description" in (req.body || {})) {
      updates.description = typeof req.body.description === "string" ? req.body.description.trim() : "";
    }
    if ("isCompleted" in (req.body || {})) {
      updates.isCompleted = Boolean(req.body.isCompleted);
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: updates },
      { new: true }
    );
    if (!todo) return res.status(404).json({ message: "Not found" });
    return res.json(todo);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const deleted = await Todo.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;

