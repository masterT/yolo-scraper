var nock = require('nock'),
    helper = require('./support/specHelper.js'),
    yoloScraper = require('../lib/index.js');

var createScraper = yoloScraper.createScraper,
    ValidationError = yoloScraper.ValidationError,
    ListValidationError = yoloScraper.ListValidationError;


var fixture = helper.fixture,
    scraperOptions = helper.scraperOptions,
    scraperOptionsValidateList = helper.scraperOptionsValidateList;


describe("createScraper", function () {

  it("throws an error without function property `request`", function () {
    expect(function () {
      createScraper({
        extract: function () {},
        schema: {}
      });
    }).toThrowError(Error, "Expect options.request to be a function");
  });

  it("throws an error when property `request` is not a function", function () {
    expect(function () {
      createScraper({
        request: null,
        extract: function () {},
        schema: {}
      });
    }).toThrowError(Error, "Expect options.request to be a function");
  });

  it("throws an error without function property `extract`", function () {
    expect(function () {
      createScraper({
        request: function () {},
        schema: {}
      });
    }).toThrowError(Error, "Expect options.extract to be a function");
  });

  it("throws an error when property `extract` is not a function", function () {
    expect(function () {
      createScraper({
        request: function () {},
        extract: null,
        schema: {}
      });
    }).toThrowError(Error, "Expect options.extract to be a function");
  });

  it("throws an error without function property `schema`", function () {
    expect(function () {
      createScraper({
        request: function () {},
        extract: function () {}
      });
    }).toThrowError(Error, "Expect options.schema to be an object");
  });

  it("throws an error when property `schema` is not a boolean", function () {
    expect(function () {
      createScraper({
        request: function () {},
        extract: function () {},
        schema: null
      });
    }).toThrowError(Error, "Expect options.schema to be an object");
  });

  it("throws an error when property `validateList` is not a boolean", function () {
    expect(function () {
      createScraper({
        request: function () {},
        extract: function () {},
        schema: {},
        validateList: null
      });
    }).toThrowError(Error, "Expect options.validateList to be a boolean");
  });

  it("throws an error when property `paramsSchema` is not an object", function () {
    expect(function () {
      createScraper({
        request: function () {},
        extract: function () {},
        schema: {},
        paramsSchema: null
      });
    }).toThrowError(Error, "Expect options.paramsSchema to be an object");
  });

  it("returns a function with properties `request`, `extract` and `schema`, and without `validateList`", function () {
    var scraper = createScraper({
      request: function () {},
      extract: function () {},
      schema: {}
    });
    expect(typeof scraper).toEqual("function");
  });


  it("returns a function with optional property `ajvOptions`")
    .pend("Don't know how to: mock Ajv module and expect it to receive options.ajvOptions");


  it("returns a function with optional property `cheerioOptions`")
    .pend("Don't know how to: mock request module and expect it to receive options.cheerioOptions");


  describe("when using paramsSchema", function () {

    it("validate the params", function () {
      var options = scraperOptions();
      options.paramsSchema = {
        "type": "string",
        "minLength": 1
      };
      var invalidParams = "";
      var scraper = createScraper(options);

      expect(function () {
        scraper(invalidParams, function(error, data) {});
      }).toThrowError(Error, /params/)
    });

  });


  describe("when validateList is false", function () {
    var requestBody = fixture("list.html"),
        params = 'numbers',
        scraper, options;

    describe("with good request response", function () {
      beforeEach(function () {
        options = scraperOptions();
        scraper = createScraper(options);
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
        scraper = createScraper(options);
      });

      it("calls the callback with Error, when request error", function (done) {
        nock('https://www.example.com/lists').get('/numbers').replyWithError("Server error");

        scraper(params, function (error, data) {
          expect(error instanceof Error).toBe(true);
          expect(error.message).toBe("Server error");
          expect(data).toBe(null);
          done();
        });
      });

      it("calls the callback with ValidationError, when data is invalid", function (done) {
        nock('https://www.example.com/lists').get('/numbers').reply(200, "");

        options.extract = function (response, body, $) {
          return [null];
        };

        scraper(params, function (error, data) {
          expect(error instanceof ValidationError).toBe(true);
          expect(error.message).toMatch(/Error invalid data: /);
          expect(data).toBe(null);
          done();
        });
      });

    });

  });


  describe("when validateList is true", function () {

    var requestBody = fixture("list.html"),
        params = 'numbers',
        scraper, options;

    describe("with good request response", function () {
      beforeEach(function () {
        options = scraperOptionsValidateList();
        scraper = createScraper(options);
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
          return [];
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
        options = scraperOptionsValidateList();
        scraper = createScraper(options);
      });

      it("calls the callback with Error, when request error", function (done) {
        nock('https://www.example.com/lists').get('/numbers').replyWithError("Server error");

        scraper(params, function (error, data) {
          expect(error instanceof Error).toBe(true);
          expect(error.message).toBe("Server error");
          expect(data).toBe(null);
          done();
        });
      });

      it("calls the callback with Error, when extracted data is not an Array", function (done) {
        nock('https://www.example.com/lists').get('/numbers').reply(200, "");

        options.extract = function (response, body, $) {
          return null;
        };

        scraper(params, function (error, data) {
          expect(error instanceof Error).toBe(true);
          expect(error.message).toMatch(/Expect the extracted data to be an array when using options.validateList/);
          expect(data).toEqual([]);
          done();
        });
      });

      it("calls the callback with ListValidationError, when data is invalid", function (done) {
        nock('https://www.example.com/lists').get('/numbers').reply(200, "");

        options.extract = function (response, body, $) {
          return [null, "1", "2", undefined, "3"];
        };

        scraper(params, function (error, data) {
          expect(error instanceof ListValidationError).toBe(true);
          expect(error.message).toMatch(/Validation errors/);
          expect(error.validationErrors.length).toBe(2);
          expect(error.validationErrors[0] instanceof ValidationError).toBe(true);
          expect(error.validationErrors[1] instanceof ValidationError).toBe(true);
          expect(data).toEqual(["1", "2", "3"]);
          done();
        });
      });

    });

  });

});
