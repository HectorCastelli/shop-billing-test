/**
 * Validates a target to check if either an instance of or an array of a Model type.
 *
 * @param {Model} type A sequelize Model
 * @param {*} target Any object
 * @param {?boolean} allowBlank Flag to determine if empty objects are allowed.
 * @returns {Promise<array<Model>>}
 */
validateObjectOrArray = (type, target, allowBlank = false) => {
  return new Promise((resolve, reject) => {
    if (!allowBlank && (!target || Object.keys(target).length === 0)) {
      reject("No object or array of objects exists on target.");
    } else {
      let objects = [];
      if (Array.isArray(target)) {
        objects = target;
      } else {
        objects.push(target);
      }

      //Before validating each object, compare the properties on the object to the expected attributes. If the input has any attribute not in the model, fail.
      allowedAttributes = type.describe().then(async (description) => {
        const typeFields = await Object.keys(description);
        const invalidProperty = await objects.some((object) => {
          return Object.keys(object).some((i) => !typeFields.includes(i));
        });
        if (invalidProperty) {
          reject(
            "Invalid properties in the request: " +
              objects.map((object) => {
                return Object.keys(object).filter(
                  (i) => !typeFields.includes(i)
                );
              })
          );
        } else {
          const validations = objects.map((object) =>
            type.build(object).validate()
          );

          await Promise.all(validations)
            .then((validated) => {
              resolve(objects);
            })
            .catch((validationErrors) => {
              reject(validationErrors);
            });
        }
      });
    }
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
};

module.exports = {
  validateObjectOrArray,
  detachInstance,
};
