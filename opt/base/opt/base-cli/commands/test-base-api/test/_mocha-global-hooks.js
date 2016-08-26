/**
 * Created by hrbu on 24.11.2015.
 * This file implements the global mocha root-level hooks 'before' and 'after'.
 * @see https://mochajs.org/#hooks >> Root-Level Hooks
 *
 * The test suite expects to have a boot2docker-instance running.
 */
'use strict';
var assert = require('assert');
var opts = require('../lib/opts.js');
var request = require('superagent');
var supercouch = require('supercouch');
var couch = supercouch(opts.couchUrl);
var dbName = opts.dbNamePrefix + '-' + opts.storeName;
var dbReplicaName = opts.dbNamePrefix + '-' + opts.replicaStoreName;
var userDoc = {
  _id: 'org.couchdb.user:base-api-test-user',
  name: 'base-api-test-user',
  logins: {
    local: {
      login: 'base-api-test-user'
    }
  },
  roles: [],
  type: 'user',
  password: 'cubbles'
};

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
        console.log('Failed to create database "' + dbName + '": ', err);
        return done(err);
      }
      replicateFromCore(done);
    });

}

function replicateFromCore (done) {
  // console.log('#######', opts.couchUrl);
  request.post(opts.couchUrl + '/_replicate')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send('{"source":"webpackage-store-core","target":"' + dbName + '", "doc_ids":["_design/couchapp-webpackage-validator"]}')
    .end(function (err, res) {
      if (err) {
        console.log('replication from core failed', err);
        return done(err);
      }
      addStoreDocuments(done);
    });
}

function addStoreDocuments (done) {
  var doc1 = {
    _id: 'pack@1.0.0-SNAPSHOT',
    foo: 'bar',
    _attachments: {
      "snapshot.txt": {
        content_type: "text/plain",
        data: "VGhpcyBpcyBhIGJhc2U2NCBlbmNvZGVkIHRleHQ="
      }
    }
  };
  var doc2 = {
    _id: 'pack@1.0.0',
    foo: 'bar',
    _attachments: {
      "final.txt": {
        content_type: "text/plain",
        data: "VGhpcyBpcyBhIGJhc2U2NCBlbmNvZGVkIHRleHQ="
      }
    }
  };
  console.log('Creating documents: %s\n', doc1._id, doc2._id);
  couch
    .db(dbName).insert(doc1)
    .end(function (err, res) {
      if (err) { return done(err)}
      couch
        .db(dbName).insert(doc2)
        .end(function (err, res) {
          if (err) { return done(err)}
          done();
        });
    });
}

before(function (done) {
    this.timeout(3000);
  console.log('before ....');

  console.log('credentials: ', process.env[ "BASE_AUTH_DATASTORE_ADMINCREDENTIALS" ]);
  function addUser (next) {
    console.log('Creating user: %s\n', userDoc._id);
    couch
      .db('_users')
      .get(userDoc._id)
      .end(function (err, res) {
        // return if user does already exist
        if (res) {
          next();
          return;
        }
        couch
          .db('_users')
          .insert(userDoc)
          .end(function (err, res) {
            if (err) {
              console.log('document update failed', err);
              return done(err);
            }
            next();
          });
      });
  }
  // add testuser and test-database
  addUser(function () {
    removeDb(done, addDb);
  });
});

after(function (done) {
  function removeUser (next) {
    console.log('Remove user: %s\n', userDoc._id);
    couch
      .db('_users')
      .get(userDoc._id)
      .end(function (err, res) {
        couch
          .db('_users')
          .remove(userDoc._id, res._rev)
          .end(function (err, res) {
            if (err) {
              console.log('removeUser failed', err);
              return done(err);
            }
            next();
          });
      });
  }

  // remove testuser and test-database
  if (opts.finallyRemoveTestData) {
    removeUser(function () {
      removeDb(done);
    })
  } else {
    done()
  }
});

