var yoloScraper = require('../lib/index.js')

var scraper = yoloScraper.createScraper({

  paramsSchema: {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'type': 'string',
    'minLength': 1
  },

  request: function (username) {
    return 'https://github.com/' + username + '?tab=repositories'
  },

  extract: function (response, body, $) {
    return $('#user-repositories-list ul li').toArray().map(function (element) {
      var $container = $($(element).children('div')[0])
      var $elements = $container.children('div')
      return {
        name: $($elements[0]).find('a').text().trim(),
        url: $($elements[0]).find('a').attr('href')
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
        'url': { 'type': 'string', 'format': 'uri' }
      },
      'required': [ 'name', 'url' ]
    }
  }

})

scraper('masterT')
  .then(function (data) {
    console.log(data)
  })
  .catch(function (error) {
    console.error(error)
  })
