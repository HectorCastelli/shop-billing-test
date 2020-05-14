"use strict";
module.exports = (sequelize, DataTypes) => {
  const OrderProducts = sequelize.define(
    "OrderProducts",
    {
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {}
  );
  OrderProducts.associate = function (models) {
    // associations can be defined here
    OrderProducts.belongsTo(models.Order);
    OrderProducts.belongsTo(models.Product, {
      constraints: false,
      required: true,
    });
  };

  /**
   * Finds an existing OrderProducts or creates a new one with zero values.
   * Then sums the amount on top of the existing (or newly created) OrderProducts.
   *
   * @param {number} OrderId The OrderId
   * @param {number} ProductId The ProductId
   * @param {?number} amount The amount to be "inserted"
   * @return {OrderProducts} the updated or created OrderProducts
   */
  OrderProducts.updateAmountOrInsert = async function (
    OrderId,
    ProductId,
    amount
  ) {
    console.debug(OrderId, ProductId);
    OrderProducts.findOne({
      where: {
        OrderId: OrderId,
        ProductId: ProductId,
      },
    })
      .then(async (existingOrderProducts) => {
        let updatedOrderProduct;
        console.debug("good query", existingOrderProducts);
        // Item already exists?
        if (existingOrderProducts) {
          console.debug("exists");
          // Is the amount set to 0?
          if (amount && amount !== 0) {
            console.debug("valid amount");
            // No, apply transformation
            updatedOrderProduct = await existingOrderProducts.increment(
              "amount",
              {
                by: amount,
              }
            );
          } else {
            console.debug("zero amount");
            // Yes, delete
            updatedOrderProduct = await existingOrderProducts.destroy();
          }
        } else {
          console.debug("need to create");
          updatedOrderProduct = await OrderProducts.create({
            OrderId: OrderId,
            ProductId: ProductId,
            amount: amount,
          });
        }
        return updatedOrderProduct;
      })
      .catch((error) => {
        console.error(
          "Failed updating amount or inserting new orderProduct. " + error
        );
      });
  };
  return OrderProducts;
};
