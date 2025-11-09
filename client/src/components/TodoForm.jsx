import React, { useState } from 'react'

const API = '/api/todos'

export default function TodoForm({ onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      const body = { title, description };
      if (dueDate) body.dueDate = dueDate;
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const newTodo = await res.json()
      onCreated && onCreated(newTodo)
      setTitle('')
      setDescription('')
      setDueDate('')
    } finally { setLoading(false) }
  }

  return (
    <form className="todo-form glass" onSubmit={submit}>
      <input
        className="title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new task..."
        required
      />
      <input
        className="desc-input"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional description"
      />
      <input
        className="date-input"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        aria-label="Due date"
      />
      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Adding…' : 'Add'}
      </button>
    </form>
  )
}
