/**
 * Created by hrbu on 24.11.2015.
 */
'use strict';
var urljoin = require('url-join');
var assert = require('assert');
var opts = require('../lib/opts.js');
var request = require('superagent');
var jwt = require('jsonwebtoken');
var suite = __filename.replace(__dirname + '/', "#");

describe(suite,
  function () {
    var uploadApiPath = '_api/upload';

    // use http://jwt.io/ to prepare a token
    it(suite + ' > request a token', function (done) {
      var url = urljoin(opts.baseUrl, opts.authenticationServicePath);
      request
        .post(url)
        .send({ user: 'base-api-test-user', password: 'cubbles' })
        .end(function (err, res) {
          var access_token = res.body.access_token;
          var decodedToken = jwt.decode(access_token);
          console.log(decodedToken)
          // token example: 'eyJ0eXAiOiJ9.eyJ1c2VyIjoiYmFzZS1hcG.eyJ1c2VyIjoiYmFzZS1h
          var count = access_token.match(/\./g).length;
          assert.equal(count, 2, 'invalid token structure');
          assert.equal(res.statusCode, 200);
          done();
        });
    });

    // 201 Created (successful insert)
    // use http://jwt.io/ to prepare a token
    it(suite + ' > insert to ' + uploadApiPath + ' should return 201 Created', function (done) {
      var access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYmFzZS1hcGktdGVzdC11c2VyIiwiZ3JvdXBzIjpbXSwicGVybWlzc2lvbnMiOnsiYmFzZS1hcGktdGVzdCI6eyJ1cGxvYWQiOnRydWV9fSwiaWF0IjoxNDU2MzA4MTIxfQ.zMM3gtjTOCJrxCQ5oIIaqz_TKRaRL7FKpbjZlFOSZu4'
      var decodedToken = jwt.decode(access_token);
      if (Object.keys(decodedToken.permissions).length < 1) {
        console.log(decodedToken);
        assert(false, 'Expected at least one permission.')
      }
      var url = urljoin(opts.baseUploadWithCookieUrl, opts.storeName, uploadApiPath);
      var nano = require('nano')({ url: url, cookie: 'access_token=' + access_token });
      var doc = { field: "foo", value: "bar" };

      nano.insert(doc, function (err, body, headers) {
        console.log(body);
        assert.equal(headers[ 'statusCode' ], 201, "Expected status '201 Created'");
        assert.equal(headers[ 'location' ], urljoin(opts.baseUploadWithCookieUrl, opts.storeName, body.id), "Expected the location header to point to the download location.");
        if (err) {
          console.log('error: ', err);
          done(err);
          return;
        }
        done()
      });
    }).timeout(3000);

    // 401 Unauthorized (invalid token)
    // use http://jwt.io/ to prepare a token
    it(suite + ' > insert to ' + uploadApiPath + ' should return 401 Unauthorized (invalid token)', function (testDone) {
      var token = 'invalid token';
      var url = urljoin(opts.baseUploadWithCookieUrl, opts.storeName, uploadApiPath);
      var nano = require('nano')({ url: url, cookie: 'access_token=' + token });
      var doc = { field: "foo", value: "bar" };

      nano.insert(doc, function (err, body, headers) {
        assert.equal(err.headers[ 'x-cubbles-statusreason' ], 'invalid jwt string', "Expected another header value.");
        assert.equal(err.headers[ 'statusCode' ], 401, "Expected status '401 Unauthorized'");
        testDone()
      });
    });

    // 401 Unauthorized (expired token)
    // use http://jwt.io/ to prepare a token
    it(suite + ' > insert to ' + uploadApiPath + ' should return 401 Unauthorized (expired token)', function (testDone) {
      var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYmFzZS1hcGktdGVzdC11c2VyIiwiZ3JvdXBzIjpbXSwicGVybWlzc2lvbnMiOnt9LCJpYXQiOjE0NTYzMDgxMjEsImV4cCI6MH0.oWKcqlRkDRhiv7wBIQHQ7QAjdioMQ1vnf9Ka9fE8kbs'
      var url = urljoin(opts.baseUploadWithCookieUrl, opts.storeName, uploadApiPath);
      var nano = require('nano')({ url: url, cookie: 'access_token=' + token });
      var doc = { field: "foo", value: "bar" };

      nano.insert(doc, function (err, body, headers) {
        assert.equal(err.headers[ 'x-cubbles-statusreason' ], 'jwt token expired at: Thu, 01 Jan 1970 00:00:00 GMT', "Expected another header value.");
        assert.equal(err.headers[ 'statusCode' ], 401, "Expected status '401 Unauthorized'");
        testDone()
      });
    });

    // 200 OK + 401 Unauthorized due to missing permissions
    // use http://jwt.io/ to prepare a token
    it(suite + ' > roundtrip: request access_token and try insert doc to ' + uploadApiPath + ' should return 401 Unauthorized', function (testDone) {
      var authUrl = urljoin(opts.baseUrl, opts.authenticationServicePath);
      request
        .post(authUrl)
        .send({ user: 'base-api-test-user', password: 'cubbles' })
        .end(function (err, res) {
          var access_token = res.body.access_token;
          // token example: 'eyJ0eXAiOiJ9.eyJ1c2VyIjoiYmFzZS1hcG.eyJ1c2VyIjoiYmFzZS1h
          var count = access_token.match(/\./g).length;
          assert.equal(count, 2, 'invalid token structure');
          assert.equal(res.statusCode, 200);

          var decodedToken = jwt.decode(access_token);
          // console.log(decodedToken);

          // now try an upload
          var uploadUrl = urljoin(opts.baseUploadWithCookieUrl, opts.storeName, uploadApiPath);
          var nano = require('nano')({ url: uploadUrl, cookie: 'access_token=' + access_token });
          var doc = { field: 'foo', value: 'bar', uploadInProgress: true };
          nano.insert(doc, function (err, body, headers) {
            assert.equal(err.headers.statusCode, 401, "Expected status '401 Unauthorized'");
            if (err) {
              testDone();
              return;
            }
            testDone('Unexpected.')
          });
        });
    });
  }
)
;
