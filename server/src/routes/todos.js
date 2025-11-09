const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// GET /api/todos - list
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/todos - create
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const todo = new Todo({ title, description, dueDate: dueDate ? new Date(dueDate) : undefined });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/todos/:id - update title/description
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const updates = { title, description };
    if (typeof dueDate !== 'undefined') updates.dueDate = dueDate ? new Date(dueDate) : null;
    const todo = await Todo.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!todo) return res.status(404).json({ error: 'Not found' });
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/todos/:id/done - toggle done
router.patch('/:id/done', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Not found' });
    todo.done = !todo.done;
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
