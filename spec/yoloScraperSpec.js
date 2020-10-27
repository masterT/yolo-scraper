/* eslint-env jasmine */
var nock = require('nock')
var helper = require('./support/specHelper.js')
var yoloScraper = require('../lib/index.js')
var createScraper = yoloScraper.createScraper
var ValidationError = yoloScraper.ValidationError
var fixture = helper.fixture

function scraperRequest (listType) {
  return 'https://www.example.com/lists/' + listType
}

function scraperExtract (response, body, $) {
  return $('li').toArray().map(function (element) {
    return $(element).text()
  })
}

function scraperOptions () {
  return {
    request: scraperRequest,
    extract: scraperExtract,
    schema: {
      '$schema': 'http://json-schema.org/draft-04/schema#',
      'type': 'array',
      'items': {
        'type': 'string'
      }
    }
  }
}

describe('createScraper', function () {
  it('throws an error without function property `request`', function () {
    expect(function () {
      createScraper({
        extract: function () {},
        schema: {}
      })
    }).toThrowError(Error, 'Expect options.request to be a function')
  })

  it('throws an error when property `request` is not a function', function () {
    expect(function () {
      createScraper({
        request: null,
        extract: function () {},
        schema: {}
      })
    }).toThrowError(Error, 'Expect options.request to be a function')
  })

  it('throws an error without function property `extract`', function () {
    expect(function () {
      createScraper({
        request: function () {},
        schema: {}
      })
    }).toThrowError(Error, 'Expect options.extract to be a function')
  })

  it('throws an error when property `extract` is not a function', function () {
    expect(function () {
      createScraper({
        request: function () {},
        extract: null,
        schema: {}
      })
    }).toThrowError(Error, 'Expect options.extract to be a function')
  })

  it('throws an error without function property `schema`', function () {
    expect(function () {
      createScraper({
        request: function () {},
        extract: function () {}
      })
    }).toThrowError(Error, 'Expect options.schema to be an object')
  })

  it('throws an error when property `schema` is not a boolean', function () {
    expect(function () {
      createScraper({
        request: function () {},
        extract: function () {},
        schema: null
      })
    }).toThrowError(Error, 'Expect options.schema to be an object')
  })

  it('throws an error when property `validateList` is not a boolean', function () {
    expect(function () {
      createScraper({
        request: function () {},
        extract: function () {},
        schema: {},
        validateList: null
      })
    }).toThrowError(Error, 'Expect options.validateList to be a boolean')
  })

  it('throws an error when property `paramsSchema` is not an object', function () {
    expect(function () {
      createScraper({
        request: function () {},
        extract: function () {},
        schema: {},
        paramsSchema: null
      })
    }).toThrowError(Error, 'Expect options.paramsSchema to be an object')
  })

  it('returns a function with properties `request`, `extract` and `schema`, and without `validateList`', function () {
    var scraper = createScraper({
      request: function () {},
      extract: function () {},
      schema: {}
    })
    expect(typeof scraper).toEqual('function')
  })

  it('returns a function with optional property `ajvOptions`')
    .pend("Don't know how to: mock Ajv module and expect it to receive options.ajvOptions")

  it('returns a function with optional property `cheerioOptions`')
    .pend("Don't know how to: mock request module and expect it to receive options.cheerioOptions")

  describe('when using paramsSchema', function () {
    it('validate the params', async function () {
      var options = scraperOptions()
      options.paramsSchema = {
        'type': 'string',
        'minLength': 1
      }
      var invalidParams = ''
      var scraper = createScraper(options)

      await expectAsync(scraper(invalidParams)).toBeRejectedWithError(Error, /params/)
    })
  })

  describe('when validateList is false', function () {
    var requestBody = fixture('list.html')

    var params = 'numbers'

    var scraper; var options

    describe('with good request response', function () {
      beforeEach(function () {
        options = scraperOptions()
        scraper = createScraper(options)
        nock('https://www.example.com/lists').get('/numbers').reply(200, requestBody)
      })

      it('calls the `request` function with its params', async function () {
        spyOn(options, 'request').and.callThrough()

        await scraper(params)
          .then(function () {
            expect(options.request).toHaveBeenCalledWith(params)
          })
      })

      it('calls the `extract` function with reponse, body and cheerio object', async function () {
        options.extract = function (response, body, $) {
          // TODO more accurate spec
          expect(response).toEqual(jasmine.objectContaining({
            statusCode: 200
          }))
          expect(body).toBe(requestBody)
          expect(typeof $).toBe('function')

          return []
        }

        await scraper(params)
      })

      it('extracts the data from response and calls the callback', async function () {
        options.extract = function (response, body, $) {
          return ['1', '2', '3', '4', '5']
        }

        await scraper(params)
          .then(function (data) {
            expect(data).toEqual(options.extract())
          })
      })
    })

    describe('with bad request response', function () {
      beforeEach(function () {
        options = scraperOptions()
        scraper = createScraper(options)
      })

      it('calls the callback with Error, when request error', async function () {
        nock('https://www.example.com/lists').get('/numbers').replyWithError(Error)

        await expectAsync(scraper(params)).toBeRejected()
      })

      it('calls the callback with ValidationError, when data is invalid', async function () {
        nock('https://www.example.com/lists').get('/numbers').reply(200, '')

        options.extract = function (response, body, $) {
          return [null]
        }

        await expectAsync(scraper(params)).toBeRejectedWithError(ValidationError)
      })
    })
  })
})
