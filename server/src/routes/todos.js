const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// GET /api/todos - list
router.get('/', async (req, res) => {
  try {
    // return ordered by position (ascending) then createdAt as fallback
    const todos = await Todo.find().sort({ position: 1, createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/todos - create
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, alarm, location, links } = req.body;
    // validations
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (title.trim().length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }
    if (description && description.length > 1000) {
      return res.status(400).json({ error: 'Description must be 1000 characters or less' });
    }
    let due
    if (dueDate) {
      due = new Date(dueDate)
      if (isNaN(due.getTime())) return res.status(400).json({ error: 'Invalid dueDate' })
      const startToday = new Date();
      startToday.setHours(0,0,0,0)
      if (due < startToday) return res.status(400).json({ error: 'Due date cannot be in the past' })
    }

    // alarm validation (optional) - allow date/time, must be >= now
    let alarmDate
    if (alarm) {
      alarmDate = new Date(alarm)
      if (isNaN(alarmDate.getTime())) return res.status(400).json({ error: 'Invalid alarm' })
      if (alarmDate < new Date()) return res.status(400).json({ error: 'Alarm cannot be in the past' })
    }

    // location
    const loc = location && typeof location === 'string' ? location.trim() : ''

    // links validation: expect array of strings; max 5
    let linksArr = []
    if (links) {
      if (!Array.isArray(links)) return res.status(400).json({ error: 'Links must be an array' })
      if (links.length > 5) return res.status(400).json({ error: 'Maximum 5 links allowed' })
      for (const u of links) {
        try { new URL(u) } catch (e) { return res.status(400).json({ error: `Invalid link: ${u}` }) }
      }
      linksArr = links.map(s => String(s).trim())
    }

    // determine position: append to end (max position + 1)
    const max = await Todo.findOne().sort({ position: -1 }).select('position').lean();
    const pos = max && typeof max.position === 'number' ? max.position + 1 : 0;
    const todo = new Todo({ title: title.trim(), description: description || '', dueDate: due, alarm: alarmDate, location: loc, links: linksArr, position: pos });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/todos/:id - update title/description
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, alarm, location, links } = req.body;
    // validations for update
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (title.trim().length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }
    if (description && description.length > 1000) {
      return res.status(400).json({ error: 'Description must be 1000 characters or less' });
    }
    const updates = { title: title.trim(), description: description || '' };
    if (typeof dueDate !== 'undefined') {
      if (dueDate === null) updates.dueDate = null
      else {
        const d = new Date(dueDate)
        if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid dueDate' })
        const startToday = new Date(); startToday.setHours(0,0,0,0)
        if (d < startToday) return res.status(400).json({ error: 'Due date cannot be in the past' })
        updates.dueDate = d
      }
    }

    // alarm handling
    if (typeof alarm !== 'undefined') {
      if (alarm === null) updates.alarm = null
      else {
        const a = new Date(alarm)
        if (isNaN(a.getTime())) return res.status(400).json({ error: 'Invalid alarm' })
        if (a < new Date()) return res.status(400).json({ error: 'Alarm cannot be in the past' })
        updates.alarm = a
      }
    }

    // location
    if (typeof location !== 'undefined') updates.location = location ? String(location).trim() : ''

    // links
    if (typeof links !== 'undefined') {
      if (links === null) updates.links = []
      else {
        if (!Array.isArray(links)) return res.status(400).json({ error: 'Links must be an array' })
        if (links.length > 5) return res.status(400).json({ error: 'Maximum 5 links allowed' })
        for (const u of links) {
          try { new URL(u) } catch (e) { return res.status(400).json({ error: `Invalid link: ${u}` }) }
        }
        updates.links = links.map(s => String(s).trim())
      }
    }
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

// PUT /api/todos/order - update order from array of ids
router.put('/order', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
    // iterate and set position according to index
    const ops = ids.map((id, idx) => ({ id, pos: idx }));
    const bulk = ops.map(o => ({ updateOne: { filter: { _id: o.id }, update: { position: o.pos } } }));
    if (bulk.length) await Todo.bulkWrite(bulk);
    const todos = await Todo.find().sort({ position: 1, createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
