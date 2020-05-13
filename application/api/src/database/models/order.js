"use strict";
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      finalCost: {
        type: DataTypes.DECIMAL(10, 2),
      },
      isPayed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {}
  );
  Order.associate = function (models) {
    Order.belongsToMany(models.Product, {
      through: "OrderProducts",
      as: "products",
    });
  };
  return Order;
};
