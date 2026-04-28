import { useState } from "react";
import type { Bike, Booking } from "../types";
import { createBooking, checkAvailability } from "../api";
import "./BookingForm.css";

interface BookingFormProps {
  bike: Bike;
  userId: string;
  onSuccess: (booking: Booking) => void;
  onCancel: () => void;
}

export function BookingForm({
  bike,
  userId,
  onSuccess,
  onCancel,
}: BookingFormProps) {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  async function handleCheckAvailability() {
    if (!startDate || !startTime || !endDate || !endTime) {
      setError("Please fill in all date and time fields");
      return;
    }

    const startDateTime = `${startDate}T${startTime}:00`;
    const endDateTime = `${endDate}T${endTime}:00`;

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      setError("End time must be after start time");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const available = await checkAvailability(
        bike.id,
        startDateTime,
        endDateTime,
      );
      setIsAvailable(available);
      if (!available) {
        setError("Bike is not available for the selected time period");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check availability",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!startDate || !startTime || !endDate || !endTime) {
      setError("Please fill in all date and time fields");
      return;
    }

    const startDateTime = `${startDate}T${startTime}:00`;
    const endDateTime = `${endDate}T${endTime}:00`;

    setLoading(true);
    setError(null);
    try {
      const booking = await createBooking({
        bikeId: bike.id,
        userId,
        startTime: startDateTime,
        endTime: endDateTime,
      });
      onSuccess(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  // Calculate estimated price
  function getEstimatedPrice(): number | null {
    if (!startDate || !startTime || !endDate || !endTime) return null;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (hours <= 0) return null;
    return Math.round(hours * bike.pricePerHour * 100) / 100;
  }

  const estimatedPrice = getEstimatedPrice();

  return (
    <div className="booking-form-container">
      <div className="booking-form-header">
        <h2>Book {bike.name}</h2>
        <button className="back-button" onClick={onCancel}>
          ← Back to bikes
        </button>
      </div>

      <div className="booking-form-content">
        <div className="bike-summary">
          <span className="bike-type-badge">{bike.type}</span>
          <p>{bike.description}</p>
          <p className="price-info">${bike.pricePerHour}/hour</p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                min={today}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setIsAvailable(null);
                }}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setIsAvailable(null);
                }}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                min={startDate || today}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setIsAvailable(null);
                }}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setIsAvailable(null);
                }}
                required
              />
            </div>
          </div>

          {estimatedPrice !== null && (
            <div className="price-estimate">
              <span>Estimated Total:</span>
              <span className="price">${estimatedPrice.toFixed(2)}</span>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          {isAvailable === true && (
            <div className="availability-success">
              ✓ Bike is available for selected time!
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="check-button"
              onClick={handleCheckAvailability}
              disabled={
                loading || !startDate || !startTime || !endDate || !endTime
              }
            >
              Check Availability
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading || isAvailable !== true}
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
