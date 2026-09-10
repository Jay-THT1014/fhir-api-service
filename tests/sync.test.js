const request = require("supertest");
const express = require("express");
const apiKeyAuth = require("../middleware/auth");

const app = express();
app.use(express.json());
app.use(apiKeyAuth);
app.post("/api/v1/fhir/sync/patient", (req, res) => res.status(202).json({ status: "QUEUED" }));

describe("API Security & Validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("should block requests without valid API Key", async () => {
    process.env.EHR_API_KEY = "secret";

    const response = await request(app).post("/api/v1/fhir/sync/patient").send({ sourceId: "123" });

    expect(response.status).toBe(401);
  });

  test("should allow requests with valid API Key", async () => {
    process.env.EHR_API_KEY = "secret";

    const response = await request(app)
      .post("/api/v1/fhir/sync/patient")
      .set("X-API-Key", "secret")
      .send({ sourceId: "123" });

    expect(response.status).toBe(202);
  });
});
