# yolo-scraper

> A simple way to structure your web scraper.

1. Define the request.
2. Extract the data from the response.
3. Validate the data.


## install

<!-- Using NPM:

```bash
npm install yolo-scraper --save
``` -->

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

### `var scraper = yoloScraper(options)`

Takes an `options` object and returns a scraper function.

```js
scraper = function(params, callback = function(error, data))
```

The `params` argument is anything you want. The `callback` argument is a function that will be called when the scraping is done.

When there an error, its argument `error` will be null and its argument `data` will be the `options.extract`.

If there is an error then `error` is an instance of Error and `data` is null.



#### `options.request(params)`

Takes the same argument passed to the scraper function. It should return a valid [request ](https://www.npmjs.com/package/request) option.

#### `options.extract(response, body, $)`

Takes the [request](https://www.npmjs.com/package/request) response, the response body and a [cheerio](https://www.npmjs.com/package/cheerio) instance. It should return the data you want to extract.

#### `options.schema`

The [JSON schema](https://spacetelescope.github.io/understanding-json-schema/) that define the extracted data. The scraper function calls the callback function with an `Error` and no data when the data is invalid.

The Error message will contain the validation message.


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
