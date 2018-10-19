var yoloScraper = require('../lib/index.js')

var scraper = yoloScraper.createScraper({

  request: function (username) {
    return 'https://www.npmjs.com/~' + username.toLowerCase()
  },

  extract: function (response, body, $) {
    return $('.collaborated-packages li').toArray().map(function (element) {
      var $element = $(element)
      return {
        name: $element.find('a').text(),
        url: $element.find('a').attr('href'),
        version: $element.find('strong').text()
      }
    })
  },

  validateList: true,

  schema: {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'type': 'object',
    'additionalProperties': false,
    'properties': {
      'name': {
        'type': 'string',
        'pattern': 'scraper' // must have 'scraper' in the name
      },
      'url': { 'type': 'string', 'format': 'uri' },
      'version': { 'type': 'string', 'pattern': '^v\\d+\\.\\d+\\.\\d+$' }
    },
    'required': [ 'name', 'url', 'version' ]
  }

})

scraper('masterT', function (error, data) {
  if (error) {
    console.log('error.name:', error.name)
    console.log('error.message:', error.message)
    console.log('error.validationErrors.length:', error.validationErrors.length)
    console.log('valid items:', data)
  } else {
    console.log('error:', error)
    console.log('valid items:', data)
  }
})
