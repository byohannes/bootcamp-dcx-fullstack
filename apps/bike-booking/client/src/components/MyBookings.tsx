import { useEffect, useState } from "react";
import type { Booking } from "../types";
import { getBookings, cancelBooking } from "../api";
import { ConfirmDialog } from "./ConfirmDialog";
import { Alert } from "./Alert";
import "./MyBookings.css";

interface MyBookingsProps {
  userId: string;
  onBack: () => void;
}

export function MyBookings({ userId, onBack }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookings() {
      setLoading(true);
      setError(null);
      try {
        const data = await getBookings(userId);
        if (cancelled) return;
        // Sort by start time, most recent first
        data.sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        );
        setBookings(data);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load bookings",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBookings();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  function handleCancelClick(bookingId: string) {
    setCancellingId(bookingId);
  }

  function handleCancelDialogClose() {
    setCancellingId(null);
  }

  async function handleConfirmCancel() {
    if (!cancellingId) return;

    setIsCancelling(true);
    try {
      await cancelBooking(cancellingId, userId);
      // Update local state
      setBookings(
        bookings.map((b) =>
          b.id === cancellingId ? { ...b, status: "cancelled" } : b,
        ),
      );
      setSuccessMessage("Booking cancelled successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
      setCancellingId(null);
    }
  }

  const bookingToCancel = bookings.find((b) => b.id === cancellingId);

  function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // A booking is considered "active" (shown in the upcoming list and
  // cancellable) as long as it hasn't ended yet and isn't cancelled.
  // Previously this used `startTime > now`, which misclassified in-progress
  // bookings as "Past" and hid the Cancel button while the rental was live.
  function isActive(booking: Booking): boolean {
    return (
      new Date(booking.endTime) > new Date() && booking.status === "confirmed"
    );
  }

  const upcomingBookings = bookings.filter(isActive);
  const pastBookings = bookings.filter((b) => !isActive(b));

  return (
    <div className="my-bookings-container">
      <div className="my-bookings-header">
        <h2>My Bookings</h2>
        <button className="back-button" onClick={onBack}>
          ← Back to bikes
        </button>
      </div>

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {loading && <div className="loading">Loading bookings...</div>}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

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
                      onClick={() => handleCancelClick(booking.id)}
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

      {cancellingId && bookingToCancel && (
        <ConfirmDialog
          title="Cancel Booking"
          message={`Are you sure you want to cancel your booking for ${bookingToCancel.bike?.name || "this bike"}? This action cannot be undone.`}
          confirmText="Yes, Cancel Booking"
          cancelText="No, Keep Booking"
          onConfirm={handleConfirmCancel}
          onCancel={handleCancelDialogClose}
          isLoading={isCancelling}
          variant="danger"
        />
      )}
    </div>
  );
}
