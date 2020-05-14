"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const environment = process.env.NODE_ENV || "development";
const database = {};

const sequelize = new Sequelize(require("./config")[environment]);

//Automatically load all models
fs.readdirSync(path.join(__dirname, "models"))
  .filter((file) => {
    return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
  })
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, "models", file));
    database[model.name] = model;
  });

Object.keys(database).forEach((modelName) => {
  if (database[modelName].associate) {
    database[modelName].associate(database);
  }
});

Object.keys(database).forEach((modelName) => {
  const model = database[modelName];
  model.prototype.serialize = function () {
    const result = {};
    const data = this.dataValues;
    for (const name in data) {
      if (data.hasOwnProperty(name)) {
        result[name] = data[name];
      } else {
        result[name] = null;
      }
    }
    return result;
  };
});

database.sequelize = sequelize;
database.Sequelize = Sequelize;

database.utilities = require("./utilities");

const syncOptions = {
  force: false,
  logging: false,
};
if (environment === "development" || environment === "test") {
  syncOptions.force = true;
  syncOptions.logging = environment === "development";
}

sequelize.sync(syncOptions).then(() => {
  if (environment !== "test") console.log(`Database & tables created!`);
});

module.exports = database;
