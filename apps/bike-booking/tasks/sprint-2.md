# Sprint 2 — Frontend UI

## Goals

Build the React UI and connect it to the backend API. Create a responsive design for desktop, tablet, and mobile.

## Tasks

### 1. Types & API Client

- [ ] Create TypeScript types matching backend
- [ ] Create API client functions (fetch wrappers)
- [ ] Add error handling for API calls

### 2. Authentication UI (Feature 2.6)

- [ ] Create Login page/component
- [ ] Create Registration page/component
- [ ] Store user session (localStorage or state)
- [ ] Add logout functionality
- [ ] Protect routes requiring authentication

### 3. Bike Listing Page (Feature 2.1)

- [ ] Create BikeList component
- [ ] Create BikeCard component with:
  - [ ] Bike image
  - [ ] Name and type
  - [ ] Price per hour
  - [ ] Availability status badge
- [ ] Add type filter (All, Mountain, Road, City, Electric)
- [ ] Add loading and error states

### 4. Booking Flow (Features 2.2, 2.3)

- [ ] Create BookingForm component with:
  - [ ] Start date picker
  - [ ] Start time picker
  - [ ] End date picker
  - [ ] End time picker
- [ ] Add "Check Availability" button
- [ ] Show availability status before booking
- [ ] Calculate and display estimated price
- [ ] Create "Confirm Booking" action
- [ ] Create BookingSuccess confirmation component

### 5. My Bookings Page (Features 2.4, 2.5)

- [ ] Create MyBookings component
- [ ] Display upcoming bookings section
- [ ] Display past/cancelled bookings section
- [ ] Show booking details:
  - [ ] Bike name and type
  - [ ] Start/end date and time
  - [ ] Status (confirmed/cancelled)
- [ ] Add "Cancel Booking" button for upcoming bookings
- [ ] Show cancellation confirmation

### 6. Navigation & Layout

- [ ] Create app header with logo
- [ ] Add navigation: Browse Bikes | My Bookings | Login/Logout
- [ ] Create responsive layout (mobile-first)
- [ ] Add footer

### 7. Styling & Polish

- [ ] Apply consistent color scheme
- [ ] Add hover effects and transitions
- [ ] Ensure responsive design (320px - 1920px)
- [ ] Add loading spinners
- [ ] Add toast notifications for actions

### 8. Testing

- [ ] Write component tests (6+ test cases)
- [ ] Test user flows end-to-end
- [ ] Test responsive breakpoints

## Component Structure

```
src/
├── components/
│   ├── BikeCard.tsx
│   ├── BikeList.tsx
│   ├── BookingForm.tsx
│   ├── BookingSuccess.tsx
│   ├── MyBookings.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── api.ts
├── types.ts
├── App.tsx
└── App.css
```

## Acceptance Criteria

- Users can register and login
- Users can browse available bikes with filtering
- Users can view bike details and check availability
- Users can select date/time and book a bike
- Confirmation message shown after booking
- Users can view their bookings list
- Users can cancel upcoming bookings
- UI is responsive (desktop, tablet, mobile)
- All tests pass (6+ test cases)

## Success Criteria (from PRD)

The project is successful if:

1. ✅ Users can view bikes
2. ✅ Users can create bookings
3. ✅ Users can view their bookings
4. ✅ Users can cancel bookings
5. ✅ Correct frontend-backend interaction
6. ✅ Basic understanding of CRUD operations demonstrated
