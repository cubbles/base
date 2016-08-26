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
    var apiPath = '_design/couchapp-artifactsearch/_list/listArtifacts/viewArtifacts';
    it(suite + ' > get on ' + apiPath + ' should return 200', function (done) {
      var url = urljoin(opts.baseUrl, 'core', apiPath);
      // console.log('    Requesting url: ', url);
      request
        .get(url)
        .end(function (err, res) {
          if (err) {
            done(err);
          }
          assert.equal(res.statusCode, 200);
          done();
        });
    });
  }
)
;
