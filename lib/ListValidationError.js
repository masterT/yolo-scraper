
function ListValidationError (validationErrors) {
  this.name = 'ListValidationError'
  this.message = 'Validation errors'
  this.validationErrors = validationErrors
  this.stack = (new Error()).stack
}

ListValidationError.prototype = Object.create(Error.prototype)
ListValidationError.prototype.constructor = ListValidationError

module.exports = ListValidationError
