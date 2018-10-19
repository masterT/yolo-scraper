
function ValidationError (message, errorObjects) {
  this.name = 'ValidationError'
  this.message = 'Error invalid data: ' + message
  this.errorObjects = errorObjects
  this.stack = (new Error()).stack
}

ValidationError.prototype = Object.create(Error.prototype)
ValidationError.prototype.constructor = ValidationError

module.exports = ValidationError
