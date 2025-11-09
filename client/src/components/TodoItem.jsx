import React, { useState } from 'react'
import { toast } from 'react-toastify'

const API_BASE = '/api/todos'

function formatDate(d) {
  if (!d) return null
  const dt = new Date(d)
  return dt.toLocaleDateString()
}

export default function TodoItem({ todo, setTodos, index }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [desc, setDesc] = useState(todo.description || '')
  const [saving, setSaving] = useState(false)
  const [dueInput, setDueInput] = useState(todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0,10) : '')

  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null
  const today = new Date()
  const isSameDay = (a, b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
  const status = dueDate ? (isSameDay(dueDate, today) ? 'today' : (dueDate < new Date(today.toDateString()) ? 'overdue' : 'upcoming')) : 'nodate'

  const toggleDone = async () => {
    // optimistic UI
    setTodos((s) => s.map(t => t._id === todo._id ? { ...t, done: !t.done } : t))
    try {
      await fetch(`${API_BASE}/${todo._id}/done`, { method: 'PATCH' })
      toast.info(todo.done ? 'Marked as not done' : 'Marked as done')
    } catch (_) {
      // revert on error (simple)
      setTodos((s) => s.map(t => t._id === todo._id ? { ...t, done: todo.done } : t))
    }
  }

  const remove = async () => {
    // optimistic remove
    setTodos((s) => s.filter(t => t._id !== todo._id))
    try {
      await fetch(`${API_BASE}/${todo._id}`, { method: 'DELETE' })
      toast.success('Deleted')
    } catch (_) {
      // could refetch; for simplicity, do nothing
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/${todo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, dueDate: dueInput || null })
      })
      const updated = await res.json()
      setTodos((s) => s.map(t => t._id === todo._id ? updated : t))
      setEditing(false)
      toast.success('Saved')
    } finally { setSaving(false) }
  }

  return (
    <div className={`todo-item ${todo.done ? 'done' : ''} glass ${status}`}>
      <div className="left">
        <label className="checkbox">
          <input type="checkbox" checked={!!todo.done} onChange={toggleDone} />
          <span className="checkmark" />
        </label>
      </div>

      <div className="body">
        <div className="index">{index != null ? `${index + 1}.` : ''}</div>
        {editing ? (
          <>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} />
            <input value={desc} onChange={(e)=>setDesc(e.target.value)} />
            <input type="date" value={dueInput} onChange={(e)=>setDueInput(e.target.value)} />
          </>
        ) : (
          <>
            <div className="title">{todo.title}</div>
            {todo.description ? <div className="desc">{todo.description}</div> : null}
            {dueDate ? <div className={`due ${status}`}>{formatDate(dueDate)}</div> : null}
          </>
        )}
      </div>

      <div className="actions">
        {editing ? (
          <>
            <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn ghost" onClick={()=>setEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn" onClick={()=>setEditing(true)}>Edit</button>
            <button className="btn danger" onClick={remove}>Delete</button>
          </>
        )}
      </div>
    </div>
  )
}
