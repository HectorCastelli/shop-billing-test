const request = require("supertest");
const api = require("../../src/api");
const baseUrl = "/orders/";

const {
  Order,
  Product,
  OrderProducts,
  sequelize,
} = require("../../src/database/sequelize");
beforeAll(() => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync({
        force: true,
        logging: false,
      })
      .then(() => {
        sequelize.authenticate().then(async () => {
          //Insert sample data
          const createdProducts = await Product.bulkCreate([
            {
              productId: 1,
              name: "2L Cola Soda",
              unitType: "bottle",
              basePrice: 1.52,
            },
            {
              productId: 2,
              name: "white rice",
              unitType: "kilo",
              basePrice: 0.1,
              inCirculation: false,
            },
            {
              productId: 2,
              name: "white rice",
              unitType: "kilo",
              basePrice: 0.2,
              inCirculation: false,
            },
            {
              productId: 2,
              name: "white rice",
              unitType: "kilo",
              basePrice: 0.15,
            },
            {
              productId: 3,
              name: "Nintendo Switch",
              unitType: "console",
              basePrice: 250,
              inCirculation: false,
            },
            {
              productId: 4,
              name: "Gardening Kit",
              unitType: "unit",
              basePrice: 12.52,
            },
            {
              productId: 5,
              name: "Face masks",
              unitType: "3-pack",
              basePrice: 7.5,
            },
            {
              productId: 6,
              name: "1.5L Lemon Soda",
              unitType: "bottle",
              basePrice: 1.31,
            },
            {
              productId: 7,
              name: "Sushi box",
              unitType: "box",
              basePrice: 12.52,
            },
            {
              productId: 8,
              name: "Microwave Gyozas",
              unitType: "pack of six",
              basePrice: 3.12,
            },
            {
              productId: 9,
              name: "Nuggets",
              unitType: "pack",
              basePrice: 3.65,
            },
            {
              productId: 10,
              name: "Organic Nuggets",
              unitType: "pack",
              basePrice: 5.2,
            },
          ]);

          const createdOrders = await Order.bulkCreate([
            {
              id: 1,
              isPaid: true,
              finalCost: 4.56,
            },
            {
              id: 2,
              isPaid: true,
              finalCost: 5.01,
            },
            {
              id: 3,
              isPaid: true,
              finalCost: 755.01,
            },
            {
              id: 4,
            },
          ]);
        });
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
});

afterAll(async () => {
  return await sequelize.close();
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
    it("Fetch a valid order", async () => {
      const res = await request(api).get(baseUrl + "order/1");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("id");
    });
    it("Fail when retrieving an invalid order", async () => {
      const orderId = 9999;
      const res = await request(api).get(baseUrl + `order/${orderId}`);
      expect(res.statusCode).toEqual(404);
    });
  });
  describe("Order Operations", () => {
    describe("Product Addition", () => {
      it("Add a single product to an order", async () => {
        const newOrder = await Order.create({});
        const sampleProduct = await Product.findByPk(1);
        const res = await request(api)
          .post(baseUrl + "order/" + newOrder.id + "/product/add")
          .send({
            ProductId: sampleProduct.serialize.productId,
            amount: 1,
          });
        expect(res.statusCode).toEqual(201);
      });
      it("Add multiple products to an order", async () => {
        const newOrder = await Order.create({});
        const sampleProducts = [];
        sampleProducts.push(await Product.findByPk(4));
        sampleProducts.push(await Product.findByPk(6));
        const res = await request(api)
          .post(baseUrl + "order/" + newOrder.id + "/product/add")
          .send([
            { ProductId: sampleProducts[0].serialize().productId, amount: 0.2 },
            { ProductId: sampleProducts[1].serialize().productId, amount: 2 },
          ]);
        expect(res.statusCode).toEqual(201);
      });
      it("Fail when adding an invalid product to an order", async () => {
        const newOrder = await Order.create({});
        const res = await request(api)
          .post(baseUrl + "order/" + newOrder.id + "/product/add")
          .send({ invalid: "value" });
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("Product Removal", () => {
      it("Remove a single unit of a product from a valid Order", async () => {
        Order.create({}).then(async (newOrder) => {
          const newOrderId = newOrder.serialize().id;
          let sampleProducts = [];
          sampleProducts.push(await Product.findByPk(7));
          sampleProducts.push(await Product.findByPk(8));
          const sampleOrderProducts = [
            {
              OrderId: newOrderId,
              ProductId: sampleProducts[0].serialize.productId,
              amount: 10,
            },
            {
              OrderId: newOrderId,
              ProductId: sampleProducts[1].serialize.productId,
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
              ProductId: sampleProducts[0].serialize.productId,
              amount: 1,
            });
          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty("remainingAmount");
        });
      });
      it("Remove a product from a valid Order", async () => {
        Order.create({}).then(async (newOrder) => {
          const newOrderId = newOrder.serialize().id;
          let sampleProducts = [];
          sampleProducts.push(await Product.findByPk(9));
          sampleProducts.push(await Product.findByPk(10));

          sampleProducts = await Product.bulkCreate(sampleProducts);
          console.warn(sampleProducts);
          const sampleOrderProducts = [
            {
              OrderId: newOrderId,
              ProductId: sampleProducts[0].serialize.productId,
              amount: 10,
            },
            {
              OrderId: newOrderId,
              ProductId: sampleProducts[1].serialize.productId,
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
              ProductId: sampleProducts[0].serialize.productId,
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
          let sampleProducts = [];
          sampleProducts.push(await Product.findByPk(1));
          sampleProducts.push(await Product.findByPk(2));

          sampleProducts = await Product.bulkCreate(sampleProducts);
          console.warn(sampleProducts);
          const sampleOrderProducts = [
            {
              OrderId: newOrderId,
              ProductId: sampleProducts[0].serialize.productId,
              amount: 10,
            },
            {
              OrderId: newOrderId,
              ProductId: sampleProducts[1].serialize.productId,
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
        expect(res.body).toHaveProperty("isPaid", true);
      });
      it("Process payment to an invalid (already paid for) order", async () => {
        const res = await request(api).post(baseUrl + "order/1/processPayment");
        expect(res.statusCode).toEqual(403);
      });
    });
  });
});
