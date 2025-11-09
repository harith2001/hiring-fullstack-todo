# Client (React + Vite)

This is a Vite + React frontend for the TODO app. It uses a dev proxy to forward `/api` requests to the backend.

Quick start

1. Install

```
cd client
npm install
```

2. Run dev server

```
npm run dev
```

The dev server runs on `http://localhost:3000` and proxies `/api` to `http://localhost:4000` (see `vite.config.js`).

Notes

- The UI includes animations and optimistic updates for toggles and deletes.
- To connect to a remote API, set `VITE_API_URL` in your environment or replace the fetch base path in code.
