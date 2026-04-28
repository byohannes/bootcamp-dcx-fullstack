import { useState, useEffect } from "react";
import type { Bike, Booking, View, User } from "./types";
import {
  BikeList,
  BookingForm,
  BookingSuccess,
  MyBookings,
  Login,
  Register,
} from "./components";
import "./App.css";

// Local storage key for user session
const USER_STORAGE_KEY = "bike-booking-user";

function App() {
  const [currentView, setCurrentView] = useState<View>("bikes");
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  function handleLogin(loggedInUser: User) {
    setUser(loggedInUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    setCurrentView("bikes");
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    setCurrentView("bikes");
    setSelectedBike(null);
    setLastBooking(null);
  }

  function handleSelectBike(bike: Bike) {
    if (!user) {
      setCurrentView("login");
      return;
    }
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
          {user ? (
            <>
              <button
                className={`nav-button ${currentView === "my-bookings" ? "active" : ""}`}
                onClick={() => setCurrentView("my-bookings")}
              >
                My Bookings
              </button>
              <span className="user-greeting">Hi, {user.name}</span>
              <button className="nav-button logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button
              className={`nav-button ${currentView === "login" ? "active" : ""}`}
              onClick={() => setCurrentView("login")}
            >
              Login
            </button>
          )}
        </nav>
      </header>

      <main className="app-main">
        {currentView === "login" && (
          <Login
            onLogin={handleLogin}
            onRegister={() => setCurrentView("register")}
          />
        )}

        {currentView === "register" && (
          <Register
            onRegister={handleLogin}
            onLogin={() => setCurrentView("login")}
          />
        )}

        {currentView === "bikes" && (
          <BikeList onSelectBike={handleSelectBike} />
        )}

        {currentView === "bike-detail" && selectedBike && user && (
          <BookingForm
            bike={selectedBike}
            userId={user.id}
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

        {currentView === "my-bookings" && user && (
          <MyBookings userId={user.id} onBack={handleBackToBikes} />
        )}
      </main>

      <footer className="app-footer">
        <p>Bike Booking App — Bootcamp Project</p>
      </footer>
    </div>
  );
}

export default App;
