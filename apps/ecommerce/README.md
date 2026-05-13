# Ecommerce Application

A full-stack ecommerce demo built with React, TypeScript, and Express. Used as
the Sprint 0–2 reference app in this bootcamp alongside the
[Bike Booking app](../bike-booking/README.md).

## Tech Stack

### Frontend

- React 19 with TypeScript
- Vite 8 for build tooling
- Plain CSS (per-component) for styling

### Backend

- Express 5 with TypeScript
- In-memory data store (no database required)
- RESTful API

### Testing

- **Server**: Jest + Supertest
- **Client**: Vitest + React Testing Library

## Project Structure

```
ecommerce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── api.ts          # API client
│   │   ├── types.ts        # Shared TypeScript types
│   │   └── App.tsx
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── app.ts
│   │   ├── data.ts         # In-memory seed data
│   │   ├── index.ts        # Server entry point
│   │   └── types.ts
│   └── package.json
└── tasks/                  # Sprint task descriptions
```

## Getting Started

### Prerequisites

- Node.js 22+ (see the root [`.nvmrc`](../../.nvmrc))
- npm 10+ (bundled with Node 22)

### Install

From the repo root:

```bash
npm install
```

### Run

```bash
# Run client + server together
npm run dev:ecommerce

# Or individually
npm run dev --workspace=apps/ecommerce/server   # http://localhost:5000
npm run dev --workspace=apps/ecommerce/client   # http://localhost:5173
```

| Endpoint   | URL                              |
| ---------- | -------------------------------- |
| Frontend   | http://localhost:5173            |
| API root   | http://localhost:5000            |
| API health | http://localhost:5000/api/health |

## API Endpoints

| Method | Endpoint            | Description                |
| ------ | ------------------- | -------------------------- |
| GET    | `/api/health`       | Server health check        |
| GET    | `/api/products`     | List all products          |
| GET    | `/api/products/:id` | Get a single product by ID |

> See [`server/src/routes`](server/src/routes/) for the full, current set of
> routes — they grow as the bootcamp progresses.

## Testing

### Server (Jest)

```bash
cd apps/ecommerce/server
npm run test
npm run test:watch
npm run test:coverage
```

### Client (Vitest)

```bash
cd apps/ecommerce/client
npm run test            # watch mode
npm run test -- --run   # one-off run
npm run test:coverage
```

## Sprint Tasks

The bootcamp exercises for this app live in [`tasks/`](tasks/):

- [`sprint-0.md`](tasks/sprint-0.md) — environment setup
- [`sprint-1.md`](tasks/sprint-1.md) — backend (Express routes)
- [`sprint-2.md`](tasks/sprint-2.md) — frontend (React UI)

## License

ISC
