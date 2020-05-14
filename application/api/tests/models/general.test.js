const {
  Order,
  Product,
  OrderProducts,
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
        sequelize
          .authenticate()
          .then(async () => {
            //Insert sample data for these metrics.
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
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

describe("Check Models", () => {
  describe("Check utilities", () => {
    it("Verify sample Order", async () => {
      const testOrder = {
        id: 1,
        finalCost: 10,
        isPaid: true,
      };
      const validated = await utilities.validateObjectOrArray(Order, testOrder);
      expect(validated).toContainEqual(testOrder);
    });
    it("Fail when verifying a valid, but empty Order", async () => {
      return expect(
        utilities.validateObjectOrArray(Order, {}, false)
      ).rejects.toBeTruthy();
    });
    it("Fail when verifying an invalid Order", async () => {
      const validation = await utilities.validateObjectOrArray(Order, {
        id: "also invalid",
        finalCost: "this is invalid",
        isPaid: 30,
      });
      return expect(
        utilities.validateObjectOrArray(Order, {
          id: "also invalid",
          finalCost: "this is invalid",
          isPaid: 30,
        })
      ).rejects.toBeTruthy();
    });
    describe("DetachInstance", () => {
      it("Verify new object is created", async () => {
        const order = await Order.create({});
        const detached = utilities.detachInstance(order);
        detached.test = "test";
        expect(detached).toHaveProperty("test");
        expect(order).not.toHaveProperty("test");
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
        isPaid: true,
      };
      const sampleOrder = await Order.build(testOrder);
      expect(sampleOrder).toBeTruthy();
      expect(sampleOrder.serialize()).toHaveProperty("id");
    });
  });
});
