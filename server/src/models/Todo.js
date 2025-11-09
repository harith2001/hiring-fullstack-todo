const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    done: { type: Boolean, default: false },
    dueDate: { type: Date },
    alarm: { type: Date },
    location: { type: String, default: '' },
    links: { type: [String], default: [] },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Todo', todoSchema);
