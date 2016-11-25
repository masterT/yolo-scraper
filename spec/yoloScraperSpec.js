var path = require('path'),
    fs = require('fs'),
    nock = require('nock'),
    cheerio = require('cheerio'),
    request = require('request'),
    yoloScraper = require("../index.js");




function fixture(filename) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filename), {encoding: 'utf8'});
};


function scraperOptions() {
  return {
    request: function (listType) {
      return 'https://www.example.com/lists/' + listType;
    },
    extract: function (response, body, $) {
      return $('li').toArray().map(function (element) {
        return $(element).text();
      });
    },
    schema: {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type" : "array",
      "items": {
        "type": "string",
        "additionalProperties": false
      }
    }
  };
}




describe("yolo-scraper", function () {

  it("throws an error without function property `request`", function () {
    expect(function () {
      yoloScraper({
        extract: function () {},
        schema: {}
      });
    }).toThrowError(Error, "Expect options.request to be a function");
  });

  it("throws an error without function property `extract`", function () {
    expect(function () {
      yoloScraper({
        request: function () {},
        schema: {}
      });
    }).toThrowError(Error, "Expect options.extract to be a function");
  });

  it("throws an error without function property `schema`", function () {
    expect(function () {
      yoloScraper({
        request: function () {},
        extract: function () {}
      });
    }).toThrowError(Error, "Expect options.schema to be an object");
  });

  it("returns a function with properties `request`, `extract` and `schema`", function () {
    var scraper = yoloScraper({
      request: function () {},
      extract: function () {},
      schema: {}
    });
    expect(typeof scraper).toEqual("function");
  });


  it("returns a function with optional property `ajvOptions`");


  it("returns a function with optional property `cheerioOptions`");


  describe("the returned function", function () {
    var requestBody = fixture("list.html"),
        params = 'numbers',
        scraper, options;

    describe("with good request response", function () {

      beforeEach(function () {
        options = scraperOptions();
        scraper = yoloScraper(options);
        // mock the HTTP request
        nock('https://www.example.com/lists').get('/numbers').reply(200, requestBody);
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
          return ["1", "2", "3", "4", "5"];
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
        options = scraperOptions();
        scraper = yoloScraper(options);
      });

      it("calls the callback with error, when request error", function (done) {
        // mock the HTTP request
        nock('https://www.example.com/lists').get('/numbers').replyWithError("Server error");

        scraper(params, function (error, data) {
          expect(error instanceof Error).toBe(true);
          expect(error.message).toBe("Server error");
          expect(data).toBe(null);
          done();
        });
      });

      it("calls the callback with error, when data is invalid", function (done) {
        // mock the HTTP request
        nock('https://www.example.com/lists').get('/numbers').reply(200, "");

        options.extract = function (response, body, $) {
          return [{
            invalidObject: 'expectString'
          }];
        };

        scraper(params, function (error, data) {
          expect(error instanceof Error).toBe(true);
          expect(error.message).toMatch(/Error invalid data: /);
          expect(data).toBe(null);
          done();
        });
      });

    });

  });

});
