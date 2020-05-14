const express = require("express");
const router = new express.Router();

const { Product, utilities, sequelize } = require("../database/sequelize");
const { Op } = require("sequelize");

router.post("/create", (req, res) => {
  utilities
    .validateObjectOrArray(Product, req.body)
    .then((products) => {
      //Check if there are duplicate products
      Product.findAll({
        where: {
          productId: {
            [Op.in]: products.map((p) => p.productId),
          },
        },
      }).then(async (duplicatedProducts) => {
        if (duplicatedProducts.length > 0) {
          res.status(403).json({ duplicatedProducts });
        } else {
          try {
            const result = await sequelize.transaction(async (t) => {
              const createdProducts = [];
              products.forEach(async (product) => {
                const newProduct = await Product.create(product, {
                  transaction: t,
                });
                createdProducts.push(newProduct);
              });
              return createdProducts;
            });
            res.status(201).json(result.map((x) => x.serialize()));
          } catch (error) {
            res.status(500).send("Error while inserting products: " + error);
          }
        }
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(error);
    });
});

router.get("/search", (req, res) => {
  const { name, from, to } = req.query;

  const whereClause = {
    inCirculation: true,
  };

  if (name) {
    whereClause["name"] = {
      [Op.like]: `%${name}%`,
    };
  }
  if (from && to && !isNaN(Number(from)) && !isNaN(Number(to))) {
    whereClause["basePrice"] = {
      [Op.gte]: Number(from),
      [Op.lte]: Number(to),
    };
  } else if (from && !isNaN(Number(from))) {
    whereClause["basePrice"] = {
      [Op.gte]: Number(from),
    };
  } else if (to && !isNaN(Number(to))) {
    whereClause["basePrice"] = {
      [Op.lte]: Number(to),
    };
  }

  Product.findAll({
    where: whereClause,
  })
    .then((results) => {
      console.debug("results", results);
      if (results && results.length === 0) {
        res.status(404).send("No Product found with these parameters");
      } else {
        res.status(200).json(results.map((r) => r.serialize()));
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(error);
    });
});

router.get("/product/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  Product.verifyExistence(productId)
    .then((product) => {
      res.status(200).json(product.serialize());
    })
    .catch((error) => {
      console.error(error);
      res.status(404).send("No product with this ID exists.");
    });
});

router.post("/product/:productId/updatePrice", (req, res) => {
  const productId = Number(req.params.productId);
  const newPrice = Number(req.body.newPrice);
  if (!newPrice || isNaN(newPrice))
    res.status(403).send("Invalid or missing newPrice on request body.");

  Product.verifyExistence(productId)
    .then(async (product) => {
      const newProduct = utilities.detachInstance(product);
      delete newProduct.id;
      delete newProduct.createdAt;
      delete newProduct.updatedAt;
      newProduct.basePrice = newPrice;
      Product.modify(product.id, newProduct)
        .then((createdProduct) => {
          res.status(200).json(createdProduct.serialize());
        })
        .catch((error) => {
          console.error(error);
          console.error("Failure modifying Product", error);
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(404).send("No product with this ID exists.");
    });
});

router.post("/product/:productId/remove", (req, res) => {
  const productId = Number(req.params.productId);

  Product.verifyExistence(productId)
    .then(async (product) => {
      const oldProduct = product.serialize();
      console.log(oldProduct);
      const newProduct = Object.assign({}, oldProduct);
      delete newProduct.id;
      delete newProduct.createdAt;
      delete newProduct.updatedAt;
      newProduct.inCirculation = false;
      console.log(newProduct);
      Product.modify(product.serialize().id, newProduct)
        .then((createdProduct) => {
          res.status(200).json(createdProduct.serialize());
        })
        .catch((error) => {
          console.error(error);
          console.log("Error", error);
          res.status(500).send(error);
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(404).send("No product with this ID exists.");
    });
});

module.exports = router;
