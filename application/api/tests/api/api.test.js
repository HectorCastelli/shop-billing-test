const request = require("supertest");
const api = require("../../src/api");
describe("General Check on API status", () => {
  it("should be running", async () => {
    const res = await request(api).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("healthy", "true");
  });
  it("should have a database connection", async () => {
    const res = await request(api).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("database", "up");
  });
});
