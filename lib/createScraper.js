var cheerio = require('cheerio'),
    request = require('request'),
    Ajv     = require('ajv')
    ValidationError = require('./ValidationError.js'),
    ListValidationError = require('./ListValidationError.js');


module.exports = function (options) {

  if (typeof options.request !== 'function') {
    throw new Error("Expect options.request to be a function");
  }
  if (typeof options.extract !== 'function') {
    throw new Error("Expect options.extract to be a function");
  }
  if (typeof options.schema !== 'object') {
    throw new Error("Expect options.schema to be an object");
  }
  if (options.hasOwnProperty('validateList') && typeof options.validateList !== 'boolean') {
    throw new Error("Expect options.validateList to be a boolean");
  }

  var cheerioOptions = {};
  if (typeof options.cheerioOptions === 'object') {
    cheerioOptions = options.cheerioOptions;
  }

  var ajvOptions = {allErrors: true};
  if (typeof options.ajvOptions === 'object') {
    ajvOptions = options.ajvOptions;
  }

  // compile the JSON schema
  var ajv = new Ajv(ajvOptions);
  var validateSchema = ajv.compile(options.schema);

  return function (params, callback) {

    if (typeof callback !== 'function') {
      throw new Error("Expect callback to be a function");
    }

    var requestOption = options.request(params);

    request(requestOption, function (error, response, body) {
      if (error != null) {
        return callback(error, null);
      } else {
        var $ = cheerio.load(body);
        var extractedData = options.extract(response, body, $);
        var callbackData = null;
        var callbackError = null;

        // validation
        if (options.validateList) {
          var validationErrors = [];
          var validItems = [];
          if (!Array.isArray(extractedData)) {
            callbackError = new Error('Expect the extracted data to be an array when using options.validateList');
          } else {
            extractedData.forEach(function (item) {
              if (validateSchema(item)) {
                validItems.push(item);
              } else {
                var errorObjects = validateSchema.errors;
                validationErrors.push(new ValidationError(ajv.errorsText(errorObjects), errorObjects));
              }
              return validItems;
            });
            if (validationErrors.length > 0) {
              callbackError = new ListValidationError(validationErrors);
            }
          }
          callbackData = validItems;
        } else {
          if (validateSchema(extractedData)) {
            callbackData = extractedData;
          } else {
            var errorObjects = validateSchema.errors;
            callbackError = new ValidationError(ajv.errorsText(errorObjects), errorObjects);
          }
        }

        callback(callbackError, callbackData);
      }
    });
  };
};
