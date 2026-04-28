import { useState } from "react";
import { Bike, Booking, View } from "./types";
import {
  BikeList,
  BookingForm,
  BookingSuccess,
  MyBookings,
} from "./components";
import "./App.css";

// Simulated user ID (in a real app, this would come from authentication)
const USER_ID = "user-1";

function App() {
  const [currentView, setCurrentView] = useState<View>("bikes");
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  function handleSelectBike(bike: Bike) {
    setSelectedBike(bike);
    setCurrentView("bike-detail");
  }

  function handleBookingSuccess(booking: Booking) {
    setLastBooking(booking);
    setCurrentView("booking-success");
    setSelectedBike(null);
  }

  function handleBackToBikes() {
    setCurrentView("bikes");
    setSelectedBike(null);
    setLastBooking(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={handleBackToBikes} style={{ cursor: "pointer" }}>
          🚲 Bike Booking
        </h1>
        <nav>
          <button
            className={`nav-button ${currentView === "bikes" ? "active" : ""}`}
            onClick={handleBackToBikes}
          >
            Browse Bikes
          </button>
          <button
            className={`nav-button ${currentView === "my-bookings" ? "active" : ""}`}
            onClick={() => setCurrentView("my-bookings")}
          >
            My Bookings
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === "bikes" && (
          <BikeList onSelectBike={handleSelectBike} />
        )}

        {currentView === "bike-detail" && selectedBike && (
          <BookingForm
            bike={selectedBike}
            userId={USER_ID}
            onSuccess={handleBookingSuccess}
            onCancel={handleBackToBikes}
          />
        )}

        {currentView === "booking-success" && lastBooking && (
          <BookingSuccess
            booking={lastBooking}
            onViewBookings={() => setCurrentView("my-bookings")}
            onBookAnother={handleBackToBikes}
          />
        )}

        {currentView === "my-bookings" && (
          <MyBookings userId={USER_ID} onBack={handleBackToBikes} />
        )}
      </main>

      <footer className="app-footer">
        <p>Bike Booking App — Bootcamp Project</p>
      </footer>
    </div>
  );
}

export default App;
