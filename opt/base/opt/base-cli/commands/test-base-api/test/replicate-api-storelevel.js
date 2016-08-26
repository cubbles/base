/**
 * Created by hrbu on 24.11.2015.
 */
'use strict';
var urljoin = require('url-join');
var assert = require('assert');
var request = require('superagent');
var opts = require('../lib/opts.js');
var supercouch = require('supercouch');
var couch = supercouch(opts.couchUrl);
var suite = __filename.replace(__dirname + '/', "#");

describe(suite,
  function () {
    var apiPath = '_api/replicate';
    it(suite + ' > should return 200', function (done) {
      var url = urljoin(opts.baseReplicateUrl, opts.storeName, apiPath);
      request
        .get(url)
        .end(function (err, res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.text.indexOf('db_name') > -1, true);
          done();
        });
    });

    it(suite + ' > check, that putting a document results in an ERROR', function (done) {
      var docId = 'pack-replicate-put-' + Math.floor(Math.random() * 1000000) + '@1.0.0';
      var doc = { foo: 'bar' };
      var url = urljoin(opts.baseReplicateUrl, opts.storeName, apiPath, docId);
      request
        .put(url)
        .send(doc)
        .end(function (err, res) {
          assert.notEqual(res.statusCode, 201, "Expecting the document can NOT be created.");
          assert.notEqual(err, null, "ERROR expected.");
          done();
        });
    });

    it(suite + ' > should receive "pack@1.0.0" from source store', function (done) {
      var docId = 'pack@1.0.0';
      var url = urljoin(opts.baseReplicateUrl, opts.storeName, apiPath, docId);
      console.log('    Requesting', url);
      request
        .get(url)
        .end(function (err, res) {
          console.log('    StatusCode', res.statusCode);
          if (err) {
            done(err);
            return
          }
          assert.equal(res.text.indexOf(docId) > -1, true);
          done();
        });
    });
  });
