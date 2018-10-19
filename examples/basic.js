var yoloScraper = require('../lib/index.js')

var scraper = yoloScraper.createScraper({

  request: function (username) {
    return 'https://www.npmjs.com/~' + username.toLowerCase()
  },

  extract: function (response, body, $) {
    return $('.package-list__packageList___1s35t > section').toArray().map(function (element) {
      var $element = $(element)
      var publisherMeta = $element.find('.package-list-item__publisherRow___13wUH').text()
      return {
        name: $element.find('.pr3 a').text(),
        url: $element.find('.pr3 a').attr('href'),
        version: 'v' + publisherMeta.match(/\d+\.\d+\.\d+/)[0]
      }
    })
  },

  schema: {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'type': 'array',
    'items': {
      'type': 'object',
      'additionalProperties': false,
      'properties': {
        'name': { 'type': 'string' },
        'url': { 'type': 'string', 'format': 'uri' },
        'version': { 'type': 'string', 'pattern': '^v\\d+\\.\\d+\\.\\d+$' }
      },
      'required': [ 'name', 'url', 'version' ]
    }
  }

})

scraper('masterT', function (error, data) {
  if (error) {
    console.log('error:', error)
  } else {
    console.log('data:', data)
  }
})
