module.exports.isObject = function (value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

module.exports.isFunction = function (value) {
  return typeof value === 'function'
}

module.exports.isArray = function (value) {
  return Array.isArray(value)
}

module.exports.isBoolean = function (value) {
  return typeof value === 'boolean'
}
