import { Database } from './database.js';
import { randomUUID } from 'node:crypto';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database()

function findTaskById(id) {
  const task = database.select('tasks')
  return task.find(task => task.id === id)
}

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
        const { search } = req.query

        const tasks = database.select('tasks', search ? {
          title: search,
          description: search,
        } : null)

        return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
        const { title, description } = req.body
        if(!title || !description) {
          res.writeHead(400)
          return res.end(JSON.stringify({
            error: 'Título e descrição são obrigatórios'
          }))
        }
        const task = {
            id: randomUUID(),
            title,
            description,
            completed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        database.insert('tasks', task)

        res.writeHead(201)
        return res.end(JSON.stringify(task))
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
        const { id } = req.params
        const { title, description } = req.body

        const task = findTaskById(id)

        if(!task) {
          res.writeHead(404)
          return res.end(JSON.stringify({
            error: 'Tarefa não encontrada'
          }))
        }

        if(!title && !description) {
          res.writeHead(400)
          return res.end(JSON.stringify({
            error: 'Título e/ou descrição são obrigatórios'
          }))
        }


        database.update('tasks', id, {
          ...(title && { title }),
          ...(description && { description }),
          updated_at: new Date().toISOString(),
        })

        res.writeHead(204)
        return res.end()
    },  
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
        const { id } = req.params

        const task = findTaskById(id)

        if(!task) { 
          res.writeHead(404)
          return res.end(JSON.stringify({ error: 'Tarefa não encontrada' }))
        }

        database.delete('tasks', id)

        res.writeHead(204)
        return res.end()
      }
    },
    {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const task = findTaskById(id)

      if (!task) {
        res.writeHead(404)
        return res.end(JSON.stringify({
          error: 'Tarefa não encontrada'
        }))
      }

      database.update('tasks', id, {
        completed_at: task.completed_at ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      res.writeHead(204)
      return res.end()
    }
  },
]