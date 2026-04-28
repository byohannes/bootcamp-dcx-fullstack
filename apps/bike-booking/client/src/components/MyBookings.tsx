import { useEffect, useState } from "react";
import type { Booking } from "../types";
import { getBookings, cancelBooking } from "../api";
import "./MyBookings.css";

interface MyBookingsProps {
  userId: string;
  onBack: () => void;
}

export function MyBookings({ userId, onBack }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, [userId]);

  async function loadBookings() {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookings(userId);
      // Sort by start time, most recent first
      data.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingId: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await cancelBooking(bookingId);
      // Update local state
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" } : b,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel booking");
    }
  }

  function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function isUpcoming(booking: Booking): boolean {
    return (
      new Date(booking.startTime) > new Date() && booking.status === "confirmed"
    );
  }

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter((b) => !isUpcoming(b));

  return (
    <div className="my-bookings-container">
      <div className="my-bookings-header">
        <h2>My Bookings</h2>
        <button className="back-button" onClick={onBack}>
          ← Back to bikes
        </button>
      </div>

      {loading && <div className="loading">Loading bookings...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && bookings.length === 0 && (
        <div className="empty">
          <p>You don't have any bookings yet.</p>
          <button className="browse-button" onClick={onBack}>
            Browse Available Bikes
          </button>
        </div>
      )}

      {upcomingBookings.length > 0 && (
        <section className="booking-section">
          <h3>Upcoming Bookings</h3>
          <div className="bookings-list">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-bike">
                  <h4>{booking.bike?.name || "Unknown Bike"}</h4>
                  <span className="bike-type">{booking.bike?.type}</span>
                </div>
                <div className="booking-details">
                  <div className="booking-time">
                    <span className="label">Start:</span>
                    <span>{formatDateTime(booking.startTime)}</span>
                  </div>
                  <div className="booking-time">
                    <span className="label">End:</span>
                    <span>{formatDateTime(booking.endTime)}</span>
                  </div>
                </div>
                <div className="booking-actions">
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status}
                  </span>
                  {booking.status === "confirmed" && (
                    <button
                      className="cancel-button"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pastBookings.length > 0 && (
        <section className="booking-section">
          <h3>Past Bookings</h3>
          <div className="bookings-list">
            {pastBookings.map((booking) => (
              <div
                key={booking.id}
                className={`booking-card past ${booking.status}`}
              >
                <div className="booking-bike">
                  <h4>{booking.bike?.name || "Unknown Bike"}</h4>
                  <span className="bike-type">{booking.bike?.type}</span>
                </div>
                <div className="booking-details">
                  <div className="booking-time">
                    <span className="label">Start:</span>
                    <span>{formatDateTime(booking.startTime)}</span>
                  </div>
                  <div className="booking-time">
                    <span className="label">End:</span>
                    <span>{formatDateTime(booking.endTime)}</span>
                  </div>
                </div>
                <div className="booking-actions">
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
