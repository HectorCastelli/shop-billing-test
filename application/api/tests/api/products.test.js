const request = require("supertest");
const api = require("../../src/api");
const baseUrl = "/products/";

const {
  Product,
  utilities,
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

describe("Check Products endpoints", () => {
  describe("Product Creation", () => {
    it("Create a new unit-based product", async () => {
      const sampleProduct = await Product.build({
        productId: 2,
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
        productId: 3,
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
        productId: 4,
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
          productId: 5,
          name: "Gardening Kit",
          unitType: "unit",
          basePrice: 12.52,
        }).serialize()
      );
      sampleProducts.push(
        await Product.build({
          productId: 6,
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
      const productId = 2;
      const repeatedProduct = {
        productId: productId,
        name: "2L Cola Soda",
        unitType: "bottle",
        basePrice: 1.52,
      };
      const firstProduct = await Product.findOrCreate({
        where: {
          id: productId,
        },
        defaults: repeatedProduct,
      }).spread(async (existingProduct, created) => {
        const duplicateProduct = utilities.detachInstance(existingProduct);
        delete duplicateProduct.id;
        expect(duplicateProduct).not.toHaveProperty("id"); //verify this is not from the DB.
        const res = await request(api)
          .post(baseUrl + "create")
          .send(duplicateProduct);
        console.warn(res);
        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('duplicatedProducts');
      });
    });
  });
  describe("Product Manipulation", () => {
    it("Update the price of a product", async () => {
      const res = await request(api)
        .post(baseUrl + "product/2/updatePrice")
        .send({ newPrice: 1.64 });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("productId");
    });
    it("Update the price of a product with invalid format", async () => {
      const res = await request(api).post(baseUrl + "product/2/updatePrice");
      expect(res.statusCode).toEqual(403);
    });
    it("Update the price of a product with invalid information", async () => {
      const res = await request(api)
        .post(baseUrl + "product/2/updatePrice")
        .send({ newPrice: "a" });
      expect(res.statusCode).toEqual(403);
    });
    it("Remove a product from circulation", async () => {
      const res = await request(api).post(baseUrl + "product/3/remove");
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("Search Product", () => {
    it("Search a product by its name", async () => {
      const res = await request(api)
        .get(baseUrl + "search")
        .query({ name: "soda" });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(1);
    });
    it("Search a product by a price range (from)", async () => {
      const res = await request(api)
        .get(baseUrl + "search")
        .query({ from: 1 });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
    });
    it("Search a product by a price range (to)", async () => {
      const res = await request(api)
        .get(baseUrl + "search")
        .query({ to: 2 });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(1);
    });
    it("Search a product by a price range (from, to)", async () => {
      const res = await request(api)
        .get(baseUrl + "search")
        .query({ from: 1, to: 10 });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(1);
    });
    it("List all products when no search parameters are present", async () => {
      const res = await request(api).get(baseUrl + "search");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
    });
    it("Search a product that doesn't exist", async () => {
      const res = await request(api)
        .get(baseUrl + "search")
        .query({ name: "InvalidName" });
      expect(res.statusCode).toEqual(404);
    });
  });
});
