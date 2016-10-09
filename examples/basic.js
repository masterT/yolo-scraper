var yoloScraper = require('../index.js');

var scrape = yoloScraper({

  request: function (params) {
    return {
      url: 'https://www.npmjs.com/~' + params.username.toLowerCase()
    };
  },

  extract: function (response, body, $) {
    return Array.from($('.collaborated-packages li')).map(function (element) {
      var $element = $(element);
      return {
        name: $element.find('a').text(),
        url: $element.find('a').attr('href'),
        version: $element.find('strong').text()
      };
    });
  },

  validate: {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type" : "array",
    "items": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "name": { "type": "string" },
        "url": { "type": "string", "format": "uri" },
        "version": { "type": "string", "pattern": "^v\\d+\\.\\d+\\.\\d+$" }
      },
      "required": [ "name", "url", "version" ]
    }
  }

});


scrape({username: 'masterT'}, function (error, data) {
  console.log(error || data);
});
