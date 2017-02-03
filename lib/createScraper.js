var cheerio = require('cheerio'),
    request = require('request'),
    Ajv     = require('ajv')
    ValidationError = require('./ValidationError.js'),
    ListValidationError = require('./ListValidationError.js');


function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}


function isFunction(value) {
  return typeof value === 'function';
}


function isArray(value) {
  return Array.isArray(value);
}


function isBoolean(value) {
  return typeof value === 'boolean';
}


module.exports = function (options) {

  if (!isFunction(options.request)) {
    throw new Error("Expect options.request to be a function");
  }
  if (!isFunction(options.extract)) {
    throw new Error("Expect options.extract to be a function");
  }
  if (!isObject(options.schema)) {
    throw new Error("Expect options.schema to be an object");
  }
  if (options.hasOwnProperty('validateList') && !isBoolean(options.validateList)) {
    throw new Error("Expect options.validateList to be a boolean");
  }
  if (options.hasOwnProperty('paramsSchema') && !isObject(options.paramsSchema)) {
    throw new Error("Expect options.paramsSchema to be an object");
  }

  var cheerioOptions = {};
  if (isObject(options.cheerioOptions)) {
    cheerioOptions = options.cheerioOptions;
  }

  var ajvOptions = {allErrors: true};
  if (isObject(options.ajvOptions)) {
    ajvOptions = options.ajvOptions;
  }

  // compile the JSON schema
  var ajv = new Ajv(ajvOptions);
  var validateParamsSchema;
  var validateSchema = ajv.compile(options.schema);
  if (options.paramsSchema) {
    validateParamsSchema = ajv.compile(options.paramsSchema);
  }

  return function (params, callback) {

    if (!isFunction(callback)) {
      throw new Error("Expect callback to be a function");
    }

    if (validateParamsSchema && !validateParamsSchema(params)) {
      var paramsError = ajv.errorsText(validateParamsSchema.errors, {dataVar: 'params'});
      throw new Error(paramsError);
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
          if (!isArray(extractedData)) {
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
