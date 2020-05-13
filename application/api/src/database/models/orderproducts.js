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
  return OrderProducts;
};
