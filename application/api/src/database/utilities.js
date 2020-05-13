/**
 * Validates a target to check if either an instance of or an array of a Model type.
 *
 * @param {Model} type A sequelize Model
 * @param {*} target Any object
 * @returns {Promise<array<Model>>}
 */
validateObjectOrArray = (type, target) => {
  return new Promise((resolve, reject) => {
    if (!target || Object.keys(target).length === 0)
      reject("No object or array of objects exists on target.");

    let objects = [];
    if (Array.isArray(target)) {
      objects = target;
    } else {
      objects.push(target);
    }

    const validations = objects.map((object) => type.build(object).validate());

    Promise.all(validations)
      .then((validated) => {
        console.log(validated);
        resolve(objects);
      })
      .catch((validationErrors) => {
        console.log(validationErrors);
        reject(validationErrors);
      });
  });
};

/**
 * Returns a non-managed instance of the Model
 *
 * @param {Model} instance A sequelize managed instance of a Model
 * @returns {object} An object (shallow copy) with all the data from the instance, but not managed by sequelize.
 */
detachInstance = (instance) => {
  return Object.assign({}, instance.dataValues);
}

module.exports = {
  validateObjectOrArray,
  detachInstance
};
