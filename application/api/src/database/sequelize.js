'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const environment = process.env.NODE_ENV || 'development';
const database = {};

const sequelize = new Sequelize(require('./config')[environment]);

//Automatically load all models
fs
  .readdirSync(path.join(__dirname, 'models'))
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize.import((path.join(__dirname, 'models', file)));
    console.log(model,  (path.join(__dirname, 'models', file)));
    database[model.name] = model;
  });

Object.keys(database).forEach(modelName => {
  if (database[modelName].associate) {
    database[modelName].associate(database);
  }
});

database.sequelize = sequelize;
database.Sequelize = Sequelize;

database.utilities = require('./utilities');

module.exports = database;