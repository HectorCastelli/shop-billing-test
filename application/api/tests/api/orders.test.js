const request = require("supertest");
const api = require("../../src/api");
const baseUrl = "/orders/";

const {
  Order,
  Product,
  OrderProducts,
  sequelize,
} = require("../../src/database/sequelize");
beforeAll(async () => {
  return await sequelize.sync({
    force: true,
    logging: false,
  });
});
afterAll(() => {
  return sequelize.close();
});
beforeEach(() => {
  sequelize
    .authenticate()
    .then(() => console.log("Database is UP"))
    .catch((e) => console.error("Database is DOWN", e));
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
    describe("Product Addition", () => {
      it("Add a single product to an order", async () => {
        const newOrder = await Order.create({});
        const sampleProductId = 4;
        const sampleProduct = await Product.create({
          productId: sampleProductId,
          name: "2L Soda",
          unitType: "bottle",
          basePrice: 1.52,
        });
        const res = await request(api)
          .post(baseUrl + "order/" + newOrder.id + "/product/add")
          .send({
            ProductId: sampleProductId,
            amount: 1,
          });
        expect(res.statusCode).toEqual(201);
      });
      it("Add multiple products to an order", async () => {
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
            productId: 6,
            name: "1.5L Lemon Soda",
            unitType: "bottle",
            basePrice: 1.31,
          })
        );
        const res = await request(api)
          .post(baseUrl + "order/1/product/add")
          .send([
            { ProductId: sampleProducts[0].serialize().productId, amount: 0.2 },
            { ProductId: sampleProducts[1].serialize().productId, amount: 2 },
          ]);
        expect(res.statusCode).toEqual(201);
      });
      it("Fail when adding an invalid product to an order", async () => {
        const res = await request(api)
          .post(baseUrl + "order/1/product/add")
          .send({ invalid: "value" });
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("Product Removal", () => {
      it("Remove a single unit of a product from a valid Order", async () => {
        Order.create({}).then(async (newOrder) => {
          const newOrderId = newOrder.serialize().id;
          let sampleProducts = [
            {
              productId: 6,
              name: "Sushi box",
              unitType: "box",
              basePrice: 12.52,
            },
            {
              productId: 7,
              name: "Microwave Gyozas",
              unitType: "pack of six",
              basePrice: 3.12,
            },
          ];

          sampleProducts = await Product.bulkCreate(sampleProducts);
          console.warn(sampleProducts);
          const sampleOrderProducts = [
            {
              OrderId: newOrderId,
              ProductId: 6,
              amount: 10,
            },
            {
              OrderId: newOrderId,
              ProductId: 7,
              amount: 3,
            },
          ];
          const createdProducts = sampleOrderProducts.map(
            async (orderProduct) => {
              return await OrderProducts.updateAmountOrInsert(
                orderProduct.orderId,
                orderProduct.productId,
                orderProduct.amount
              );
            }
          );
          expect(createdProducts).toBeTruthy();
          const res = await request(api)
            .post(baseUrl + "order/" + newOrderId + "/product/remove")
            .send({
              ProductId: 6,
              amount: 1,
            });
          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty("remainingAmount");
        });
      });
      it("Remove a product from a valid Order", async () => {
        Order.create({}).then(async (newOrder) => {
          const newOrderId = newOrder.serialize().id;
          let sampleProducts = [
            {
              productId: 8,
              name: "Nuggets",
              unitType: "pack",
              basePrice: 3.65,
            },
            {
              productId: 9,
              name: "Organiz Nuggets",
              unitType: "pack",
              basePrice: 5.2,
            },
          ];

          sampleProducts = await Product.bulkCreate(sampleProducts);
          console.warn(sampleProducts);
          const sampleOrderProducts = [
            {
              OrderId: newOrderId,
              ProductId: 8,
              amount: 10,
            },
            {
              OrderId: newOrderId,
              ProductId: 9,
              amount: 3,
            },
          ];
          const createdProducts = sampleOrderProducts.map(
            async (orderProduct) => {
              return await OrderProducts.updateAmountOrInsert(
                orderProduct.orderId,
                orderProduct.productId,
                orderProduct.amount
              );
            }
          );
          expect(createdProducts).toBeTruthy();
          const res = await request(api)
            .post(baseUrl + "order/" + newOrderId + "/product/remove")
            .send({
              ProductId: 8,
            });
          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty("remainingAmount");
        });
      });
      it("Fail when removing an invalid product from an order", async () => {
        const res = await request(api)
          .post(baseUrl + "order/1/product/remove")
          .send({ invalid: "value" });
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("Order Computations", () => {
      it("Compute the cost of an order", async () => {
        Order.create({}).then(async (newOrder) => {
          const newOrderId = newOrder.serialize().id;
          console.warn(newOrderId);

          let sampleProducts = [
            {
              productId: 1,
              name: "Gardening Kit",
              unitType: "unit",
              basePrice: 12.52,
            },
            {
              productId: 2,
              name: "1.5L Lemon Soda",
              unitType: "bottle",
              basePrice: 1.31,
            },
          ];

          sampleProducts = await Product.bulkCreate(sampleProducts);
          console.warn(sampleProducts);
          const sampleOrderProducts = [
            {
              OrderId: newOrderId,
              ProductId: 1,
              amount: 10,
            },
            {
              OrderId: newOrderId,
              ProductId: 2,
              amount: 3,
            },
          ];
          const createdProducts = sampleOrderProducts.map(
            async (orderProduct) => {
              return await OrderProducts.updateAmountOrInsert(
                orderProduct.orderId,
                orderProduct.productId,
                orderProduct.amount
              );
            }
          );
          expect(createdProducts).toBeTruthy();

          const res = await request(api).get(
            baseUrl + "order/" + newOrderId + "/getCost"
          );
          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty("computedCost");
        });
      });
      it("Fails when computing the cost of an empty order", async () => {
        const res = await request(api).get(baseUrl + "order/1/getCost");
        expect(res.statusCode).toEqual(404);
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
});
