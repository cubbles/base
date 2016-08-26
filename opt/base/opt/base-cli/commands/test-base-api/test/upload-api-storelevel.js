/**
 * Created by hrbu on 24.11.2015.
 */
'use strict';
var urljoin = require('url-join');
var assert = require('assert');
var request = require('superagent');
var supercouch = require('supercouch');
var opts = require('../lib/opts.js');
var suite = __filename.replace(__dirname + '/', "#");

describe(suite,
  function () {
    var uploadApiPath = '_api/upload';
    it(suite + ' > get on ' + uploadApiPath + ' should return 200', function (done) {
      var url = urljoin(opts.baseUrl, opts.storeName, '/');
      request
        .get(url)
        .end(function (err, res) {
          assert.equal(res.statusCode, 200);
          done();
        });
    });

    it(suite + ' > should PUT "pack-upload-put@1.0.0" should return 401 - Unauthorized', function (done) {
      var docId = 'pack-upload-put-' + Math.floor(Math.random() * 1000000) + '@1.0.0';
      var doc = { foo: 'bar' };
      var url = urljoin(opts.baseUploadUrl, opts.storeName, uploadApiPath, docId);
      request
        .put(url)
        .send(doc)
        .end(function (err, res) {
          if (err) {
            return done();
          }
          done(new Error('Expected a 401 Response.'));
        });
    });
  }
)
;
