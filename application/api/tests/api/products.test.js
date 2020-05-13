const request = require("supertest");
const api = require("../../src/api");
const baseUrl = "/products/";

const { Product } = require("../../src/database/sequelize");

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
  it("Create a new deactivated product", async () => {
    const sampleProduct = await Product.create({
      productId: 4,
      name: "Nintendo Switch",
      unitType: "console",
      basePrice: 250,
      inCirculation: false,
    });
    const res = await request(api)
      .post(baseUrl + "/create")
      .send(sampleProduct);
    expect(res.statusCode).toEqual(201);
  });
  it("Create multiple products", async () => {
    const sampleProducts = [];
    sampleProducts.push(
      await Product.create({
        productId: 5,
        name: "Gardening Kit",
        unitType: "unit",
        basePrice: 12.52,
      })
    );
    sampleProducts.push(
      await Product.create({
        productId: 5,
        name: "1.5L Lemon Soda",
        unitType: "bottle",
        basePrice: 1.31,
      })
    );
    const res = await request(api)
      .post(baseUrl + "/create")
      .send(sampleProducts);
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
      name: "2L Cola Soda",
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
      .post(baseUrl + "/product/2/updatePrice")
      .send({ newPrice: 1.64 });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("product");
  });
  it("Update the price of a product with invalid format", async () => {
    const res = await request(api).post(baseUrl + "/product/2/updatePrice");
    expect(res.statusCode).toEqual(403);
  });
  it("Update the price of a product with invalid information", async () => {
    const res = await request(api)
      .post(baseUrl + "/product/2/updatePrice")
      .send({ newPrice: "a" });
    expect(res.statusCode).toEqual(403);
  });
  it("Remove a product from circulation", async () => {
    const res = await request(api).post(baseUrl + "/product/3/remove");
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
