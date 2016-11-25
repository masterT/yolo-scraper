var cheerio = require('cheerio'),
    request = require('request'),
    Ajv     = require('ajv');


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
        return callback(error, null);
      } else {
        var $ = cheerio.load(body);
        var data = options.extract(response, body, $);
        var valid = validate(data);
        if (valid === true) {
          return callback(null, data);
        } else {
          return callback(new Error(valid), null);
        }
      }
    });
  };
};
