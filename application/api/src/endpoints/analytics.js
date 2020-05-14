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

  from = moment(from).startOf("day");
  to = moment(to).startOf("day");

  let filter;
  if (from && to && Object.isDate(from) && Object.isDate(to)) {
    filter = {
      updatedAt: {
        [Op.gte]: Object.isDate(from),
      },
      updatedAt: {
        [Op.lte]: Object.isDate(to),
      },
    };
  } else if (from && Object.isDate(from)) {
    filter = {
      updatedAt: {
        [Op.gte]: Object.isDate(from),
      },
    };
  } else if (to && Object.isDate(to)) {
    filter = {
      updatedAt: {
        [Op.lte]: Object.isDate(to),
      },
    };
  }
  console.error(from, to, filter);
  return filter;
}

router.get("/products/bestSellers", (req, res) => {
  const filter = ProcessFromTo(req.query);

  OrderProducts.findAll({ where: filter })
    .then((filteredOrderProducts) => {
      if (filteredOrderProducts && filteredOrderProducts.length > 0) {
        res.status(200).json(
          filteredOrderProducts.map((productOrder) => {
            productOrder.ProductId, productOrder.amount;
          })
        );
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
  Order.findAll({ where: filter, include: ProductOrders })
    .then((possibleOrders) => {
      if (possibleOrders && possibleOrders.length > 0) {
        possibleOrders.forEach((order) => {
          console.log(order);
        });
        //For each order
        //Get all the unique products in this order where createdAt < order.updatedAt
        //Get the most recent product.id for each unique product in this set.
        //Compute:
        // Order->Products=amount*time
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

  Product.findByPk(orderId)
    .then((product) => {
      if (!product) {
        res.status(404).send("No product with this ID exists.");
      } else {
        OrderProducts.findAll({ where: filter }).then(
          (filteredOrderProducts) => {
            if (filteredOrderProducts && filteredOrderProducts.length > 0) {
              res.status(200).json(
                filteredOrderProducts.map((productOrder) => {
                  productOrder.ProductId, productOrder.amount;
                })
              );
            } else {
              res.status(404).send("No data found for the selected arguments");
            }
          }
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

  Product.findByPk(orderId)
    .then((product) => {
      if (!product) {
        res.status(404).send("No product with this ID exists.");
      } else {
        OrderProducts.findAll({ where: filter }).then(
          (filteredOrderProducts) => {
            if (filteredOrderProducts && filteredOrderProducts.length > 0) {
              res.status(200).json(
                filteredOrderProducts.map((productOrder) => {
                  productOrder.ProductId, productOrder.amount;
                })
              );
            } else {
              res.status(404).send("No data found for the selected arguments");
            }
          }
        );
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(error);
    });
});

module.exports = router;
