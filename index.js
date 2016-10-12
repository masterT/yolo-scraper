var cheerio = require('cheerio'),
    request = require('request'),
    Ajv     = require('ajv');


/**
* Merge properties from object2 to object1.
*/
function merge(object1, object2) {
  for (var propName in object2) {
    if (object2.hasOwnProperty(optionName)) {
      object1[propName] = object2[propName];
    }
  }
  return object1;
};


/**
*
*/
module.exports = function (options) {

  if (typeof options.request !== 'function') {
    throw new Error("Expect options.request to be a function");
  }
  if (typeof options.extract !== 'function') {
    throw new Error("Expect options.extract to be a function");
  }
  if (typeof options.validate !== 'object') {
    throw new Error("Expect options.validate to be an object");
  }

  var cheerioOptions = {};
  if (typeof options.cheerioOptions === 'object') {
    cheerioOptions = merge(cheerioOptions, options.cheerio);
  }

  var ajvOptions = {allErrors: true};
  if (typeof options.ajv === 'object') {
    ajvOptions = merge(ajvOptions, options.ajv);
  }

  var ajv = new Ajv(ajvOptions);
  var validateSchema = ajv.compile(options.validate);
  // returns true if the data is valid, otherwise the error message
  var validate = function (data) {
    return validateSchema(data) || 'Error invalid data: ' + ajv.errorsText(validateSchema.errors);
  }

  return function (params, callback) {

    if (typeof callback !== 'function') {
      throw new Error("Expect callback to be a function");
    }

    var requestOption = options.request(params);

    request(requestOption, function (error, response, body) {
      if (error) {
        callback(error, null);
      } else {
        var $ = cheerio.load(body);
        var data = options.extract(response, body, $);
        var valid = validate(data);
        if (valid === true) {
          callback(null, data);
        } else {
          callback(new Error(valid), null);
        }
      }
    });
  };
};
