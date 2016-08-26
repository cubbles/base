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

/**
 * @see https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-32
 * @see https://tools.ietf.org/html/draft-ietf-oauth-v2-bearer-23
 */

describe(suite, function() {
    var existingDocId;

    it(suite + ' > request a token', function(done) {
        var url = urljoin(opts.baseUrl, opts.authenticationServicePath);
        request
            .post(url)
            .send({user: 'base-api-test-user', password: 'cubbles'})
            .end(function(err, res) {
                var access_token = res.body.access_token;
                // token example: 'eyJ0eXAiOiJ9.eyJ1c2VyIjoiYmFzZS1hcG.eyJ1c2VyIjoiYmFzZS1h
                var count = access_token.match(/\./g).length;
                assert.equal(count, 2, 'invalid token structure');
                assert.equal(res.statusCode, 200);
                done();
            });
    });

    it(suite + ' > invalid request for a token', function(done) {
        var url = urljoin(opts.baseUrl, opts.authenticationServicePath);
        request
            .post(url)
            .send({user: 'base-api-test-user'})
            .end(function(err, res) {
                var access_token = res.body.access_token;
                // token example: 'eyJ0eXAiOiJ9.eyJ1c2VyIjoiYmFzZS1hcG.eyJ1c2VyIjoiYmFzZS1h
                var count = access_token ? access_token.match(/\./g).length : 0;
                assert.equal(count, 0, 'invalid token structure');
                assert.equal(res.headers['www-authenticate'], 'Error="incomplete_credentials", error_description="The request did not contain all expected credential information."', 'Expected another authenticate-header.');
                assert.equal(res.statusCode, 403);
                done();
            });
    });
});
