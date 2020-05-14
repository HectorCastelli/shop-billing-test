const {
  OrderProducts,
  Order,
  Product,
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

describe("Check OrderProducts Model", () => {
  describe("Verify UpdatedAmountOrInsert", () => {
    it("Creates a new row when passed a new item", async () => {
      const newOrder = await Order.create({});
      expect(newOrder).toBeTruthy();
      const newProduct = await Product.create({
        productId: 1,
        name: "test",
        unitType: "object",
        basePrice: 1.5,
      });
      expect(newProduct).toBeTruthy();
      OrderProducts.build({
        ProductId: newProduct.serialize().productId,
        OrderId: newOrder.serialize().id,
        amount: 10,
      }).validate()
        .then((created) => {
          console.warn(created);
          expect(created).toHaveProperty("amount");
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    });
    //test update old item
  });
});
