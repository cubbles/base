/**
 * Created by hrbu on 24.11.2015.
 * This file implements the global mocha root-level hooks 'before' and 'after'.
 * @see https://mochajs.org/#hooks >> Root-Level Hooks
 *
 */
'use strict';
var assert = require('assert');
var opts = require('./_opts.js');
var request = require('superagent');
var supercouch = require('supercouch');
var couch = supercouch(opts.couchUrl);
var dbName = opts.dbNamePrefix + '-' + opts.storeName;

function removeDb (done, next) {
  couch
    .dbExists(dbName)
    .end(function (err, res) {
      // db does exist
      if (res == true) {
        console.log('Removing database: %s', dbName);
        couch
          .dbDel(dbName)
          .end(function (err, res) {
            if (err) {
              return done(err)
            }
            if (next) {
              next(done);
            } else {
              done()
            }
          })
      } else {
        if (next) {
          next(done);
        } else {
          done()
        }
      }
    });
}

function addDb (done) {
  console.log('Creating database: %s', dbName);
  couch
    .dbAdd(dbName)
    .end(function (err, res) {
      if (err) {
        console.log('dbAdd failed', err);
        return done(err);
      } else {
        addStoreDocument(done)
      }
    });
}

function addStoreDocument (done) {
  var doc = { _id: 'doc1', foo: 'bar' };
  console.log('Creating document: %s\n', doc._id);
  couch
    .db(dbName)
    .insert(doc)
    .end(function (err, res) {
      if (err) {
        console.log('document insert failed', err);
        return done(err);
      }
      done();
    });
}

before(function (done) {
  // function: create a test user
  console.log('before ....');

  // create test-database (re-create, if one exists)
  removeDb(done, addDb);
});

after(function (done) {

  // remove testuser and test-database
  if (opts.finallyRemoveTestData) {
    removeDb(done);
  } else {
    done()
  }
});

