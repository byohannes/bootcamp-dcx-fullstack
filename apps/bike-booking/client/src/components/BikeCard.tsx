import type { Bike } from "../types";
import "./BikeCard.css";

interface BikeCardProps {
  bike: Bike;
  onSelect: (bike: Bike) => void;
}

const bikeTypeEmoji: Record<string, string> = {
  mountain: "⛰️",
  road: "🏎️",
  city: "🏙️",
  electric: "⚡",
};

export function BikeCard({ bike, onSelect }: BikeCardProps) {
  return (
    <div className={`bike-card ${!bike.isAvailable ? "unavailable" : ""}`}>
      <div className="bike-image">
        <span className="bike-emoji">{bikeTypeEmoji[bike.type] || "🚲"}</span>
      </div>
      <div className="bike-info">
        <h3>{bike.name}</h3>
        <span className="bike-type">{bike.type}</span>
        <p className="bike-description">{bike.description}</p>
        <div className="bike-footer">
          <span className="bike-price">${bike.pricePerHour}/hour</span>
          <span
            className={`bike-status ${bike.isAvailable ? "available" : "unavailable"}`}
          >
            {bike.isAvailable ? "Available" : "Booked"}
          </span>
        </div>
        <button
          className="book-button"
          onClick={() => onSelect(bike)}
          disabled={!bike.isAvailable}
        >
          {bike.isAvailable ? "Book Now" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
