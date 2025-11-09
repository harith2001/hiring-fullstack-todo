# Server (Express + MongoDB)

This folder contains an Express backend and Mongoose models for the TODO app.

Quick start

1. Copy `.env.example` to `.env` and set `MONGODB_URI` if needed.
2. Install dependencies:

```
cd server; npm install
```

3. Run (development):

```
npm run dev
```

API endpoints

Base: `http://localhost:4000/api/todos`

- GET `/` - list
- POST `/` - create { title, description }
- PUT `/:id` - update title/description
- PATCH `/:id/done` - toggle done
- DELETE `/:id` - delete

Notes

- Uses Mongoose with timestamps. Default MongoDB URI: `mongodb://localhost:27017/hiring_todo` if `MONGODB_URI` is not set.
