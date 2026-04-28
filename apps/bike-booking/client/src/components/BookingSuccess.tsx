import { Booking } from "../types";
import "./BookingSuccess.css";

interface BookingSuccessProps {
  booking: Booking;
  onViewBookings: () => void;
  onBookAnother: () => void;
}

export function BookingSuccess({
  booking,
  onViewBookings,
  onBookAnother,
}: BookingSuccessProps) {
  function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "full",
      timeStyle: "short",
    });
  }

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h2>Booking Confirmed!</h2>
        <p className="success-message">
          Your bike has been successfully booked.
        </p>

        <div className="booking-summary">
          <h3>{booking.bike?.name}</h3>
          <div className="summary-row">
            <span className="label">Start:</span>
            <span>{formatDateTime(booking.startTime)}</span>
          </div>
          <div className="summary-row">
            <span className="label">End:</span>
            <span>{formatDateTime(booking.endTime)}</span>
          </div>
          {booking.totalPrice && (
            <div className="summary-row total">
              <span className="label">Total:</span>
              <span>${booking.totalPrice.toFixed(2)}</span>
            </div>
          )}
          <div className="booking-id">Booking ID: {booking.id}</div>
        </div>

        <div className="success-actions">
          <button className="view-button" onClick={onViewBookings}>
            View My Bookings
          </button>
          <button className="book-another-button" onClick={onBookAnother}>
            Book Another Bike
          </button>
        </div>
      </div>
    </div>
  );
}
