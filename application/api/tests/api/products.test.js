const request = require("supertest");
const api = require("../../src/api");
const baseUrl = "/products/";

describe("Check Products endpoints", () => {
  it("Create a new unit-based product", async () => {
    const sampleProduct = await Product.create({
      productId: 2,
      name: "2L Soda",
      unitType: "bottle",
      basePrice: 1.52,
    });
    const res = await request(api)
      .post(baseUrl + "/create")
      .send(sampleProduct);
    expect(res.statusCode).toEqual(201);
  });
  it("Create a new weight-based product", async () => {
    const sampleProduct = await Product.create({
      productId: 3,
      name: "white rice",
      unitType: "kilo",
      basePrice: 0.1,
    });
    const res = await request(api)
      .post(baseUrl + "/create")
      .send(sampleProduct);
    expect(res.statusCode).toEqual(201);
  });
  it("Fail when creating an invalid product", async () => {
    const res = await request(api)
      .post(baseUrl + "/create")
      .send({ invalid: "value" });
    expect(res.statusCode).toEqual(400);
  });
  it("Fail when creating an already existing product", async () => {
    const sampleProduct = await Product.create({
      productId: 2,
      name: "2L Soda",
      unitType: "bottle",
      basePrice: 1.52,
    });
    const res = await request(api)
      .post(baseUrl + "/create")
      .send(sampleProduct);
    expect(res.statusCode).toEqual(403);
  });
  it("Update the price of a product", async () => {
    const res = await request(api)
      .post(baseUrl + "/2/updatePrice")
      .send({ newPrice: 1.64 });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("product");
  });
  it("Remove a product from circulation", async () => {
    const res = await request(api).post(baseUrl + "/3/remove");
    expect(res.statusCode).toEqual(200);
  });
  it("Search a product by its name", async () => {
    const res = await request(api)
      .get(baseUrl + "/search")
      .query({ name: "Soda" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("products");
  });
  it("Search a product by a price range", async () => {
    const res = await request(api)
      .get(baseUrl + "/search")
      .query({ from: 1 });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("products");
  });
  it("List all products when no search parameters are present", async () => {
    const res = await request(api).get(baseUrl + "/search");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("products");
  });
  it("Search a product that doesn't exist", async () => {
    const res = await request(api)
      .get(baseUrl + "/search")
      .query({ name: "Product that does not exist" });
    expect(res.statusCode).toEqual(404);
  });
});
