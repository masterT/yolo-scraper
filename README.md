# yolo-scraper

> A simple way to structure your web scraper.

1. Define the request.
2. Extract the data from the response.
3. Validate the data.


## install

<!--Using NPM:

```bash
npm install yolo-scraper --save
``` -->

Incoming

## usage

Define your scraper function.

```js
var scrape = yoloScraper({

  request: function (username) {
    return 'https://www.npmjs.com/~' + username.toLowerCase();
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
```

Then use it.

```js
scrape('masterT', function (error, data) {
  console.log(error || data);
});
```

## documentation

Incoming

## dependecies

- [request](https://www.npmjs.com/package/request) - Simplified HTTP request client.
- [cheerio](https://www.npmjs.com/package/cheerio) - Tiny, fast, and elegant implementation of core jQuery designed specifically for the server.
- [ajv](https://www.npmjs.com/package/ajv) - Another JSON Schema Validator.


## dev dependecies

- [jasmine](https://www.npmjs.com/package/jasmine) - DOM-less simple JavaScript testing framework.
- [nock](https://www.npmjs.com/package/nock) HTTP Server mocking for Node.js.

## test

```bash
npm test
```


## license

MIT
