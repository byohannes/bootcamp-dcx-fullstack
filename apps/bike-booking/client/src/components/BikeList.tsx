import { useEffect, useState } from "react";
import type { Bike } from "../types";
import { getBikes } from "../api";
import { BikeCard } from "./BikeCard";
import "./BikeList.css";

interface BikeListProps {
  onSelectBike: (bike: Bike) => void;
}

const bikeTypes = ["all", "mountain", "road", "city", "electric"] as const;

export function BikeList({ onSelectBike }: BikeListProps) {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    loadBikes();
  }, [selectedType]);

  async function loadBikes() {
    setLoading(true);
    setError(null);
    try {
      const type = selectedType === "all" ? undefined : selectedType;
      const data = await getBikes(type);
      setBikes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bikes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bike-list-container">
      <div className="bike-list-header">
        <h2>Available Bikes</h2>
        <div className="bike-filters">
          {bikeTypes.map((type) => (
            <button
              key={type}
              className={`filter-button ${selectedType === type ? "active" : ""}`}
              onClick={() => setSelectedType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="loading">Loading bikes...</div>}

      {error && <div className="error">{error}</div>}

      {!loading && !error && bikes.length === 0 && (
        <div className="empty">No bikes available</div>
      )}

      <div className="bike-grid">
        {bikes.map((bike) => (
          <BikeCard key={bike.id} bike={bike} onSelect={onSelectBike} />
        ))}
      </div>
    </div>
  );
}
