import React, { useEffect, useState } from 'react'
import TodoList from './components/TodoList'
import TodoForm from './components/TodoForm'
import { ToastContainer, toast } from 'react-toastify'

const API = import.meta.env.VITE_API_URL || '/api/todos'

export default function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTodos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTodos() }, [])

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Glowing TODOs</h1>
        <p className="sub">Nice animations & optimistic UI</p>
      </header>

      <main className="container">
        <TodoForm onCreated={(t) => { setTodos((s) => [t, ...s]); toast.success('Task added') }} />

        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <TodoList todos={todos} setTodos={setTodos} />
        )}
      </main>

  <ToastContainer position="top-right" autoClose={1800} />
  <footer className="footer">Made for take-home — enjoy the animations ✨</footer>
    </div>
  )
}
