/* globals it, describe*/
'use strict';
var assert = require('assert');
var request = require('superagent');
var opts = require('./_opts.js');
var supercouch = require('supercouch');
var childProcess = require('child_process');
var suite = __filename.replace(__dirname + '/', "#");

describe(suite,
  function () {
    it('checks the base to be running and accessible', function (done) {
      request
        .get(opts[ 'baseUrl' ])
        .end(function (err, res) {
          assert(res != null);
          assert.equal(res.statusCode, 200);
          done();
        });
    });

    it('checks the environment', function (done) {
      assert.equal(typeof(process.env["BASE_AUTH_DATASTORE_ADMINCREDENTIALS"]), "string");
      done();
    });

    it('checks local replication', function (done) {
      function _checkReplicationDoc (replicationDocId) {
        request
          .get("http://" + opts[ 'adminCredentials' ] + "@base.coredatastore:5984/_replicator/" + replicationDocId)
          .end(function (err, res) {
            assert(res != null);
            assert.equal(res.statusCode, 200);
            var responseJSON = JSON.parse(res.text);
            // console.log(responseJSON);
            assert.equal(responseJSON[ '_replication_state' ], 'completed');
            done();
          });
      }

      // ---- main ----
      var replication = childProcess.fork('base-cli.js', "add-replication core base-cli-test_replicate -u admin -p admin".split(" "));
      replication.on('message', function (message) {
        assert(message.ok === true, 'Expected the replicationDoc to be successfully created.');
        assert(typeof(message.id) === 'string');
        assert(typeof(message.rev) === 'string');
        // console.log('PARENT got message:', message);
        setTimeout(_checkReplicationDoc, 2000, [ message.id ]);
      });

    }).timeout(10000);

    it('rejects invalid target database name', function (done) {
      var validationMessage;
      var replication = childProcess.fork('base-cli.js', "add-replication core invalid.db.name".split(" "));
      replication.on('message', function (message) {
        validationMessage = message;
      });

      replication.on('exit', function (message) {
        assert(validationMessage != undefined, 'Expected validationMessage to be already received.')
        assert.equal(validationMessage.indexOf('Value for "target" does not match the Regex'), 0);
        assert.equal(message, "1", "Expected replication to exit with a failure.");
        console.log("EXIT: ", message);
        done()
      });

    }).timeout(10000);

    it('checks anonymous remote replication', function (done) {
      function _checkReplicationDoc (replicationDocId) {
        request
          .get("http://" + opts[ 'adminCredentials' ] + "@base.coredatastore:5984/_replicator/" + replicationDocId)
          .end(function (err, res) {
            assert(res != null);
            assert.equal(res.statusCode, 200);
            var responseJSON = JSON.parse(res.text);
            // console.log(responseJSON);
            var _replication_state_reason;
            if(responseJSON[ '_replication_state_reason' ]) {
              _replication_state_reason = responseJSON[ '_replication_state_reason' ];
            }
            assert.equal(responseJSON[ '_replication_state' ], 'completed', `Expected replication with id "${replicationDocId}" to be completed. [Reason: ${_replication_state_reason}]`);
            done();
          });
      }

      // ---- main ----
      var replication = childProcess.fork('base-cli.js', "add-replication http://base.gateway/core base-cli-test_replicate-anonymous -u admin -p admin".split(" "));
      replication.on('message', function (message) {
        assert(message.ok === true, 'Expected the replicationDoc to be successfully created.');
        assert(typeof(message.id) === 'string');
        assert(typeof(message.rev) === 'string');
        // console.log('PARENT got message:', message);
        setTimeout(_checkReplicationDoc, 4000, [ message.id ]);
      });
    }).timeout(10000);

    // skip this, as there is currently no authorization configured
    it.skip('checks >authorized< remote replication', function (done) {
      function _checkReplicationDoc (replicationDocId) {
        request
          .get("http://" + opts[ 'adminCredentials' ] + "@base.coredatastore:5984/_replicator/" + replicationDocId)
          .end(function (err, res) {
            assert(res != null);
            assert.equal(res.statusCode, 200);
            var responseJSON = JSON.parse(res.text);
            // console.log(responseJSON);
            assert.equal(responseJSON[ '_replication_state' ], 'completed', `Expected replication with id "${replicationDocId}" to be completed.`);
            done();
          });
      }

      // ---- main ----
      var replication = childProcess.fork('base-cli.js', "add-replication http://base.gateway/core base-cli-test_replicate -u admin -p admin -r user:pass".split(" "));
      replication.on('message', function (message) {
        assert(message.ok === true, 'Expected the replicationDoc to be successfully created.');
        assert(typeof(message.id) === 'string');
        assert(typeof(message.rev) === 'string');
        // console.log('PARENT got message:', message);
        setTimeout(_checkReplicationDoc, 2000, [ message.id ]);
      });
    });
  });
