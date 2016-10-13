![yolo-scraper](http://i.imgur.com/zu4AVzS.jpg)

> A simple way to structure your web scraper.

[![Build Status](https://travis-ci.org/masterT/yolo-scraper.svg?branch=master)](https://travis-ci.org/masterT/yolo-scraper)
[![Dependency Status](https://gemnasium.com/badges/github.com/masterT/yolo-scraper.svg)](https://gemnasium.com/github.com/masterT/yolo-scraper)



- Define the request.
- Extract the data from the response.
- Validate the data against JSON Schema.


## install

Using NPM:

```bash
npm install yolo-scraper --save
```

## usage

Define your scraper function.

```js
var scraper = yoloScraper({

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

### Define our scraper

You define your scraper by calling `yolo-scraper` function with your options.

```js
var yoloScraper = require('yolo-scraper');

var options = {
  // ...
};
var scraper = yoloScraper(options);
```

#### `options.request = function(params)`

Function that takes the *same argument* passed to your scraper function. It returns the options to pass to the [request ](https://www.npmjs.com/package/request) module to make the request.

**Required**


#### `options.extract = function(response, body, $)`

Function that takes [request](https://www.npmjs.com/package/request) response, the response body and a [cheerio](https://www.npmjs.com/package/cheerio) instance. It returns the extracted data you want.

**Required**


#### `options.schema`

The [JSON schema](https://spacetelescope.github.io/understanding-json-schema/) that defines the shape of your extracted data. When your data is invalid, an Error with the validation message will be passed to your scraper callback.

**Required**


#### `options.cheerioOptions`

The option to pass to [cheerio](https://www.npmjs.com/package/cheerio) when it loads the request body.

Optional, default: `{}`


#### `options.ajvOptions = {}`

The option to pass to [ajv](https://www.npmjs.com/package/ajv) when it compiles the schema.

Optional, default: `{allErrors: true}` - It check all rules collecting all errors


### Use your scraper function

To use your scraper function, pass the params of your scraping request, and a callback function.

```js
scraper(params, function (error, data) {
  if (error) {
    // handle the `error`
  } else {
    // do something with `data`
  }
});
```
When an error occured (request, validation, etc.) the callback `error` argument will be an instance of Error and the `data` will be *null*. Otherwise, the `error` argument will be *null* and the data will be your what you extracted.


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
