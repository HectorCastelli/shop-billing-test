const {
  OrderProducts,
  Order,
  Product,
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
            //Insert sample data
            const createdProducts = await Product.bulkCreate([
              {
                productId: 1,
                name: "2L Cola Soda",
                unitType: "bottle",
                basePrice: 1.52,
              },
            ]);
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

describe("Check OrderProducts Model", () => {
  describe("Verify UpdatedAmountOrInsert", () => {
    it("Creates a new row when passed a new item", async () => {
      const newOrder = await Order.create({});
      expect(newOrder).toBeTruthy();
      const newProduct = await Product.findByPk(1);
      expect(newProduct).toBeTruthy();
      OrderProducts.build({
        ProductId: newProduct.serialize().productId,
        OrderId: newOrder.serialize().id,
        amount: 10,
      })
        .validate()
        .then((created) => {
          expect(created).toHaveProperty("amount");
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    });
    it.todo("Verify an update on an previously created OrderProducts");
  });
});
