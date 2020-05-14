const request = require("supertest");
const moment = require("moment");
const api = require("../../src/api");
const baseUrl = "/analytics/";

const {
  Product,
  Order,
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
          //Insert sample data for these metrics.

          const today = moment().toDate();
          const fiveDaysAgo = moment().subtract(5, "days").toDate();
          const sevenDaysAgo = moment().subtract(7, "days").toDate();
          const fourteenDaysAgo = moment().subtract(14, "days").toDate();

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
          ]);

          const createdOrders = await Order.bulkCreate([
            {
              id: 1,
              isPaid: true,
              finalCost: 4.56,
              createdAt: fourteenDaysAgo,
              updatedAt: sevenDaysAgo,
            },
            {
              id: 2,
              isPaid: true,
              finalCost: 5.01,
              createdAt: sevenDaysAgo,
              updatedAt: fiveDaysAgo,
            },
            {
              id: 3,
              isPaid: true,
              finalCost: 755.01,
              createdAt: fiveDaysAgo,
              updatedAt: today,
            },
            {
              id: 4,
            },
          ]);

          const createdOrderProducts = await OrderProducts.bulkCreate([
            {
              OrderId: 1,
              ProductId: 1,
              amount: 3,
              createdAt: fourteenDaysAgo,
              updatedAt: sevenDaysAgo,
            },
            {
              OrderId: 2,
              ProductId: 1,
              amount: 3,
              createdAt: sevenDaysAgo,
              updatedAt: sevenDaysAgo,
            },
            {
              OrderId: 2,
              ProductId: 2,
              amount: 3,
              createdAt: sevenDaysAgo,
              updatedAt: sevenDaysAgo,
            },
            {
              OrderId: 3,
              ProductId: 1,
              amount: 3,
              createdAt: fiveDaysAgo,
              updatedAt: fiveDaysAgo,
            },
            {
              OrderId: 3,
              ProductId: 2,
              amount: 3,
              createdAt: fiveDaysAgo,
              updatedAt: fiveDaysAgo,
            },
            {
              OrderId: 3,
              ProductId: 3,
              amount: 3,
              createdAt: fiveDaysAgo,
              updatedAt: fiveDaysAgo,
            },
            {
              OrderId: 4,
              ProductId: 1,
              amount: 1,
            },
            {
              OrderId: 4,
              ProductId: 2,
              amount: 1,
            },
            {
              OrderId: 4,
              ProductId: 3,
              amount: 1,
            },
            {
              OrderId: 4,
              ProductId: 4,
              amount: 1,
            },
          ]);
          resolve();
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

describe("Check Analytics endpoints", () => {
  const today = moment().toDate();
  const sevenDaysAgo = moment().subtract(7, "days").toDate();
  const fourteenDaysAgo = moment().subtract(14, "days").toDate();

  describe("Orders Analytics", () => {
    it("Get revenue for today.", async () => {
      const res = await request(api)
        .get(baseUrl + "orders/revenue")
        .query({ from: today });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(9.57);
    });
    it("Get revenue for a week.", async () => {
      const res = await request(api)
        .get(baseUrl + "orders/revenue")
        .query({ from: sevenDaysAgo, to: today });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(9.57);
    });
    it("Fail when getting revenue for last week (lack of data)", async () => {
      const res = await request(api)
        .get(baseUrl + "orders/revenue")
        .query({ from: fourteenDaysAgo, to: sevenDaysAgo });
      expect(res.statusCode).toEqual(404);
    });
  });
  describe("Product Analytics", () => {
    describe("All Products", () => {
      it("Get best-seller product for today", async () => {
        const res = await request(api)
          .get(baseUrl + "products/bestSellers")
          .query({ from: today });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(3);
      });
      it("Get best-seller product for a week.", async () => {
        const res = await request(api)
          .get(baseUrl + "products/bestSellers")
          .query({ from: sevenDaysAgo, to: today });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(3);
      });
      it("Fail when getting best-seller product for last week (lack of data)", async () => {
        const res = await request(api)
          .get(baseUrl + "products/bestSellers")
          .query({ from: fourteenDaysAgo, to: sevenDaysAgo });
        expect(res.statusCode).toEqual(404);
      });
      it("Get products revenue for today.", async () => {
        const res = await request(api)
          .get(baseUrl + "products/revenue")
          .query({ from: today });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("totalRevenue");
      });
      it("Get products revenue for a week.", async () => {
        const res = await request(api)
          .get(baseUrl + "products/revenue")
          .query({ from: sevenDaysAgo, to: today });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("totalRevenue");
      });
      it("Fail when getting products revenue for last week (lack of data)", async () => {
        const res = await request(api)
          .get(baseUrl + "products/revenue")
          .query({ from: fourteenDaysAgo, to: sevenDaysAgo });
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("Singular Products", () => {
      it("Get a product's revenue for today.", async () => {
        const res = await request(api)
          .get(baseUrl + "products/product/1/revenue")
          .query({ from: today });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("totalRevenue");
      });
      it("Get a product's revenue for a week.", async () => {
        const res = await request(api)
          .get(baseUrl + "products/product/1/revenue")
          .query({ from: sevenDaysAgo, to: today });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("totalRevenue");
      });
      it("Fail when getting a product's revenue for last week (lack of data)", async () => {
        const res = await request(api)
          .get(baseUrl + "products/product/1/revenue")
          .query({ from: fourteenDaysAgo, to: sevenDaysAgo });
        expect(res.statusCode).toEqual(404);
      });
      it("Get a product's price history", async () => {
        const res = await request(api).get(
          baseUrl + "products/product/2/priceHistory"
        );
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(3);
      });
    });
  });
});
