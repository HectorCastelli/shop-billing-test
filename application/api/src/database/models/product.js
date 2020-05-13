"use strict";
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unitType: {
        type: DataTypes.STRING(10),
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      inCirculation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {}
  );
  Product.associate = function (models) {
    Product.belongsToMany(models.Order, {
      through: "OrderProducts",
      as: "orders",
    });
  };
  return Product;
};
