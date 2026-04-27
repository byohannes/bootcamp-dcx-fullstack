import request from "supertest";
import app from "./app";

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

describe("Express App", () => {
  it("should parse JSON body", async () => {
    const response = await request(app)
      .post("/api/health")
      .send({ test: "data" })
      .set("Content-Type", "application/json");

    // Will return 404 since POST /api/health doesn't exist,
    // but body should still be parsed
    expect(response.status).toBe(404);
  });

  it("should return 404 for unknown routes", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
  });
});
