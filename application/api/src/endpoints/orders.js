const express = require("express");
const router = new express.Router();

const {
  OrderProducts,
  Order,
  utilities,
  sequelize,
} = require("../database/sequelize");
const { Op } = require("sequelize");

router.post("/create", (req, res) => {
  utilities
    .validateObjectOrArray(Order, req.body, true)
    .then(async (orders) => {
      try {
        // Create all or none
        const result = await sequelize.transaction(async (t) => {
          const createdOrders = [];
          orders.forEach(async (order) => {
            const newProduct = await Order.create(order, {
              transaction: t,
            });
            createdOrders.push(newProduct);
          });
          return createdOrders;
        });
        res.status(201).json(result.map((o) => o.serialize()));
      } catch (error) {
        console.error("Error while creating orders", error);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(error);
    });
});

router.get("/order/:orderId", (req, res) => {
  const orderId = Number(req.params.orderId);
  Order.findByPk(orderId)
    .then((order) => {
      if (order) {
        res.status(200).json(order.serialize());
      } else {
        res.status(404).send("No order with this ID exists.");
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Issue getting the order");
    });
});

router.post("/order/:orderId/product/add", (req, res) => {
  const orderId = Number(req.params.orderId);
  Order.findByPk(orderId)
    .then((order) => {
      if (!order) {
        res.status(404).send("No order with this ID exists.");
      } else {
        let bodyObjects = [];
        if (Array.isArray(req.body)) {
          bodyObjects = req.body;
        } else {
          bodyObjects.push(req.body);
        }
        const requestBody = bodyObjects.map((i) => {
          i.OrderId = order.id;
          i.amount = i.amount || 0;
          return i;
        });
        utilities
          .validateObjectOrArray(OrderProducts, requestBody)
          .then(async (orderProductsToAdd) => {
            const upserts = [];
            orderProductsToAdd.forEach((orderProduct) => {
              upserts.push(
                OrderProducts.updateAmountOrInsert(
                  orderId,
                  orderProduct.ProductId,
                  orderProduct.amount
                )
              );
            });
            Promise.all(upserts)
              .then((createdOrderProducts) => {
                res.status(201).json(createdOrderProducts);
              })
              .catch((error) => {
                console.error(
                  "Error while inserting products into order",
                  error
                );
                res
                  .status(500)
                  .send("Error while inserting products into order: " + error);
              });
          })
          .catch((error) => {
            console.error(error);
            res.status(400).send(error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Issue Adding products to an order");
    });
});

router.post("/order/:orderId/product/remove", (req, res) => {
  const orderId = Number(req.params.orderId);
  Order.findByPk(orderId)
    .then((order) => {
      if (!order) {
        res.status(404).send("No order with this ID exists.");
      } else {
        let bodyObjects = [];
        if (Array.isArray(req.body)) {
          bodyObjects = req.body;
        } else {
          bodyObjects.push(req.body);
        }
        const requestBody = bodyObjects.map((i) => {
          i.OrderId = order.id;
          i.amount = -i.amount || 0;
          return i;
        });

        utilities
          .validateObjectOrArray(OrderProducts, requestBody)
          .then(async (oderProductsToRemove) => {
            try {
              const result = await sequelize.transaction(async (t) => {
                const createdOrderProducts = [];
                for (const orderProduct of oderProductsToRemove) {
                  console.debug("OP", orderProduct);
                  const updatedOrderProduct = await OrderProducts.updateAmountOrInsert(
                    orderId,
                    orderProduct.productId,
                    orderProduct.amount == 0 ? null : orderProduct.amount
                  );
                  createdOrderProducts.push(updatedOrderProduct);
                }
                return createdOrderProducts;
              });
              res.status(201).json(result.map((o) => o.serialize()));
            } catch (error) {
              console.error(
                "Error while inserting products into order.",
                error
              );
            }
          })
          .catch((error) => {
            console.error(error);
            res.status(400).send(error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(404).send("No order with this ID exists.");
    });
});

router.get("/order/:orderId/getCost", (req, res) => {
  const orderId = Number(req.params.orderId);
  Order.findByPk(orderId, {})
    .then((order) => {
      order
        .getFinalCost()
        .then((finalCost) => {
          if (finalCost) {
            console.warn("finalizedCost", finalCost);
            res.status(200).json(finalCost);
          } else {
            res.status(404).send("No OrderProducts found for this order");
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(400).send(error);
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(404).send("No order with this ID exists.");
    });
});

router.post("/order/:orderId/processPayment", (req, res) => {
  const orderId = Number(req.params.orderId);
  Order.findByPk(orderId)
    .then((order) => {
      if (!order) {
        res.status(404).send("No order with this ID exists.");
      } else {
        if (!order.isPayed) {
          order.isPayed = true;
          order.save().then((updatedOrder) => {
            res.status(200).json(updatedOrder.serialize());
          });
        } else {
          res.status(403).send("You cannot pay for an already paid for order.");
        }
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(404).send("No order with this ID exists.");
    });
});

module.exports = router;
