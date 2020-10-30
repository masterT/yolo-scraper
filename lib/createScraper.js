var cheerio = require('cheerio')
var axios = require('axios')
var Ajv = require('ajv')
var ValidationError = require('./ValidationError')
var utils = require('./utils')

module.exports = function (options) {
  if (!utils.isFunction(options.request)) {
    throw new Error('Expect options.request to be a function')
  }
  if (!utils.isFunction(options.extract)) {
    throw new Error('Expect options.extract to be a function')
  }
  if (!utils.isObject(options.schema)) {
    throw new Error('Expect options.schema to be an object')
  }
  if (Object.prototype.hasOwnProperty.call(options, 'validateList') && !utils.isBoolean(options.validateList)) {
    throw new Error('Expect options.validateList to be a boolean')
  }
  if (Object.prototype.hasOwnProperty.call(options, 'paramsSchema') && !utils.isObject(options.paramsSchema)) {
    throw new Error('Expect options.paramsSchema to be an object')
  }

  var cheerioOptions = {}
  if (utils.isObject(options.cheerioOptions)) {
    cheerioOptions = options.cheerioOptions
  }

  var ajvOptions = { validateSchema: true, allErrors: true, schemaId: 'auto' }
  if (utils.isObject(options.ajvOptions)) {
    ajvOptions = options.ajvOptions
  }

  // compile the JSON schema
  var ajv = new Ajv(ajvOptions)
  var validateParamsSchema
  // Add support for JSON schema draft 4.
  if (options.schema.$schema && options.schema.$schema.indexOf('draft-04') !== -1) {
    ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
  }

  var validateSchema = ajv.compile(options.schema)
  if (options.paramsSchema) {
    validateParamsSchema = ajv.compile(options.paramsSchema)
  }

  return function (params) {
    return new Promise(function (resolve, reject) {
      if (validateParamsSchema && !validateParamsSchema(params)) {
        var paramsError = ajv.errorsText(validateParamsSchema.errors, { dataVar: 'params' })
        reject(new Error(paramsError))
      }

      var requestOption = options.request(params)
      axios(requestOption)
        .then(function (response) {
          var $ = null
          try {
            $ = cheerio.load(response.data, cheerioOptions)
          } catch (error) {
            console.error(error)
          }

          var extractedData = options.extract(response, response.data, $)
          if (validateSchema(extractedData)) {
            resolve(extractedData)
          } else {
            reject(new ValidationError(ajv.errorsText(validateSchema.errors), validateSchema.errors))
          }
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }
}
