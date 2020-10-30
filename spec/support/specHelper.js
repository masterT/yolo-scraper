var path = require('path')
var fs = require('fs')

function fixture (filename) {
  return fs.readFileSync(path.join(__dirname, '..', 'fixtures', filename), { encoding: 'utf8' })
}

module.exports = {
  fixture: fixture
}
