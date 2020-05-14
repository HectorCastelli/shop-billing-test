const express = require("express");
const moment = require("moment");
const router = new express.Router();

const { Product, Order, OrderProducts } = require("../database/sequelize");
const { Op } = require("sequelize");

/**
 * Process from and to query parameters and returns a filter object to be placed on the where clause
 *
 * @param {object} requestQuery The req.query object from Express
 * @returns {object} the filter Object
 */
function ProcessFromTo(requestQuery) {
  let { from, to } = requestQuery;

  from = moment(from).startOf("day").toDate();
  to = moment(to).startOf("day").toDate();

  let filter;
  if (from && to && from instanceof Date && to instanceof Date) {
    filter = {
      updatedAt: {
        [Op.gte]: from,
      },
      updatedAt: {
        [Op.lte]: to,
      },
    };
  } else if (from && from instanceof Date) {
    filter = {
      updatedAt: {
        [Op.gte]: from,
      },
    };
  } else if (to && to instanceof Date) {
    filter = {
      updatedAt: {
        [Op.lte]: to,
      },
    };
  }
  return filter;
}

router.get("/products/bestSellers", (req, res) => {
  const filter = ProcessFromTo(req.query);

  OrderProducts.findAll({ where: filter })
    .then((filteredOrderProducts) => {
      if (filteredOrderProducts && filteredOrderProducts.length > 0) {
        const bestSellers = Object.entries(
          filteredOrderProducts
            .map((productOrder) => {
              return {
                productId: productOrder.ProductId,
                amount: productOrder.amount,
              };
            })
            .reduce((map, obj) => {
              if (!map[obj.productId]) map[obj.productId] = 0;
              map[obj.productId] += obj.amount;
              return map;
            }, {})
        ).map((e) => {
          return {
            product: e[0],
            amount: e[1],
          };
        });

        res.status(200).json(bestSellers);
      } else {
        res.status(404).send("No data found for the selected arguments");
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

router.get("/products/revenue", (req, res) => {
  const filter = ProcessFromTo(req.query);

  //Compute only paid orders
  filter["isPaid"] = true;

  //All Orders on the time-frame
  Order.findAll({ where: filter })
    .then(async (possibleOrders) => {
      const revenue = {
        totalRevenue: 0,
        products: [],
      };
      if (possibleOrders && possibleOrders.length > 0) {
        await possibleOrders.forEach((order) => {
          OrderProducts.findAll({
            where: {
              OrderId: order.id,
            },
          }).then((orderProducts) => {
            if (orderProducts && orderProducts.length > 0) {
              orderProducts
                .map((oP) => oP.serialize())
                .forEach((orderProduct) => {
                  Product.findAll({
                    where: {
                      createdAt: {
                        [Op.lte]: order.createdAt,
                      },
                      productId: orderProduct.ProductId,
                    },
                  })
                    .then((products) => {
                      if (products && products.length > 0) {
                        const allVersions = products
                          .map((product) => product.serialize())
                          .map((product) => {
                            return {
                              product: product.productId,
                              version: product.id,
                              baseCost: product.baseCost,
                            };
                          })
                          .reduce((map, obj) => {
                            if (!map[obj.product]) map[obj.product] = [];
                            map[obj.product].push({
                              version: obj.version,
                              baseCost: obj.baseCost,
                            });
                            return map;
                          }, {});
                        Object.entries(allVersions).forEach((key, product) => {
                          const highest = product.reduce((prev, cur) => {
                            return prev.version > cur.version ? prev : cur;
                          });
                          if (!revenue.products[key]) revenue.products[key] = 0;
                          const addRevenue =
                            highest.baseCost * orderProducts.amount;
                          revenue.products[key] += addRevenue;
                          revenue.totalRevenue += addRevenue;
                        });
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                      res
                        .status(500)
                        .send("Problem fetching Order products." + error);
                    });
                });
            }
          });
        });
        res.status(200).send(revenue);
      } else {
        res.status(404).send("No data found for the selected arguments");
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

router.get("/products/product/:productId/priceHistory", (req, res) => {
  const productId = Number(req.params.productId);
  const filter = ProcessFromTo(req.query);

  Product.findAll({
    where: {
      productId: productId,
    },
  })
    .then((products) => {
      if (!products || products.length === 0) {
        res.status(404).send("No product with this ID exists.");
      } else {
        res.status(200).json(
          products.map((product) => {
            return {
              date: product.createdAt,
              basePrice: product.basePrice,
              changeId: product.id,
            };
          })
        );
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(error);
    });
});

router.get("/products/product/:productId/revenue", (req, res) => {
  const productId = Number(req.params.productId);
  const filter = ProcessFromTo(req.query);

  //Compute only paid orders
  filter["isPaid"] = true;

  //All Orders on the time-frame
  Order.findAll({ where: filter })
    .then(async (possibleOrders) => {
      const revenue = {
        totalRevenue: 0,
        products: [],
      };
      if (possibleOrders && possibleOrders.length > 0) {
        await possibleOrders.forEach((order) => {
          OrderProducts.findAll({
            where: {
              OrderId: order.id,
              ProductId: productId,
            },
          }).then((orderProducts) => {
            if (orderProducts && orderProducts.length > 0) {
              orderProducts
                .map((oP) => oP.serialize())
                .forEach((orderProduct) => {
                  Product.findAll({
                    where: {
                      createdAt: {
                        [Op.lte]: order.createdAt,
                      },
                      productId: orderProduct.ProductId,
                    },
                  })
                    .then((products) => {
                      if (products && products.length > 0) {
                        const allVersions = products
                          .map((product) => product.serialize())
                          .map((product) => {
                            return {
                              product: product.productId,
                              version: product.id,
                              baseCost: product.baseCost,
                            };
                          })
                          .reduce((map, obj) => {
                            if (!map[obj.product]) map[obj.product] = [];
                            map[obj.product].push({
                              version: obj.version,
                              baseCost: obj.baseCost,
                            });
                            return map;
                          }, {});
                        Object.entries(allVersions).forEach((key, product) => {
                          const highest = product.reduce((prev, cur) => {
                            return prev.version > cur.version ? prev : cur;
                          });
                          if (!revenue.products[key]) revenue.products[key] = 0;
                          const addRevenue =
                            highest.baseCost * orderProducts.amount;
                          revenue.products[key] += addRevenue;
                          revenue.totalRevenue += addRevenue;
                        });
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                      res
                        .status(500)
                        .send("Problem fetching Order products." + error);
                    });
                });
            }
          });
        });
        res.status(200).send(revenue);
      } else {
        res.status(404).send("No data found for the selected arguments");
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

router.get("/orders/revenue", (req, res) => {
  const filter = ProcessFromTo(req.query);

  //Compute only paid orders
  filter["isPaid"] = true;

  //All Orders on the time-frame
  Order.findAll({ where: filter })
    .then((possibleOrders) => {
      if (possibleOrders && possibleOrders.length > 0) {
        const revenue = possibleOrders
          .map((order) => {
            return order.finalCost;
          })
          .reduce((a, b) => a + b);
        res.status(200).json(revenue);
      } else {
        res.status(404).send("No data found for the selected arguments");
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

module.exports = router;
