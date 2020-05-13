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
  /**
   * Verifies if a Product exists with this productId
   *
   * @param {Number} productId the productId to search for
   * @returns {Promise<Product|null>}
   */
  Product.verifyExistence = function (productId) {
    return new Promise((resolve, reject) => {
      Product.findOne({
        where: {
          productId: productId,
        },
        order: [["id", "DESC"]],
      })
        .then((product) => {
          if (product) resolve(product);
          else reject();
        })
        .catch((error) => {
          throw error;
        });
    });
  };
  /**
   * Creates a new Product with the modified data.
   * Also modifies previous Products so there is only a
   * single one active at all times.
   *
   * @param {*} id the Product id (PK)
   * @param {*} newProduct the new Product data
   * @returns {Promise<Product>}
   */
  Product.modify = function (id, newProduct) {
    return new Promise((resolve, reject) => {
      Product.update(
        {
          inCirculation: false,
        },
        {
          where: {
            id: id,
            inCirculation: true,
          },
        }
      ).then((oldProducts) => {
        if (oldProducts.length > 0) {
          resolve(Product.create(newProduct));
        } else {
          reject("No such Product exists with this ID");
        }
      });
    });
  };
  return Product;
};
