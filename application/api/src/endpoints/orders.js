const express = require("express");
const router = new express.Router();

const {
  Product,
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
        throw "Error while creating orders:" + error;
      }
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

router.get("/order/:orderId", (req, res) => {
  const orderId = Number(req.params.orderId);
  Order.findByPk(orderId)
    .then((order) => {
      res.status(200).json(order.serialize());
    })
    .catch((error) => {
      res.status(404).send("No order with this ID exists.");
    });
});

router.post("/order/:orderId/product/add", (req, res) => {
  const orderId = Number(req.params.orderId);
  Order.findByPk(orderId)
    .then((order) => {
      utilities
        .validateObjectOrArray(OrderProducts, req.body)
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
              res
                .status(201)
                .json(createdOrderProducts.map((o) => o.serialize()));
            })
            .catch((error) => {
              res
                .status(500)
                .send("Error while inserting products into order: " + error);
            });
        })
        .catch((e) => {
          console.warn(e);
          res.status(400).send(e);
        });
    })
    .catch((error) => {
      res.status(404).send("No order with this ID exists.");
    });
});

router.post("/order/:orderId/product/remove", (req, res) => {
  const orderId = Number(req.params.orderId);
  Order.findByPk(orderId)
    .then((order) => {
      const requestBody = req.body.map((i) => {
        i.OrderId = order.id;
        i.amount = -i.amount;
        return i;
      });

      utilities
        .validateObjectOrArray(OrderProducts, requestBody)
        .then(async (oderProductsToRemove) => {
          try {
            const result = await sequelize.transaction(async (t) => {
              const createdOrderProducts = [];
              oderProductsToRemove.forEach(async (OrderProducts) => {
                const updatedOrderProduct = await OrderProducts.updateAmountOrInsert(
                  orderId,
                  OrderProducts.productId,
                  OrderProducts.amount,
                  {
                    transaction: t,
                  }
                );
                createdOrderProducts.push(updatedOrderProduct);
              });
              return createdOrderProducts;
            });
            res.status(201).json(result.map((o) => o.serialize()));
          } catch (error) {
            throw "Error while inserting products into order.";
          }
        })
        .catch((e) => {
          res.status(400).send(e);
        });
    })
    .catch((error) => {
      res.status(404).send("No order with this ID exists.");
    });
});

router.get("/order/:orderId/getCost", (req, res) => {
  const orderId = Number(req.params.orderId);
  Order.findByPk(orderId, {
    include: {
      model: OrderProducts,
      as: "contents",
      required: true,
    },
  })
    .then((order) => {
      console.log(order);
      //TODO;
    })
    .catch((error) => {
      res.status(404).send("No order with this ID exists.");
    });
});

router.post("/order/:orderId/processPayment", (req, res) => {
  const orderId = Number(req.params.orderId);
  Order.findByPk(orderId)
    .then((order) => {
      if (!order.isPayed) {
        order.isPayed = true;
        order.save().then((updatedOrder) => {
          res.status(200).json(updatedOrder.serialize());
        });
      } else {
        res.status(403).send("You cannot pay for an already paid for order.");
      }
    })
    .catch((error) => {
      res.status(404).send("No order with this ID exists.");
    });
});

module.exports = router;
