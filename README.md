![yolo-scraper](http://i.imgur.com/zu4AVzS.jpg)

> A simple way to structure your web scraper.

[![npm version](https://badge.fury.io/js/yolo-scraper.svg)](https://badge.fury.io/js/yolo-scraper)
[![Build Status](https://travis-ci.org/masterT/yolo-scraper.svg?branch=master)](https://travis-ci.org/masterT/yolo-scraper)
[![Dependency Status](https://gemnasium.com/badges/github.com/masterT/yolo-scraper.svg)](https://gemnasium.com/github.com/masterT/yolo-scraper)
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
scraper('masterT', function (error, data) {
  console.log(error || data);
});
```

## documentation

### `ValidationError`

_Error_ instance with additional _Object_ property `errorObjects` which content all the error information, see [ajv error](https://github.com/epoberezkin/ajv#error-objects).

### `ListValidationError`

_Error_ instance with additional _Array_ property `validationError` of `ValidationError` instance.

### `createScraper(options)`

Returned a scraper function defined by the `options`.

```js
var yoloScraper = require('yolo-scraper');

var options = {
  // ...
};
var scraper = yoloScraper.createScraper(options);
```

#### `options.paramsSchema`

The [JSON schema](https://spacetelescope.github.io/understanding-json-schema/) that defines the shape of the accepted arguments passed to `options.request`. When invalid, an Error will be thrown.

Optional

#### `options.request = function(params)`

Function that takes the arguments passed to your scraper function and returns the options to pass to the [request ](https://www.npmjs.com/package/request) module to make the network request.

**Required**


#### `options.extract = function(response, body, $)`

Function that takes [request](https://www.npmjs.com/package/request) response, the response body (_String_) and a [cheerio](https://www.npmjs.com/package/cheerio) instance. It returns the extracted data you want.

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


#### `options.validateList`

Use this option to validate each item of the data extracted **individually**. When `true`, the data extracted is **required to be an Array**, otherwise an _Error_ is returned in callback.

Optional, default: `false`


#### scraper function

To use your scraper function, pass the params to send to `options.request`, and a callback function.

```js
scraper(params, function (error, data) {
  if (error) {
    // handle the `error`
  } else {
    // do something with `data`
  }
});
```

##### callback(error, data)

- When a network request error occurred, the callback `error` argument will be an _Error_ and the `data` will be _null_.

- When `options.validateList = false` and a validation error occurred, `error` will be a _ValidationError_ and the `data` will be _null_. Otherwise, the `error` will be _null_ and `data` will be the returned value of `options.extract`.

- When `options.validateList = true` and a validation errors occurred, `error` will be a _ListValidationError_, otherwise it will be _null_. If the value returned by `options.extract` is not an Array, `error` will be an instance of _Error_. The `data` always be an _Array_ that only contains the **valid** item returned by `options.extract`. It's not because `error` is a _ListValidationError_ that there will be no `data`!



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
