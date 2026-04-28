# Sprint 1 — Backend API

## Goals

Build the core backend API for bikes, bookings, and user authentication.

## Tasks

### 1. Data Models & Types

- [ ] Define TypeScript interfaces for Bike, Booking, User
- [ ] Create in-memory data storage (arrays/Maps)
- [ ] Add sample bike data (6+ bikes with different types)

### 2. Bikes API (Feature 2.1: View Available Bikes)

- [ ] GET /api/bikes - List all bikes with availability status
- [ ] GET /api/bikes/:id - Get single bike details
- [ ] GET /api/bikes/:id/availability - Check availability for time range
- [ ] Add filtering by bike type (mountain, road, city, electric)

### 3. Bookings API (Features 2.2, 2.3, 2.4, 2.5)

- [ ] POST /api/bookings - Create a booking
  - [ ] Validate start/end date/time
  - [ ] Check for double booking conflicts
  - [ ] Return confirmation with booking details
- [ ] GET /api/bookings - List user's bookings
  - [ ] Filter by userId query param
  - [ ] Include bike details in response
- [ ] DELETE /api/bookings/:id - Cancel a booking
  - [ ] Update status to 'cancelled'
  - [ ] Make time slot available again

### 4. Users API (Feature 2.6: Simple Registration/Login)

- [ ] POST /api/users/register - Register new user
  - [ ] Validate email and password
  - [ ] Store user with hashed password (basic)
  - [ ] Return user ID
- [ ] POST /api/users/login - Login user
  - [ ] Validate credentials
  - [ ] Return user ID (mock token)
- [ ] GET /api/users/:id - Get user profile

### 5. Testing

- [ ] Write tests for Bikes API endpoints
- [ ] Write tests for Bookings API endpoints
- [ ] Write tests for Users API endpoints
- [ ] Test availability conflict prevention

## API Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": "Error message if success is false"
}
```

## Acceptance Criteria

- All endpoints return proper JSON responses
- Booking conflicts are prevented (no double bookings)
- User registration and login work correctly
- All tests pass (15+ test cases)
- API follows RESTful conventions
