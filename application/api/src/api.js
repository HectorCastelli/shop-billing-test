const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const environment = process.env.NODE_ENV || "development";
/**
 * A temporary middleware to log requests and information related to it to the console for easier debugging.
 *
 * @private
 * @param {*} req Request
 * @param {*} res Response (empty at this point)
 * @param {*} next Express.js next
 */
const loggerMiddleware = (req, res, next) => {
  let requestedDate = new Date();
  let formattedDate = `${requestedDate.getFullYear()}-${
    requestedDate.getMonth() + 1
  }-${requestedDate.getDate()} ${requestedDate.getHours()}:${requestedDate.getMinutes()}:${requestedDate.getSeconds()}`;

  const log = `[${formattedDate}] ${req.method}:${req.url} (${res.statusCode})
    Parameters:
    ${JSON.stringify(req.params, null, 2)}
    Query:
    ${JSON.stringify(req.query, null, 2)}
    Body:
    ${JSON.stringify(req.body, null, 2)}`;
  if (environment === "development") console.log(log);
  next();
};

/**
 * A middleware to catch all untreated errors.
 *
 * @param {*} err Error
 * @param {*} req Request
 * @param {*} res Response (empty at this point)
 * @param {*} next Express.js next
 */
const errorReporter = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Server Error",
    details: err.stack,
  });
  next();
};

app.use(loggerMiddleware);
app.use(errorReporter);

app.get("/", (req, res) => {
  database.sequelize
    .authenticate()
    .then(() => {
      res.status(200).json({
        healthy: true,
        database: "up",
      });
    })
    .catch((error) => {
      res.status(500).json({
        healthy: false,
        database: "down",
      });
    });
});

const database = require("./database/sequelize");

app.use("/products", require("./endpoints/products"));
app.use("/orders", require("./endpoints/orders"));
app.use("/analytics", require("./endpoints/analytics"));

module.exports = app;
