# Bike Booking Application

A full-stack bike rental booking application built with React, TypeScript, Express, and MongoDB.

## Features

- **Browse Bikes**: View all available bikes with filtering by type (mountain, road, city, electric)
- **Real-time Availability**: Check bike availability for specific time slots
- **User Authentication**: Register and login to book bikes
- **Booking Management**: Create, view, and cancel bookings
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend

- React 19 with TypeScript
- Vite 8 for build tooling
- Plain CSS (per-component) for styling
- React Context API for cross-component state (user/auth)

### Backend

- Express 5 with TypeScript
- MongoDB with Mongoose ODM
- bcryptjs for password hashing
- RESTful API with centralised error handling middleware
- OpenAPI 3 spec served via Swagger UI

### Testing

- **Server**: Jest + Supertest + `mongodb-memory-server`
- **Client (unit/component)**: Vitest + React Testing Library
- **End-to-end**: Playwright (Chromium)

## Project Structure

```
bike-booking/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── api.ts          # API client
│   │   ├── types.ts        # TypeScript types
│   │   └── App.tsx         # Main app component
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts   # MongoDB connection
│   │   │   └── models/         # Mongoose models
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── app.ts          # Express app
│   │   ├── index.ts        # Server entry point
│   │   └── seed.ts         # Database seeder
│   └── package.json
└── tasks/                  # Sprint tasks
```

## Getting Started

### Prerequisites

- Node.js 22+
- MongoDB (local or Atlas)
- npm or yarn

### Installing MongoDB Locally

**macOS (using Homebrew):**

```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB as a service
brew services start mongodb-community

# Verify MongoDB is running
mongosh --eval 'db.runCommand({ connectionStatus: 1 })'
```

**Windows:**

1. Download the MongoDB Community Server installer from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will start automatically as a Windows service

**Linux (Ubuntu/Debian):**

```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Using Docker:**

```bash
# Run MongoDB in a container
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### Environment Setup

1. Navigate to the server directory:

   ```bash
   cd apps/bike-booking/server
   ```

2. Create a `.env` file:

   ```env
   MONGODB_URI=mongodb://localhost:27017/bike-booking
   PORT=5001
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Seed the database:
   ```bash
   npm run seed
   ```

### Running the Application

From the root of the monorepo:

```bash
npm run dev:bike
```

Or run client and server separately:

```bash
# Terminal 1 - Server
cd apps/bike-booking/server
npm run dev

# Terminal 2 - Client
cd apps/bike-booking/client
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5001
- **API Health Check**: http://localhost:5001/api/health
- **Interactive API Docs (Swagger UI)**: http://localhost:5001/api/docs
- **Raw OpenAPI 3 spec**: http://localhost:5001/api/openapi.json

## API Endpoints

### Health Check

| Method | Endpoint      | Description                             |
| ------ | ------------- | --------------------------------------- |
| GET    | `/api/health` | Server health status with DB connection |

### Bikes

| Method | Endpoint                      | Description                               |
| ------ | ----------------------------- | ----------------------------------------- |
| GET    | `/api/bikes`                  | List all bikes (optional `?type=` filter) |
| GET    | `/api/bikes/:id`              | Get single bike with bookings             |
| GET    | `/api/bikes/:id/availability` | Check availability for time range         |

### Bookings

| Method | Endpoint            | Description                                |
| ------ | ------------------- | ------------------------------------------ |
| GET    | `/api/bookings`     | List bookings (optional `?userId=` filter) |
| GET    | `/api/bookings/:id` | Get single booking                         |
| POST   | `/api/bookings`     | Create new booking                         |
| DELETE | `/api/bookings/:id` | Cancel booking                             |

### Users

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| POST   | `/api/users/register` | Register new user |
| POST   | `/api/users/login`    | Login user        |
| GET    | `/api/users/:id`      | Get user by ID    |

## Database Models

### Bike

```typescript
{
  name: string;
  type: "mountain" | "road" | "city" | "electric";
  description: string;
  pricePerHour: number;
  imageUrl: string;
}
```

### Booking

```typescript
{
  bikeId: ObjectId;
  userId: ObjectId;
  startTime: Date;
  endTime: Date;
  status: "confirmed" | "cancelled";
}
```

### User

```typescript
{
  email: string;
  password: string; // stored as a bcrypt hash, never returned by the API
  name: string;
}
```

## Development

### Available Scripts

**Server:**

```bash
npm run dev          # Start development server
npm run seed         # Seed database with sample bikes
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

**Client:**

```bash
npm run dev              # Start Vite dev server (port 5174)
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Vitest unit/component tests (watch mode)
npm run test:coverage    # Vitest with coverage
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Playwright UI mode
npm run test:e2e:codegen # Record a new test
```

## Testing

### Server Tests (Jest + Supertest)

Uses `mongodb-memory-server`, so no real MongoDB is required to run the suite.

```bash
cd apps/bike-booking/server
npm run test            # one-off run
npm run test:watch      # watch mode
npm run test:coverage   # coverage report
```

### Client Unit / Component Tests (Vitest)

```bash
cd apps/bike-booking/client
npm run test            # watch mode
npm run test -- --run   # one-off run
npm run test:coverage   # coverage report
```

### End-to-End Tests (Playwright)

E2E tests drive a real Chromium browser against the running app. Playwright's
`webServer` config will start the Vite dev server (port 5174) and Express API
(port 5001) automatically, but you must have **MongoDB running** (the API
requires a real database, unlike the Jest suite).

```bash
cd apps/bike-booking/client

npm run test:e2e            # headless run
npm run test:e2e:ui         # interactive UI mode
npm run test:e2e:headed     # run in a visible browser
npm run test:e2e:report     # open the last HTML report
npm run test:e2e:codegen    # record a new test by clicking through the app
```

From the repo root you can also run:

```bash
npm run test:e2e:bike
```

Specs live in `apps/bike-booking/client/e2e/` and cover:

- Smoke: page loads, navigation between login/register
- Auth: full registration flow + invalid login error
- Booking: end-to-end booking flow + My Bookings list

## Security & Authentication

- Passwords are hashed with **bcryptjs** via a Mongoose `pre('save')` hook on
  the `User` model.
- The `password` field is `select: false`, so it is never returned by default
  queries; the login route explicitly selects it for comparison.
- The `toJSON` transform also strips `password` and `__v` from API responses.

## License

ISC
