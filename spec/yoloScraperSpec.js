var path = require('path'),
    fs = require('fs'),
    nock = require('nock'),
    cheerio = require('cheerio'),
    request = require('request'),
    yoloScraper = require("../index.js");


jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;


function fixture(filename) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filename), {encoding: 'utf8'});
};


function npmScraperOptions() {
  return {
    request: function (username) {
      return 'https://www.npmjs.com/~' + username.toLowerCase();
    },
    extract: function (response, body, $) {
      if (response.statusCode != 200) throw new Error("Bad response from server!");
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
  };
}




describe("yolo-scraper", function () {

  it("throws an error without function property `request`", function () {
    expect(function () {
      yoloScraper({
        extract: function () {},
        validate: {}
      });
    }).toThrowError(Error, "Expect options.request to be a function");
  });

  it("throws an error without function property `extract`", function () {
    expect(function () {
      yoloScraper({
        request: function () {},
        validate: {}
      });
    }).toThrowError(Error, "Expect options.extract to be a function");
  });

  it("throws an error without function property `validate`", function () {
    expect(function () {
      yoloScraper({
        request: function () {},
        extract: function () {}
      });
    }).toThrowError(Error, "Expect options.validate to be an object");
  });

  it("returns a function with properties `request`, `extract` and `validate`", function () {
    var scraper = yoloScraper({
      request: function () {},
      extract: function () {},
      validate: {}
    });
    expect(typeof scraper).toEqual("function");
  });


  describe("the returned function", function () {
    var requestBody = fixture("~mastert.html"),
        params = 'masterT',
        scraper, options;

    describe("with good request response", function () {

      beforeEach(function () {
        options = npmScraperOptions();
        scraper = yoloScraper(options);
        // mock the HTTP request
        nock('https://www.npmjs.com').get('/~mastert').reply(200, requestBody);
      });

      it("calls the `request` function with its params", function (done) {
        spyOn(options, "request").and.callThrough();

        scraper(params, function (error, data) {
          done();
        });

        expect(options.request).toHaveBeenCalledWith(params);
      });

      it("calls the `extract` function with reponse, body and cheerio object", function (done) {
        options.extract = function (response, body, $) {
          // TODO more accurate spec
          expect(response).toEqual(jasmine.objectContaining({
            statusCode: 200
          }));
          expect(body).toBe(requestBody);
          expect(typeof $).toBe('function');
          done();
        };

        scraper(params, function (error, data) {});
      });

      it("extracts the data from response and calls the callback", function (done) {
        options.extract = function (response, body, $) {
          return [{
            name: 'yolo-scraper',
            url: '/package/yolo-scraper',
            version: 'v0.0.1'
          }];
        };

        scraper(params, function (error, data) {
          expect(error).toBe(null);
          expect(data).toEqual(options.extract());
          done();
        });
      });

    });


    describe("with bad request response", function () {

      beforeEach(function () {
        options = npmScraperOptions();
        scraper = yoloScraper(options);
      });

      it("calls the callback with error, when request error", function (done) {
        // mock the HTTP request
        nock('https://www.npmjs.com').get('/~mastert').replyWithError("Server error");

        scraper(params, function (error, data) {
          expect(error instanceof Error).toBe(true);
          expect(error.message).toBe("Server error");
          expect(data).toBe(null);
          done();
        });
      });

      it("calls the callback with error, when data is invalid", function (done) {
        // mock the HTTP request
        nock('https://www.npmjs.com').get('/~mastert').reply(200, "");

        options.extract = function (response, body, $) {
          return [{
            invalidPropName: 'invalid'
          }];
        };

        scraper(params, function (error, data) {
          expect(error instanceof Error).toBe(true);
          expect(error.message).toBe("Error invalid data: data[0] should NOT have additional properties, data[0] should have required property 'name', data[0] should have required property 'url', data[0] should have required property 'version'");
          expect(data).toBe(null);
          done();
        });
      });

    });

  });

});
