/**
 * Created by hrbu on 24.11.2015.
 */
'use strict';
var urljoin = require('url-join');
var assert = require('assert');
var request = require('superagent');
var opts = require('./_opts.js');
var supercouch = require('supercouch');
var couch = supercouch(opts.couchUrl);
var suite = __filename.replace(__dirname + '/', "#");

describe(suite,
    function() {
        it(suite + ' > should return 200', function(done) {
            var url = urljoin(opts.proxyUrl, opts.storeName);
            request
                .get(url)
                .end(function(err, res) {
                    assert.equal(res.statusCode, 200);
                    assert.equal(res.text.indexOf('db_name') > -1, true);
                    done();
                });
        });


        it(suite + ' > should receive "doc1"', function(done) {
            var docId = 'doc1';
            var url = urljoin(opts.proxyUrl, opts.storeName, docId);
            console.log('    Requesting', url);
            request
                .get(url)
                .end(function(err, res) {
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
