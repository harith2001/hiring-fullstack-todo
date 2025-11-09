import React from 'react'
import TodoItem from './TodoItem'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { toast } from 'react-toastify'

export default function TodoList({ todos, setTodos }) {
  function onDragEnd(result) {
    if (!result.destination) return
    const src = result.source.index
    const dst = result.destination.index
    if (src === dst) return
    const next = Array.from(todos)
    const [moved] = next.splice(src, 1)
    next.splice(dst, 0, moved)
    // optimistic UI update
    setTodos(next)
    toast.info('Reordered')

    // persist new order to server
    (async () => {
      try {
        const res = await fetch('/api/todos/order', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: next.map(t=>t._id) })
        })
        if (!res.ok) {
          const err = await res.json().catch(()=>({error:'Failed to reorder'}))
          toast.error(err.error || 'Failed to persist order')
          // optionally refetch or revert
          const reload = await fetch('/api/todos')
          const fresh = await reload.json()
          setTodos(fresh)
        } else {
          // server returns the new ordered list -> use it to keep positions accurate
          const updated = await res.json()
          setTodos(updated)
        }
      } catch (e) {
        toast.error('Network error while saving order')
        // revert by refetching
        const reload = await fetch('/api/todos')
        const fresh = await reload.json()
        setTodos(fresh)
      }
    })()
  }

  return (
    <div className="todo-list">
      {todos.length === 0 ? (
        <div className="empty">No tasks yet — add one above</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="todos-droppable">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {todos.map((t, idx) => (
                  <Draggable key={t._id} draggableId={String(t._id)} index={idx}>
                    {(prov) => (
                      <TodoItem todo={t} setTodos={setTodos} index={idx} provided={prov} />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}
