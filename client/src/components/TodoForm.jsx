import React, { useState } from 'react'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'

const API = '/api/todos'

export default function TodoForm({ onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(null)
  const [alarm, setAlarm] = useState(null)
  const [location, setLocation] = useState('')
  const [linksText, setLinksText] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    // basic client-side validation
    const t = title ? title.trim() : ''
    if (!t) {
      toast.error('Title is required')
      return
    }
    if (t.length > 200) {
      toast.error('Title must be 200 characters or less')
      return
    }
    if (description && description.length > 1000) {
      toast.error('Description must be 1000 characters or less')
      return
    }
    if (dueDate) {
      const due = new Date(dueDate)
      const today = new Date()
      // compare dates without time
      const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      if (isNaN(due.getTime())) {
        toast.error('Invalid due date')
        return
      }
      if (due < startToday) {
        toast.error('Due date cannot be in the past')
        return
      }
    }
    if (alarm) {
      const a = new Date(alarm)
      if (isNaN(a.getTime())) { toast.error('Invalid alarm'); return }
      if (a < new Date()) { toast.error('Alarm cannot be in the past'); return }
    }
    // parse links (comma or newline separated)
    let linksArr = []
    if (linksText && linksText.trim()) {
      linksArr = linksText.split(/[,\n]+/).map(s=>s.trim()).filter(Boolean)
      if (linksArr.length > 5) { toast.error('Maximum 5 links allowed'); return }
      for (const u of linksArr) {
        try { new URL(u) } catch (e) { toast.error(`Invalid link: ${u}`); return }
      }
    }
    setLoading(true)
    try {
  const body = { title, description };
  if (dueDate) body.dueDate = dueDate.toISOString();
  if (alarm) body.alarm = alarm.toISOString();
  if (location) body.location = location
  if (linksArr.length) body.links = linksArr
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:'Server error'}))
        toast.error(err.error || 'Failed to create')
        return
      }
      const newTodo = await res.json()
      onCreated && onCreated(newTodo)
      setTitle('')
      setDescription('')
      setDueDate(null)
      setAlarm(null)
      setLocation('')
      setLinksText('')
    } finally { setLoading(false) }
  }

  return (
    <form className="todo-form glass" onSubmit={submit} noValidate>
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
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <div style={{minWidth:150}}>
          <DatePicker
            selected={dueDate}
            onChange={(d) => setDueDate(d)}
            className="form-control"
            placeholderText="Due date"
            aria-label="Due date"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div style={{minWidth:200}}>
          <DatePicker
            selected={alarm}
            onChange={(d) => setAlarm(d)}
            className="form-control"
            placeholderText="Alarm (date + time)"
            aria-label="Alarm"
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
          />
        </div>
      </div>
      <input className="location-input" value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Location (optional)" />
      <textarea className="links-input" value={linksText} onChange={(e)=>setLinksText(e.target.value)} placeholder="Links (comma or newline separated, max 5)" />
      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Adding…' : 'Add'}
      </button>
    </form>
  )
}
