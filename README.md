# Bootcamp Fullstack Repo

A monorepo containing two full-stack applications for learning modern web development with React, TypeScript, and Express.

## 🎯 What You'll Learn

| Sprint       | Focus                | Skills                                              |
| ------------ | -------------------- | --------------------------------------------------- |
| **Sprint 0** | Environment Setup    | Git, npm workspaces, project structure              |
| **Sprint 1** | Backend Development  | REST APIs, Express routing, testing with Jest       |
| **Sprint 2** | Frontend Development | React components, state management, API integration |

## 🚀 Quick Start

### Prerequisites

- **Node.js 22+** (required for Vite 8 and ESLint 10)
- **Git** for version control
- **Node Version Manager:**
  - Mac/Linux: [nvm](https://github.com/nvm-sh/nvm)
  - Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows)

### Setup

**Mac/Linux:**

```bash
# Clone and enter the project
git clone https://github.com/byohannes/bootcamp-dcx-fullstack.git
cd bootcamp-dcx-fullstack

# Install and use the correct Node version
nvm install 22
nvm use

# Install all workspace dependencies
npm install
```

**Windows (PowerShell or CMD):**

```bash
# Clone and enter the project
git clone https://github.com/byohannes/bootcamp-dcx-fullstack.git
cd bootcamp-dcx-fullstack

# Install and use the correct Node version
nvm install 22
nvm use 22

# Install all workspace dependencies
npm install
```

> **Note:** The `.nvmrc` file specifies Node 22. On Mac/Linux, `nvm use` reads this automatically. On Windows, use `nvm use 22` explicitly.

### Run Applications

| App          | Command                 | Client                | Server                | API Health                       |
| ------------ | ----------------------- | --------------------- | --------------------- | -------------------------------- |
| E-commerce   | `npm run dev:ecommerce` | http://localhost:5173 | http://localhost:5000 | http://localhost:5000/api/health |
| Bike Booking | `npm run dev:bike`      | http://localhost:5174 | http://localhost:5001 | http://localhost:5001/api/health |

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

| Layer        | Technologies                                                       |
| ------------ | ------------------------------------------------------------------ |
| **Frontend** | React 19, TypeScript, Vite 8                                       |
| **Backend**  | Node.js 22, Express 5, TypeScript                                  |
| **Testing**  | Jest + Supertest (server), Vitest + React Testing Library (client) |
| **Tools**    | ESLint 10, Prettier, npm workspaces                                |

## 🌿 Git Workflow for Workshop Exercises

### Why Feature Branches?

Feature branches keep your `main` branch clean and allow you to:

- Experiment without breaking working code
- Submit work for review
- Track progress on each exercise separately
- Easily discard failed experiments

### Starting a New Exercise

```bash
# Always start from an up-to-date main
git checkout main
git pull origin main

# Create your exercise branch
git checkout -b exercise/sprint-1-products-api
```

### Working on Your Exercise

```bash
# Make changes, then stage and commit often
git add .
git commit -m "Add Product model with TypeScript interface"

# More work...
git add .
git commit -m "Add GET /api/products endpoint"

# Push to remote (first time)
git push -u origin exercise/sprint-1-products-api

# Subsequent pushes
git push
```

### Completing an Exercise

**Option A: Merge locally (solo work)**

```bash
git checkout main
git merge exercise/sprint-1-products-api
git push origin main
git branch -d exercise/sprint-1-products-api
```

**Option B: Create a Pull Request (team/review)**

```bash
# Push your branch
git push -u origin exercise/sprint-1-products-api

# Create PR on GitHub, then after merge:
git checkout main
git pull origin main
git branch -d exercise/sprint-1-products-api
```

### Branch Naming Conventions

| Type                   | Pattern                          | Example                          |
| ---------------------- | -------------------------------- | -------------------------------- |
| **Workshop exercises** | `exercise/<sprint>-<topic>`      | `exercise/sprint-1-products-api` |
| **Sprint features**    | `feature/<sprint>-<description>` | `feature/sprint-2-product-list`  |
| **Bug fixes**          | `fix/<description>`              | `fix/cors-headers`               |
| **Experiments**        | `experiment/<description>`       | `experiment/auth-jwt`            |

### Daily Workshop Workflow

```bash
# 🌅 Morning: Start fresh
git checkout main
git pull origin main
git checkout -b exercise/day-1-express-routing

# 💻 During workshop: Commit after each task
git add .
git commit -m "Task 1: Add health check endpoint"

git add .
git commit -m "Task 2: Add products route"

# 🌆 End of day: Push your work
git push -u origin exercise/day-1-express-routing

# ✅ Exercise complete: Merge to main
git checkout main
git merge exercise/day-1-express-routing
git push origin main
```

### Handling Multiple Exercises

```bash
# List all your branches
git branch -a

# Switch between exercises
git checkout exercise/sprint-1-api
git checkout exercise/sprint-2-react

# Delete old branches after merging
git branch -d exercise/completed-exercise
```

### Recovering from Mistakes

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all uncommitted changes
git checkout .

# Start over on current exercise
git checkout main
git branch -D exercise/broken-attempt
git checkout -b exercise/fresh-start
```

## 👨‍🎓 Graduate Onboarding

1. **Clone** this repository
   ```bash
   git clone https://github.com/byohannes/bootcamp-dcx-fullstack.git
   cd bootcamp-dcx-fullstack
   ```
2. **Install Node 22** if needed: `nvm install 22`
3. **Switch** to correct version: `nvm use` (Mac/Linux) or `nvm use 22` (Windows)
4. **Install** dependencies: `npm install`
5. **Create** your first exercise branch:
   ```bash
   git checkout -b exercise/sprint-0-setup
   ```
6. **Choose** an app and run it (`npm run dev:ecommerce` or `npm run dev:bike`)
7. **Verify** the client and API health endpoint work
8. **Open** `apps/<app>/tasks/sprint-0.md` and complete the tasks
9. **Commit** your progress and push:
   ```bash
   git add .
   git commit -m "Complete sprint-0 setup"
   git push -u origin exercise/sprint-0-setup
   ```

## 🔧 Troubleshooting

### Node version errors

```bash
# Check your Node version
node -v

# Should be v22.x.x. If not:
nvm install 22
nvm use 22
```

### Port already in use

```bash
# Find and kill the process using the port (e.g., 5000)
lsof -i :5000
kill -9 <PID>
```

### Dependencies out of sync

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf apps/*/client/node_modules apps/*/server/node_modules
npm install
```

### Tests failing after changes

```bash
# Run tests in watch mode to see detailed errors
npm test -w apps/ecommerce/server -- --watch
npm test -w apps/ecommerce/client
```

## 📖 Additional Resources

- [React Documentation](https://react.dev)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Vitest Documentation](https://vitest.dev)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

**Happy coding!** 🚀
