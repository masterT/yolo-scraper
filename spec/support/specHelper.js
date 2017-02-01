var path = require('path'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    request = require('request');


function fixture(filename) {
  return fs.readFileSync(path.join(__dirname, '..', 'fixtures', filename), {encoding: 'utf8'});
}


function scraperRequest(listType) {
  return 'https://www.example.com/lists/' + listType;
}


function scraperExtract(response, body, $) {
  return $('li').toArray().map(function (element) {
    return $(element).text();
  });
}


function scraperOptions() {
  return {
    request: scraperRequest,
    extract: scraperExtract,
    schema: {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type" : "array",
      "items": {
        "type": "string"
      }
    }
  };
}


function scraperOptionsValidateList() {
  return {
    request: scraperRequest,
    extract: scraperExtract,
    validateList: true,
    schema: {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "string"
    }
  };
}


module.exports = {
  fixture: fixture,
  scraperOptions: scraperOptions,
  scraperOptionsValidateList: scraperOptionsValidateList
};
