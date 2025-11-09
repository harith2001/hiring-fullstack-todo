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
    setTodos(next)
    toast.info('Reordered')
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
                  <Draggable key={t._id} draggableId={t._id} index={idx}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                        <TodoItem todo={t} setTodos={setTodos} index={idx} />
                      </div>
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
