# Sprint 1 — Backend

## Goals

Build the core backend API for the bike booking application.

## Tasks

- [ ] Design database schema for bikes and bookings
- [ ] Create Bikes API endpoints
  - [ ] GET /api/bikes - List all available bikes
  - [ ] GET /api/bikes/:id - Get single bike details
  - [ ] POST /api/bikes - Add new bike (admin)
- [ ] Create Booking API endpoints
  - [ ] GET /api/bookings - List user bookings
  - [ ] POST /api/bookings - Create a booking
  - [ ] DELETE /api/bookings/:id - Cancel booking
- [ ] Add availability checking logic
- [ ] Write API tests

## Acceptance Criteria

- All endpoints return proper JSON responses
- Booking conflicts are prevented
- Tests pass for all endpoints
