const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    done: { type: Boolean, default: false },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Todo', todoSchema);
