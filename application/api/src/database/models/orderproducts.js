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
    OrderProducts.belongsTo(models.Product);
  };

  /**
   * Finds an existing OrderProducts or creates a new one with zero values.
   * Then sums the amount on top of the existing (or newly created) OrderProducts.
   *
   * @param {*} OrderId The OrderId
   * @param {*} ProductId The ProductId
   * @param {*} amount The amount to be "inserted"
   * @return {OrderProducts} the updated or created OrderProducts
   */
  OrderProducts.updateAmountOrInsert = async function (
    OrderId,
    ProductId,
    amount
  ) {
    const existingOrderProducts = await OrderProducts.findOne({
      where: {
        OrderId: OrderId,
        ProductId: ProductId,
      }
    });

    let result;
    if (amount) {
      if (!existingOrderProducts) {
        console.warn("creat new");
        result = OrderProducts.create(
          {
            OrderId: OrderId,
            ProductId: ProductId,
            amount: amount,
          }
        );
      } else {
        console.warn("update");
        existingOrderProducts.amount += amount;
        if (existingOrderProducts.amount <= 0) {
          console.warn("delete");
          result = existingOrderProducts.destroy();
        } else {
          console.warn("write");
          result = existingOrderProducts.save();
        }
      }
    } else {
      if (existingOrderProducts) {
        console.warn("delete 2");
        result = existingOrderProducts.destroy();
      }
    }
    return result;
  };
  return OrderProducts;
};
