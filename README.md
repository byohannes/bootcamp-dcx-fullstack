# Bootcamp Fullstack Repo

A monorepo containing two full-stack applications for learning web development.

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (required for Vite 8 and ESLint 10)
- Node Version Manager:
  - **Mac/Linux:** [nvm](https://github.com/nvm-sh/nvm)
  - **Windows:** [nvm-windows](https://github.com/coreybutler/nvm-windows)
- npm

### Setup

**Mac/Linux:**

```bash
# Install and use the correct Node version
nvm install 22
nvm use

# Install all workspace dependencies
npm install
```

**Windows (PowerShell or CMD):**

```bash
# Install and use the correct Node version
nvm install 22
nvm use 22

# Install all workspace dependencies
npm install
```

> **Note:** The `.nvmrc` file specifies Node 22. On Mac/Linux, `nvm use` reads this automatically. On Windows, use `nvm use 22` explicitly.

### Run Applications

**E-commerce App:**

```bash
npm run dev:ecommerce
```

- Client: http://localhost:5173
- Server: http://localhost:5000

**Bike Booking App:**

```bash
npm run dev:bike
```

- Client: http://localhost:5174
- Server: http://localhost:5001

## 📁 Project Structure

```
bootcamp-fullstack/
├── apps/
│   ├── ecommerce/          # E-commerce application
│   │   ├── client/         # React frontend
│   │   ├── server/         # Express backend
│   │   └── tasks/          # Sprint tasks
│   └── bike-booking/       # Bike booking application
│       ├── client/         # React frontend
│       ├── server/         # Express backend
│       └── tasks/          # Sprint tasks
├── packages/               # Shared packages
│   ├── config/             # Shared configuration
│   ├── types/              # Shared TypeScript types
│   └── ui/                 # Shared UI components
└── docs/                   # Documentation
```

## 🎯 Sprint Workflow

Each app has a `tasks/` folder with sprint files:

1. **Sprint 0 (Setup)** - Clone, install, run, understand structure
2. **Sprint 1 (Backend)** - Build API endpoints
3. **Sprint 2 (Frontend)** - Build React UI

Start with `tasks/sprint-0.md` in your chosen app.

## 🛠️ Available Scripts

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `npm run dev:ecommerce` | Run ecommerce client + server    |
| `npm run dev:bike`      | Run bike-booking client + server |
| `npm run lint`          | Run ESLint                       |
| `npm run format`        | Format code with Prettier        |

## 🧪 Running Tests

### Run All Tests

```bash
# Ecommerce server tests
npm test -w apps/ecommerce/server

# Ecommerce client tests
npm test -w apps/ecommerce/client -- --run

# Bike-booking server tests
npm test -w apps/bike-booking/server

# Bike-booking client tests
npm test -w apps/bike-booking/client -- --run
```

### Watch Mode (for development)

```bash
# Server (Jest)
npm run test:watch -w apps/ecommerce/server

# Client (Vitest)
npm test -w apps/ecommerce/client
```

### Coverage Reports

```bash
npm run test:coverage -w apps/ecommerce/server
npm run test:coverage -w apps/ecommerce/client
```

## 🚀 Running Individual Apps

### Ecommerce

```bash
# Run both client and server
npm run dev:ecommerce

# Run server only (port 5000)
npm run dev -w apps/ecommerce/server

# Run client only (port 5173)
npm run dev -w apps/ecommerce/client
```

### Bike Booking

```bash
# Run both client and server
npm run dev:bike

# Run server only (port 5001)
npm run dev -w apps/bike-booking/server

# Run client only (port 5174)
npm run dev -w apps/bike-booking/client
```

## 📚 Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Testing:** Jest, Supertest (server), Vitest, React Testing Library (client)
- **Tools:** ESLint, Prettier

## 👨‍🎓 Graduate Onboarding

1. Clone this repository
2. Install Node 22 if needed: `nvm install 22`
3. Switch to correct version: `nvm use` (Mac/Linux) or `nvm use 22` (Windows)
4. Install dependencies: `npm install`
5. Choose an app and run it (`npm run dev:ecommerce` or `npm run dev:bike`)
6. Open `tasks/sprint-0.md` and begin!
