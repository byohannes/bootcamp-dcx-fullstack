import request from "supertest";
import app from "./app";
import { bookings } from "./data";

// Clear bookings before each test
beforeEach(() => {
  bookings.length = 0;
});

describe("Health API", () => {
  describe("GET /api/health", () => {
    it("should return status ok", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    });

    it("should return JSON content type", async () => {
      const response = await request(app).get("/api/health");

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });
  });
});

describe("Bikes API", () => {
  describe("GET /api/bikes", () => {
    it("should return list of bikes", async () => {
      const response = await request(app).get("/api/bikes");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should include availability status for each bike", async () => {
      const response = await request(app).get("/api/bikes");

      expect(response.body.data[0]).toHaveProperty("isAvailable");
    });

    it("should filter bikes by type", async () => {
      const response = await request(app).get("/api/bikes?type=mountain");

      expect(response.status).toBe(200);
      response.body.data.forEach((bike: { type: string }) => {
        expect(bike.type).toBe("mountain");
      });
    });
  });

  describe("GET /api/bikes/:id", () => {
    it("should return a single bike", async () => {
      const response = await request(app).get("/api/bikes/bike-1");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe("bike-1");
    });

    it("should return 404 for non-existent bike", async () => {
      const response = await request(app).get("/api/bikes/non-existent");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

describe("Bookings API", () => {
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  const startTime = futureDate.toISOString();
  const endTime = new Date(
    futureDate.getTime() + 2 * 60 * 60 * 1000,
  ).toISOString(); // 2 hours later

  describe("POST /api/bookings", () => {
    it("should create a new booking", async () => {
      const response = await request(app).post("/api/bookings").send({
        bikeId: "bike-1",
        userId: "user-1",
        startTime,
        endTime,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bikeId).toBe("bike-1");
      expect(response.body.data.status).toBe("confirmed");
    });

    it("should prevent double booking", async () => {
      // First booking
      await request(app).post("/api/bookings").send({
        bikeId: "bike-1",
        userId: "user-1",
        startTime,
        endTime,
      });

      // Second booking for same time
      const response = await request(app).post("/api/bookings").send({
        bikeId: "bike-1",
        userId: "user-2",
        startTime,
        endTime,
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it("should require all fields", async () => {
      const response = await request(app)
        .post("/api/bookings")
        .send({ bikeId: "bike-1" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/bookings", () => {
    it("should return list of bookings", async () => {
      // Create a booking first
      await request(app).post("/api/bookings").send({
        bikeId: "bike-1",
        userId: "user-1",
        startTime,
        endTime,
      });

      const response = await request(app).get("/api/bookings");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("should filter by userId", async () => {
      await request(app).post("/api/bookings").send({
        bikeId: "bike-1",
        userId: "user-1",
        startTime,
        endTime,
      });

      const response = await request(app).get("/api/bookings?userId=user-1");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].userId).toBe("user-1");
    });
  });

  describe("DELETE /api/bookings/:id", () => {
    it("should cancel a booking", async () => {
      // Create a booking
      const createResponse = await request(app).post("/api/bookings").send({
        bikeId: "bike-1",
        userId: "user-1",
        startTime,
        endTime,
      });

      const bookingId = createResponse.body.data.id;

      // Cancel it
      const response = await request(app).delete(`/api/bookings/${bookingId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 404 for non-existent booking", async () => {
      const response = await request(app).delete("/api/bookings/non-existent");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

describe("Express App", () => {
  it("should return 404 for unknown routes", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
  });
});
