const request = require("supertest");
const api = require("../../src/api");
const baseUrl = "/products/";

const {
  Product,
  utilities,
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
              productId: 6,
              name: "Gardening Kit",
              unitType: "unit",
              basePrice: 12.52,
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
        });
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
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

describe("Check Products endpoints", () => {
  describe("Product Creation", () => {
    it("Create a new unit-based product", async () => {
      const sampleProduct = await Product.build({
        productId: 1,
        name: "2L Cola Soda",
        unitType: "bottle",
        basePrice: 1.52,
      }).serialize();
      const res = await request(api)
        .post(baseUrl + "create")
        .send(sampleProduct);
      expect(res.statusCode).toEqual(201);
    });
    it("Create a new weight-based product", async () => {
      const sampleProduct = await Product.build({
        productId: 2,
        name: "white rice",
        unitType: "kilo",
        basePrice: 0.1,
      }).serialize();
      const res = await request(api)
        .post(baseUrl + "create")
        .send(sampleProduct);
      expect(res.statusCode).toEqual(201);
    });
    it("Create a new deactivated product", async () => {
      const sampleProduct = await Product.build({
        productId: 3,
        name: "Nintendo Switch",
        unitType: "console",
        basePrice: 250,
        inCirculation: false,
      }).serialize();
      const res = await request(api)
        .post(baseUrl + "create")
        .send(sampleProduct);
      expect(res.statusCode).toEqual(201);
    });
    it("Create multiple products", async () => {
      const sampleProducts = [];
      sampleProducts.push(
        await Product.build({
          productId: 4,
          name: "Gardening Kit",
          unitType: "unit",
          basePrice: 12.52,
        }).serialize()
      );
      sampleProducts.push(
        await Product.build({
          productId: 5,
          name: "1.5L Lemon Soda",
          unitType: "bottle",
          basePrice: 1.31,
        }).serialize()
      );
      const res = await request(api)
        .post(baseUrl + "create")
        .send(sampleProducts);
      expect(res.statusCode).toEqual(201);
    });
    it("Fail when creating an invalid product", async () => {
      const res = await request(api)
        .post(baseUrl + "create")
        .send({ invalid: "value" });
      expect(res.statusCode).toEqual(400);
    });
    it("Fail when creating an already existing product", async () => {
      const sampleProduct = await Product.findByPk(1);
      const duplicateProduct = sampleProduct.serialize();
      delete duplicateProduct.id;
      expect(duplicateProduct).not.toHaveProperty("id");
      const res = await request(api)
        .post(baseUrl + "create")
        .send(duplicateProduct);
      console.warn(res);
      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty("duplicatedProducts");
    });
  });
  describe("Product Manipulation", () => {
    it("Update the price of a product", async () => {
      const sampleProduct = await Product.findByPk(8);
      const res = await request(api)
        .post(
          baseUrl +
            "product/" +
            sampleProduct.serialize.productId +
            "/updatePrice"
        )
        .send({ newPrice: 1.64 });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("productId");
    });
    it("Update the price of a product with invalid format", async () => {
      const sampleProduct = await Product.findByPk(8);
      const res = await request(api).post(
        baseUrl +
          "product/" +
          sampleProduct.serialize.productId +
          "/updatePrice"
      );
      expect(res.statusCode).toEqual(403);
    });
    it("Update the price of a product with invalid information", async () => {
      const sampleProduct = await Product.findByPk(8);
      const res = await request(api)
        .post(
          baseUrl +
            "product/" +
            sampleProduct.serialize.productId +
            "/updatePrice"
        )

        .send({ newPrice: "a" });
      expect(res.statusCode).toEqual(403);
    });
    it("Remove a product from circulation", async () => {
      const sampleProduct = await Product.findByPk(9);
      const res = await request(api).post(
        baseUrl + "product/" + sampleProduct.serialize.productId + "/remove"
      );
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("Search Product", () => {
    it("Search a product by its name", async () => {
      const res = await request(api)
        .get(baseUrl + "search")
        .query({ name: "soda" });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
    });
    it("Search a product by a price range (from)", async () => {
      const res = await request(api)
        .get(baseUrl + "search")
        .query({ from: 1 });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(8);
    });
    it("Search a product by a price range (to)", async () => {
      const res = await request(api)
        .get(baseUrl + "search")
        .query({ to: 2 });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(3);
    });
    it("Search a product by a price range (from, to)", async () => {
      const res = await request(api)
        .get(baseUrl + "search")
        .query({ from: 1, to: 10 });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(5);
    });
    it("List all products when no search parameters are present", async () => {
      const res = await request(api).get(baseUrl + "search");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(9);
    });
    it("Search a product that doesn't exist", async () => {
      const res = await request(api)
        .get(baseUrl + "search")
        .query({ name: "InvalidName" });
      expect(res.statusCode).toEqual(404);
    });
  });
});
