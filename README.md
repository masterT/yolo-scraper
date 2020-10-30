![yolo-scraper](http://i.imgur.com/zu4AVzS.jpg)

> A simple way to structure your web scraper.

[![npm version](https://badge.fury.io/js/yolo-scraper.svg)](https://badge.fury.io/js/yolo-scraper)
[![Build Status](https://travis-ci.org/masterT/yolo-scraper.svg?branch=master)](https://travis-ci.org/masterT/yolo-scraper)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


- Define the request.
- Extract the data from the response.
- Validate the data against JSON Schema.

[But what is web scraping?](https://en.wikipedia.org/wiki/Web_scraping)


## install

Using NPM:

```bash
npm install yolo-scraper --save
```

## usage

Define your scraper function.

```js
var yoloScraper = require('yolo-scraper');

var scraper = yoloScraper.createScraper({

  request: function (username) {
    return 'https://www.npmjs.com/~' + username.toLowerCase();
  },

  extract: function (response, body, $) {
    return $('.collaborated-packages li').toArray().map(function (element) {
      var $element = $(element);
      return {
        name: $element.find('a').text(),
        url: $element.find('a').attr('href'),
        version: $element.find('strong').text()
      };
    });
  },

  schema: {
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
scraper('masterT')
  .then(function (data) {
    console.log(data)
  })
  .catch(function (error) {
    console.error(error)
  })
```

## documentation

### `ValidationError`

_Error_ instance with additional _Object_ property `errorObjects` which content all the error information, see [ajv error](https://github.com/epoberezkin/ajv#error-objects).


### `createScraper(options)`

Returned a scraper function defined by the `options`.

```js
var yoloScraper = require('yolo-scraper');

var options = {
  // ...
};
var scraper = yoloScraper.createScraper(options);
```

The scraper function returns a `Promise` that _resolves_ with the valid extract data or _rejects_ with an `Error`.

```js
scraper(params)
  .then(function (data) {
    console.log(data)
  })
  .catch(function (error) {
    console.error(error)
  })
```

#### `options.paramsSchema`

The [JSON schema](https://spacetelescope.github.io/understanding-json-schema/) that defines the shape of the accepted arguments passed to `options.request`. When invalid, an Error will be thrown.

Optional

#### `options.request = function(params)`

Function that takes the arguments passed to your scraper function and returns the options to pass to the [axios](https://www.npmjs.com/package/axios) module to make the network request.

**Required**


#### `options.extract = function(response, body, $)`

Function that takes [axios](https://www.npmjs.com/package/axios) response, the response body (_String_) and a [cheerio](https://www.npmjs.com/package/cheerio) instance. It returns the extracted data you want.

**Required**


#### `options.schema`

The [JSON schema](https://spacetelescope.github.io/understanding-json-schema/) that defines the shape of your extracted data. When your data is invalid, an Error with the validation message will be passed to your scraper callback.

**Required**


#### `options.cheerioOptions`

The option to pass to [cheerio](https://www.npmjs.com/package/cheerio) when it loads the request body.

Optional, default: `{}`


#### `options.ajvOptions`

The option to pass to [ajv](https://www.npmjs.com/package/ajv) when it compiles the JSON schemas.

Optional, default: `{allErrors: true}` - It check all rules collecting all errors


## dependecies

- [axios](https://www.npmjs.com/package/axios) - Promise based HTTP client for the browser and node.js.
- [cheerio](https://www.npmjs.com/package/cheerio) - Fast, flexible, and lean implementation of core jQuery designed specifically for the server.
- [ajv](https://www.npmjs.com/package/ajv) - The fastest JSON Schema Validator. Supports draft-04/06/07.


## dev dependecies

- [jasmine](https://www.npmjs.com/package/jasmine) - Simple JavaScript testing framework for browsers and node.js.
- [nock](https://www.npmjs.com/package/nock) HTTP server mocking and expectations library for Node.js.

## test

```bash
npm test
```


## license

MIT
