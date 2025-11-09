import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import { toast } from 'react-toastify'

const API_BASE = '/api/todos'

function formatDate(d) {
  if (!d) return null
  const dt = new Date(d)
  return dt.toLocaleDateString()
}

export default function TodoItem({ todo, setTodos, index, provided }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [desc, setDesc] = useState(todo.description || '')
  const [saving, setSaving] = useState(false)
  const [dueInput, setDueInput] = useState(todo.dueDate ? new Date(todo.dueDate) : null)
  const [alarmInput, setAlarmInput] = useState(todo.alarm ? new Date(todo.alarm) : null)
  const [locationInput, setLocationInput] = useState(todo.location || '')
  const [linksInput, setLinksInput] = useState((todo.links && todo.links.length) ? todo.links.join('\n') : '')

  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null
  const today = new Date()
  const isSameDay = (a, b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
  const status = dueDate ? (isSameDay(dueDate, today) ? 'today' : (dueDate < new Date(today.toDateString()) ? 'overdue' : 'upcoming')) : 'nodate'

  const toggleDone = async () => {
    // optimistic UI
    setTodos((s) => s.map(t => t._id === todo._id ? { ...t, done: !t.done } : t))
    try {
      const res = await fetch(`${API_BASE}/${todo._id}/done`, { method: 'PATCH' })
      if (!res.ok) {
        // revert and show error
        setTodos((s) => s.map(t => t._id === todo._id ? { ...t, done: todo.done } : t))
        const err = await res.json().catch(() => ({ error: 'Failed to toggle' }))
        toast.error(err.error || 'Failed to toggle')
        return
      }
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
      const res = await fetch(`${API_BASE}/${todo._id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Failed to delete')
        return
      }
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
        body: JSON.stringify({ title, description: desc, dueDate: dueInput ? dueInput.toISOString() : null, alarm: alarmInput ? alarmInput.toISOString() : null, location: locationInput || '', links: linksInput ? linksInput.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean) : [] })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to save' }))
        toast.error(err.error || 'Failed to save')
      } else {
        const updated = await res.json()
        setTodos((s) => s.map(t => t._id === todo._id ? updated : t))
        setEditing(false)
        toast.success('Saved')
      }
    } finally { setSaving(false) }
  }

  // attach draggable props/ref when provided by react-beautiful-dnd
  const dragProps = provided ? { ...provided.draggableProps, ...provided.dragHandleProps } : {}
  const ref = provided ? provided.innerRef : null

  return (
    <div ref={ref} {...dragProps} className={`todo-item ${todo.done ? 'done' : ''} glass ${status}`}>
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
            <div style={{minWidth:160}}>
              <DatePicker selected={dueInput} onChange={(d)=>setDueInput(d)} className="form-control" dateFormat="yyyy-MM-dd" />
            </div>
            <div style={{minWidth:160}}>
              <DatePicker selected={alarmInput} onChange={(d)=>setAlarmInput(d)} className="form-control" showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="yyyy-MM-dd HH:mm" />
            </div>
            <input value={locationInput} onChange={(e)=>setLocationInput(e.target.value)} placeholder="Location" />
            <textarea value={linksInput} onChange={(e)=>setLinksInput(e.target.value)} placeholder="Links (one per line or comma-separated)" />
          </>
        ) : (
          <>
            <div className="title">{todo.title}</div>
            {todo.description ? <div className="desc">{todo.description}</div> : null}
            {dueDate ? <div className={`due ${status}`}>{formatDate(dueDate)}</div> : null}
            {todo.alarm ? <div className="alarm">⏰ {new Date(todo.alarm).toLocaleString()}</div> : null}
            {todo.location ? <div className="location">📍 {todo.location}</div> : null}
            {todo.links && todo.links.length ? (
              <div className="links">{todo.links.map((l,i)=>(<div key={i}><a href={l} target="_blank" rel="noreferrer">{l}</a></div>))}</div>
            ) : null}
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
