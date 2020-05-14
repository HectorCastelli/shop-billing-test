"use strict";
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      finalCost: {
        type: DataTypes.DECIMAL(10, 2),
      },
      isPaid: {
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
  /**
   * Gets the final cost as well as the cost of all the products in this order.
   *
   * @param {Collection<Models>} models The loaded models from sequelize
   * @returns {object}
   */
  Order.prototype.getFinalCost = function () {
    const thisOrder = this;
    return new Promise((resolve, reject) => {
      this.sequelize.models.OrderProducts.findAll({
        where: {
          OrderId: thisOrder.id,
        },
      })
        .then((orderItems) => {
          if (orderItems && orderItems.length > 0) {
            const fetchedProducts = orderItems.map((item) => {
              {
                const { productId, amount } = item;
                return new Promise((resolve, reject) => {
                  this.sequelize.models.Product.verifyExistence(productId)
                    .then((itemProduct) => {
                      console.warn("serial", itemProduct);
                      resolve({
                        name: itemProduct.name,
                        basePrice: itemProduct.basePrice,
                        unitType: itemProduct.unitType,
                        amount: amount,
                      });
                    })
                    .catch((error) => {
                      console.error(error);
                      reject("Problem finding product in OrderProducts");
                    });
                });
              }
            });
            Promise.all(fetchedProducts).then((computedProducts) => {
              const finalCost = computedProducts
                .map((item) => item.basePrice * item.amount)
                .reduce((a, b) => a + b);
              resolve({
                products: computedProducts,
                finalCost: finalCost,
              });
            });
          } else {
            resolve();
          }
        })
        .catch((error) => {
          console.error(error);
          reject("There was a problem fetching OrderProducts: " + error);
        });
    });
  };
  return Order;
};
