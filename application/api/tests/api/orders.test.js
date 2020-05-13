const request = require("supertest");
const api = require("../../src/api");
const baseUrl = "/orders/";

const { Order, Product } = require("../../src/database/sequelize");

describe("Check Orders endpoints", () => {
  it("Create a new order", async () => {
    const newOrder = await Order.create({});
    const res = await request(api)
      .post(baseUrl + "orders/create")
      .send(newOrder);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("order");
  });
  it("Fetch an valid order", async () => {
    const res = await request(api).get(baseUrl + "orders/1");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("order");
  });
  it("Fail when retrieving an invalid order", async () => {
    const orderId = 1234;
    const res = await request(api).get(baseUrl + `/orders/${orderId}`);
    expect(res.statusCode).toEqual(404);
  });
  it("Add a single product to an order", async () => {
    const newProductId = 1234;
    const sampleProduct = await Product.create({
      productId: newProductId,
      name: "Car Battery",
      unitType: "unit",
      basePrice: 84.95,
    });
    const res = await request(api)
      .post(baseUrl + "/1/product/add")
      .send({
        product: sampleProduct,
        amount: 1,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("products");
    expect(res.body.products[0]).toHaveProperty("productId", newProductId);
  });
  it("Add multiple products to an order", async () => {
    const sampleProducts = [];
    sampleProducts.push(
      await Product.create({
        productId: 1235,
        name: "Apple",
        unitType: "kilo",
        basePrice: 0.32,
      })
    );
    sampleProducts.push(
      await Product.create({
        productId: 1236,
        name: "Water 500ml",
        unitType: "bottle",
        basePrice: 0.6,
      })
    );
    const res = await request(api)
      .post(baseUrl + "/1/product/add")
      .send([
        { product: sampleProducts[0], amount: 0.2 },
        { product: sampleProducts[1], amount: 2 },
      ]);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("products");
    expect(res.body.products[0]).toHaveProperty("productId", 1235);
    expect(res.body.products[1]).toHaveProperty("productId", 1236);
  });
  it("Fail when adding an invalid product to an order", async () => {
    const res = await request(api)
      .post(baseUrl + "/1/product/add")
      .send({ invalid: "value" });
    expect(res.statusCode).toEqual(400);
  });
  it("Remove a product from a valid Order", async () => {
    const res = await request(api)
      .post(baseUrl + "1/product/remove")
      .send({
        productId: 1,
      });
    expect(res.statusCode).toEqual(200);
  });
  it("Fail when removing a valid product from an order that doesn't have it", async () => {
    const res = await request(api)
      .post(baseUrl + "/1/product/remove")
      .send({ invalid: "value" });
    expect(res.statusCode).toEqual(400);
  });
  it("Remove a single unit of a product from a valid Order", async () => {
    const res = await request(api)
      .post(baseUrl + "1/product/remove")
      .send({
        productId: 1236,
        amount: 1,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("remainingAmount");
  });
  it("Fail when removing an invalid product from an order", async () => {
    const res = await request(api)
      .post(baseUrl + "/1/product/remove")
      .send({ invalid: "value" });
    expect(res.statusCode).toEqual(400);
  });
  it("Compute the cost of an order", async () => {
    const res = await request(api).get(baseUrl + "/1/getCost");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("computedCost");
  });
  it("Process payment to a valid order", async () => {
    const res = await request(api).post(baseUrl + "/1/processPayment");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("order");
  });
  it("Process payment to an invalid (already paid for) order", async () => {
    const res = await request(api).post(baseUrl + "/1/processPayment");
    expect(res.statusCode).toEqual(403);
  });
});
