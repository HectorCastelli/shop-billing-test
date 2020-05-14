const {
  Order,
  Product,
  OrderProducts,
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

describe("Check Models", () => {
  describe("Check utilities", () => {
    it("Verify sample Order", async () => {
      const testOrder = {
        id: 1,
        finalCost: 10,
        isPayed: true,
      };
      const validated = await utilities.validateObjectOrArray(Order, testOrder);
      expect(validated).toContainEqual(testOrder);
    });
    it("Fail when verifying an invalid Order", async () => {
      const testOrder = {
        id: "also invalid",
        finalCost: "this is invalid",
        isPayed: 30,
      };
      expect(
        utilities.validateObjectOrArray(Order, testOrder)
      ).rejects.toThrow();
    });
    describe("DetachInstance", () => {
      it("Verify new object is created", async () => {
        //Test if detached a, then change a, then compare values (they shouldnt match).
      });
    });
  });
  describe("Check models", () => {
    it("Verify all expected models exist", async () => {
      expect(Order).toBeTruthy();
      expect(Product).toBeTruthy();
      expect(OrderProducts).toBeTruthy();
    });
    it("Verify serialize returns object", async () => {
      const testOrder = {
        id: 1,
        finalCost: 10,
        isPayed: true,
      };
      const sampleOrder = await Order.build(testOrder);
      expect(sampleOrder).toBeTruthy();
      expect(sampleOrder.serialize()).toHaveProperty("id");
    });
  });
});
