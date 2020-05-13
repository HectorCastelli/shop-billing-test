const express = require("express");
const app = express();

const bodyParser = require('body-parser');
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

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
    let formattedDate = `${requestedDate.getFullYear()}-${(requestedDate.getMonth() + 1)}-${requestedDate.getDate()} ${requestedDate.getHours()}:${requestedDate.getMinutes()}:${requestedDate.getSeconds()}`;

    const log =  `[${formattedDate}] ${req.method}:${req.url} (${res.statusCode})
    Parameters:
    ${JSON.stringify(req.params,null,2)}
    Query:
    ${JSON.stringify(req.query,null,2)}
    Body:
    ${JSON.stringify(req.body,null,2)}`
    console.log(log);
    next();
}

app.use(loggerMiddleware);

app.get("/", (req, res) => {
  res.status(200).json({
      'healthy': true
  });
});

const database = require('./database/sequelize');

database.sequelize.sync({ force: true })
  .then(() => {
    console.log(`Database & tables created!`)
  });

module.exports = app;