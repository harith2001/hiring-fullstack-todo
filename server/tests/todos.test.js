const request = require('supertest')

let mongod
let app
const mongoose = require('mongoose')

beforeAll(async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server')
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  // require app after setting MONGODB_URI so it connects to memory server
  app = require('../src/index')
  // wait for mongoose connection to open
  await new Promise((res) => mongoose.connection.once('open', res))
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongod) await mongod.stop()
})

test('POST /api/todos creates a todo and GET returns it', async () => {
  const createRes = await request(app)
    .post('/api/todos')
    .send({ title: 'Test todo', description: 'desc' })
    .expect(201)

  expect(createRes.body).toHaveProperty('_id')
  expect(createRes.body.title).toBe('Test todo')

  const listRes = await request(app).get('/api/todos').expect(200)
  expect(Array.isArray(listRes.body)).toBe(true)
  expect(listRes.body.length).toBeGreaterThanOrEqual(1)
})

test('PATCH /api/todos/:id/done toggles done status', async () => {
  const createRes = await request(app)
    .post('/api/todos')
    .send({ title: 'Toggle test' })
    .expect(201)

  const id = createRes.body._id
  expect(createRes.body.done).toBe(false)

  const patchRes = await request(app).patch(`/api/todos/${id}/done`).expect(200)
  expect(patchRes.body.done).toBe(true)
})
