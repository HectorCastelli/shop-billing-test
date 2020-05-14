const request = require("supertest");
const api = require("../../src/api");
const baseUrl = "/orders/";

const { Order, Product, sequelize } = require("../../src/database/sequelize");
beforeAll(() => {
  return sequelize.sync({
    force: true,
    logging: false,
  });
});
afterAll(() => {
  sequelize.close();
});

describe("Check Orders endpoints", () => {
  describe("Order Creation", () => {
    it("Create a new order", async () => {
      const newOrder = await Order.build({}).serialize();
      const res = await request(api)
        .post(baseUrl + "create")
        .send(newOrder);
      expect(res.statusCode).toEqual(201);
      expect(res.body).not.toBeNull();
      expect(res.body[0]).toHaveProperty("id");
    });
    it("Creates multiple orders", async () => {
      const newOrders = [];
      newOrders.push(await Order.build({}));
      newOrders.push(await Order.build({}));
      const res = await request(api)
        .post(baseUrl + "create")
        .send(newOrders.map((o) => o.serialize()));
      expect(res.statusCode).toEqual(201);
      expect(res.body[0]).toHaveProperty("id");
    });
    it("Fetch an valid order", async () => {
      const res = await request(api).get(baseUrl + "order/1");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("id");
    });
    it("Fail when retrieving an invalid order", async () => {
      const orderId = 1234;
      const res = await request(api).get(baseUrl + `order/${orderId}`);
      expect(res.statusCode).toEqual(404);
    });
  });
  describe("Order Operations", () => {
    it("Add a single product to an order", async () => {
      const sampleProductId = 1;
      const sampleProduct = await Product.build({
        productId: sampleProductId,
        name: "2L Soda",
        unitType: "bottle",
        basePrice: 1.52,
      }).serialize();
      const res = await request(api)
        .post(baseUrl + "order/1/product/add")
        .send({
          ProductId: sampleProductId,
          amount: 1,
        });
        expect(res).toBeNull();
      expect(res.statusCode).toEqual(201);
      expect(res.body[0]).toHaveProperty("productId", sampleProductId);
    });
    it("Add multiple products to an order", async () => {
      const sampleProducts = [];
      sampleProducts.push(
        await Product.build({
          productId: 2,
          name: "Gardening Kit",
          unitType: "unit",
          basePrice: 12.52,
        }).serialize()
      );
      sampleProducts.push(
        await Product.build({
          productId: 3,
          name: "1.5L Lemon Soda",
          unitType: "bottle",
          basePrice: 1.31,
        }).serialize()
      );
      const res = await request(api)
        .post(baseUrl + "order/1/product/add")
        .send([
          { ProductId: sampleProduct[0].productId, amount: 0.2 },
          { ProductId: sampleProduct[1].productId, amount: 2 },
        ]);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("products");
      expect(res.body.products[0]).toHaveProperty("productId", 1);
      expect(res.body.products[1]).toHaveProperty("productId", 2);
    });
    it("Fail when adding an invalid product to an order", async () => {
      const res = await request(api)
        .post(baseUrl + "order/1/product/add")
        .send({ invalid: "value" });
      expect(res.statusCode).toEqual(400);
    });
    it("Remove a single unit of a product from a valid Order", async () => {
      const res = await request(api)
        .post(baseUrl + "1/product/remove")
        .send({
          ProductId: 1,
          amount: 1,
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("remainingAmount");
    });
    it("Remove a product from a valid Order", async () => {
      const res = await request(api)
        .post(baseUrl + "1/product/remove")
        .send({
          ProductId: 1,
        });
      expect(res.statusCode).toEqual(200);
    });
    it("Fail when removing an invalid product from an order", async () => {
      const res = await request(api)
        .post(baseUrl + "order/1/product/remove")
        .send({ invalid: "value" });
      expect(res.statusCode).toEqual(400);
    });
    it("Compute the cost of an order", async () => {
      const res = await request(api).get(baseUrl + "1/getCost");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("computedCost");
    });
    it("Process payment to a valid order", async () => {
      const res = await request(api).post(baseUrl + "order/1/processPayment");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("isPayed", true);
    });
    it("Process payment to an invalid (already paid for) order", async () => {
      const res = await request(api).post(baseUrl + "order/1/processPayment");
      expect(res.statusCode).toEqual(403);
    });
  });
});
