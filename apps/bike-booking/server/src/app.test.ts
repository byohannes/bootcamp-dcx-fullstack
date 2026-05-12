import request from "supertest";
import app from "./app";
import { Bike, User, Booking } from "./db/models";

// Helper to create a test bike
async function createTestBike(overrides = {}) {
  const bikeData = {
    name: "Test Bike",
    type: "mountain" as const,
    description: "A test bike for testing",
    pricePerHour: 15,
    imageUrl: "https://example.com/bike.jpg",
    ...overrides,
  };
  return await Bike.create(bikeData);
}

// Helper to create a test user
async function createTestUser(overrides = {}) {
  const userData = {
    email: `test${Date.now()}@example.com`,
    password: "password123",
    name: "Test User",
    ...overrides,
  };
  return await User.create(userData);
}

describe("Health API", () => {
  describe("GET /api/health", () => {
    it("should return status ok", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
    });

    it("should return JSON content type", async () => {
      const response = await request(app).get("/api/health");

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });

    it("should include database status", async () => {
      const response = await request(app).get("/api/health");

      expect(response.body).toHaveProperty("database");
      expect(response.body.database).toHaveProperty("connected");
    });

    it("should include uptime", async () => {
      const response = await request(app).get("/api/health");

      expect(response.body).toHaveProperty("uptime");
      expect(typeof response.body.uptime).toBe("number");
    });
  });
});

describe("Bikes API", () => {
  describe("GET /api/bikes", () => {
    it("should return empty list when no bikes exist", async () => {
      const response = await request(app).get("/api/bikes");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it("should return list of bikes", async () => {
      await createTestBike({ name: "Mountain Explorer" });
      await createTestBike({ name: "City Cruiser", type: "city" });

      const response = await request(app).get("/api/bikes");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it("should include availability status for each bike", async () => {
      await createTestBike();

      const response = await request(app).get("/api/bikes");

      expect(response.body.data[0]).toHaveProperty("isAvailable");
      expect(response.body.data[0].isAvailable).toBe(true);
    });

    it("should filter bikes by type", async () => {
      await createTestBike({ name: "Mountain 1", type: "mountain" });
      await createTestBike({ name: "Mountain 2", type: "mountain" });
      await createTestBike({ name: "City 1", type: "city" });

      const response = await request(app).get("/api/bikes?type=mountain");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      response.body.data.forEach((bike: { type: string }) => {
        expect(bike.type).toBe("mountain");
      });
    });

    it("should filter by available bikes only", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();

      // Create a booking that makes the bike unavailable now
      const now = new Date();
      const startTime = new Date(now.getTime() - 30 * 60 * 1000); // 30 mins ago
      const endTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins later

      await Booking.create({
        bikeId: bike._id,
        userId: user._id,
        startTime,
        endTime,
        status: "confirmed",
      });

      const response = await request(app).get("/api/bikes?available=true");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe("GET /api/bikes/:id", () => {
    it("should return a single bike", async () => {
      const bike = await createTestBike({ name: "Mountain Explorer" });

      const response = await request(app).get(`/api/bikes/${bike._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Mountain Explorer");
    });

    it("should return 404 for non-existent bike", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app).get(`/api/bikes/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should include bookings for the bike", async () => {
      const bike = await createTestBike();

      const response = await request(app).get(`/api/bikes/${bike._id}`);

      expect(response.body.data).toHaveProperty("bookings");
      expect(Array.isArray(response.body.data.bookings)).toBe(true);
    });
  });

  describe("GET /api/bikes/:id/availability", () => {
    it("should return availability for time range", async () => {
      const bike = await createTestBike();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const startTime = futureDate.toISOString();
      const endTime = new Date(
        futureDate.getTime() + 2 * 60 * 60 * 1000,
      ).toISOString();

      const response = await request(app).get(
        `/api/bikes/${bike._id}/availability?startTime=${startTime}&endTime=${endTime}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBe(true);
    });

    it("should return unavailable when bike is booked", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const startTime = futureDate.toISOString();
      const endTime = new Date(
        futureDate.getTime() + 2 * 60 * 60 * 1000,
      ).toISOString();

      await Booking.create({
        bikeId: bike._id,
        userId: user._id,
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
        status: "confirmed",
      });

      const response = await request(app).get(
        `/api/bikes/${bike._id}/availability?startTime=${startTime}&endTime=${endTime}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.available).toBe(false);
    });

    it("should require startTime and endTime", async () => {
      const bike = await createTestBike();

      const response = await request(app).get(
        `/api/bikes/${bike._id}/availability`,
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

describe("Bookings API", () => {
  describe("POST /api/bookings", () => {
    it("should create a new booking", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const startTime = futureDate.toISOString();
      const endTime = new Date(
        futureDate.getTime() + 2 * 60 * 60 * 1000,
      ).toISOString();

      const response = await request(app).post("/api/bookings").send({
        bikeId: bike._id.toString(),
        userId: user._id.toString(),
        startTime,
        endTime,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("confirmed");
      expect(response.body.data).toHaveProperty("totalPrice");
    });

    it("should prevent double booking", async () => {
      const bike = await createTestBike();
      const user1 = await createTestUser({ email: "user1@example.com" });
      const user2 = await createTestUser({ email: "user2@example.com" });
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const startTime = futureDate.toISOString();
      const endTime = new Date(
        futureDate.getTime() + 2 * 60 * 60 * 1000,
      ).toISOString();

      // First booking
      await request(app).post("/api/bookings").send({
        bikeId: bike._id.toString(),
        userId: user1._id.toString(),
        startTime,
        endTime,
      });

      // Second booking for same time
      const response = await request(app).post("/api/bookings").send({
        bikeId: bike._id.toString(),
        userId: user2._id.toString(),
        startTime,
        endTime,
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it("should require all fields", async () => {
      const bike = await createTestBike();

      const response = await request(app)
        .post("/api/bookings")
        .send({ bikeId: bike._id.toString() });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should reject booking in the past", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post("/api/bookings")
        .send({
          bikeId: bike._id.toString(),
          userId: user._id.toString(),
          startTime: pastDate.toISOString(),
          endTime: new Date(
            pastDate.getTime() + 2 * 60 * 60 * 1000,
          ).toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should reject when end time is before start time", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post("/api/bookings")
        .send({
          bikeId: bike._id.toString(),
          userId: user._id.toString(),
          startTime: futureDate.toISOString(),
          endTime: new Date(
            futureDate.getTime() - 2 * 60 * 60 * 1000,
          ).toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/bookings", () => {
    it("should return list of bookings", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await Booking.create({
        bikeId: bike._id,
        userId: user._id,
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
        status: "confirmed",
      });

      const response = await request(app).get("/api/bookings");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("should filter by userId", async () => {
      const bike = await createTestBike();
      const user1 = await createTestUser({ email: "user1@example.com" });
      const user2 = await createTestUser({ email: "user2@example.com" });
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await Booking.create({
        bikeId: bike._id,
        userId: user1._id,
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 1 * 60 * 60 * 1000),
        status: "confirmed",
      });

      await Booking.create({
        bikeId: bike._id,
        userId: user2._id,
        startTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
        endTime: new Date(futureDate.getTime() + 3 * 60 * 60 * 1000),
        status: "confirmed",
      });

      const response = await request(app).get(
        `/api/bookings?userId=${user1._id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });
  });

  describe("GET /api/bookings/:id", () => {
    it("should return a single booking", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const booking = await Booking.create({
        bikeId: bike._id,
        userId: user._id,
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
        status: "confirmed",
      });

      const response = await request(app).get(`/api/bookings/${booking._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("bike");
    });

    it("should return 404 for non-existent booking", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app).get(`/api/bookings/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/bookings/:id", () => {
    it("should cancel a booking when caller is the owner", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const booking = await Booking.create({
        bikeId: bike._id,
        userId: user._id,
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
        status: "confirmed",
      });

      const response = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set("x-user-id", user._id.toString());

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify booking is cancelled
      const updatedBooking = await Booking.findById(booking._id);
      expect(updatedBooking?.status).toBe("cancelled");
    });

    it("should return 401 when userId is missing", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const booking = await Booking.create({
        bikeId: bike._id,
        userId: user._id,
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
        status: "confirmed",
      });

      const response = await request(app).delete(
        `/api/bookings/${booking._id}`,
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      // Should not have been cancelled
      const unchanged = await Booking.findById(booking._id);
      expect(unchanged?.status).toBe("confirmed");
    });

    it("should return 403 when caller is not the owner", async () => {
      const bike = await createTestBike();
      const owner = await createTestUser({ email: "owner@example.com" });
      const other = await createTestUser({ email: "other@example.com" });
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const booking = await Booking.create({
        bikeId: bike._id,
        userId: owner._id,
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
        status: "confirmed",
      });

      const response = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set("x-user-id", other._id.toString());

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);

      const unchanged = await Booking.findById(booking._id);
      expect(unchanged?.status).toBe("confirmed");
    });

    it("should return 404 for non-existent booking", async () => {
      const user = await createTestUser();
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/api/bookings/${fakeId}`)
        .set("x-user-id", user._id.toString());

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should not cancel already cancelled booking", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const booking = await Booking.create({
        bikeId: bike._id,
        userId: user._id,
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
        status: "cancelled",
      });

      const response = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set("x-user-id", user._id.toString());

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should not cancel a booking that has already ended", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();
      const pastStart = new Date(Date.now() - 4 * 60 * 60 * 1000);
      const pastEnd = new Date(Date.now() - 1 * 60 * 60 * 1000);

      // Use insertMany to bypass the schema's pre-save validation
      // for past dates, mirroring a booking that was created then ran out.
      const booking = await Booking.create({
        bikeId: bike._id,
        userId: user._id,
        startTime: pastStart,
        endTime: pastEnd,
        status: "confirmed",
      });

      const response = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set("x-user-id", user._id.toString());

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      const unchanged = await Booking.findById(booking._id);
      expect(unchanged?.status).toBe("confirmed");
    });

    it("should accept userId from request body as a fallback", async () => {
      const bike = await createTestBike();
      const user = await createTestUser();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const booking = await Booking.create({
        bikeId: bike._id,
        userId: user._id,
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
        status: "confirmed",
      });

      const response = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .send({ userId: user._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

describe("Users API", () => {
  describe("POST /api/users/register", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/users/register").send({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe("newuser@example.com");
      expect(response.body.data.name).toBe("New User");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("should reject duplicate email", async () => {
      await createTestUser({ email: "duplicate@example.com" });

      const response = await request(app).post("/api/users/register").send({
        email: "duplicate@example.com",
        password: "password123",
        name: "Another User",
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it("should require all fields", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should validate email format", async () => {
      const response = await request(app).post("/api/users/register").send({
        email: "invalid-email",
        password: "password123",
        name: "Test User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should require minimum password length", async () => {
      const response = await request(app).post("/api/users/register").send({
        email: "test@example.com",
        password: "12345",
        name: "Test User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/users/login", () => {
    it("should login existing user", async () => {
      await createTestUser({
        email: "login@example.com",
        password: "password123",
      });

      const response = await request(app).post("/api/users/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe("login@example.com");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("should reject wrong password", async () => {
      await createTestUser({
        email: "wrong@example.com",
        password: "correctpassword",
      });

      const response = await request(app).post("/api/users/login").send({
        email: "wrong@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should reject non-existent user", async () => {
      const response = await request(app).post("/api/users/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return user by ID", async () => {
      const user = await createTestUser({ name: "Fetch User" });

      const response = await request(app).get(`/api/users/${user._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Fetch User");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app).get(`/api/users/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

describe("404 Handler", () => {
  it("should return 404 for unknown routes", async () => {
    const response = await request(app).get("/api/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Not found");
  });
});
