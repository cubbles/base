/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var urlJoin = require('url-join');
const url = require('url');
var uuid = require('node-uuid');
var request = require('superagent');

module.exports = function (vorpal) {

  vorpal
    .command('add-replication <source> <target>')
    .option('-w, --webpackages [optionalList]', 'A comma separated list of webpackageIds: package-a@1.0,package-b@1.1')
    .option('-u, --username <value>', 'This user is allowed to create replication docs.')
    .option('-p, --password <value>', 'The user\'s password.')
    .option('-r, --replicationsourcecredentials [optionalString]', 'Credentials the replicator will use to access the source store (Pattern: <user>:<password>.')
    .option('-a, --acceptunauthorizedssl [optionalBoolean]', 'Accept unauthorized ssl certs (default=false).')
    .option('-c, --continuous [optionalBoolean]', 'Replicate continuously (default=false).')
    .option('-v, --verbose [optionalBoolean]', 'Print details.')
    .validate(function (args) {
      if (args.options.webpackages) {
        try {
          _parseArrayFromWebpackagesOption(args.options.webpackages);
        } catch (err) {
          this.log(err);
          return err.message + '\nExpected value of option "-w" to be an array with at least one item: ["package-a@1.0", "package-b@1.1"]'
        }
      }
      // args.target
      var targetRe = /^[a-z][a-z0-9\_\$()\+\-\/]*$/;
      if (!args.target.match(targetRe)) {
        var errorMessage = 'Value for "target" does not match the Regex ' + targetRe;
        process.send(errorMessage);
        return errorMessage;
      }
    })
    .description(
      'Add a new replication. Example: $ add-replication core sandbox -u admin -p secret -d 124lakjsf#234 -c true')
    .action(start);

  function start (args, done) {
    var self = this;
    var couchUrl = 'http://base.coredatastore:5984';
    var replicator = require('nano')({
      url: couchUrl + '/_replicator',
      requestDefaults: {
        auth: {
          user: args.options.username,
          pass: args.options.password
        }
      }
    });

    // source is a url?
    var source = args.source.indexOf('http') == 0 ? args.source : undefined;
    // source is a local store with only the suffix given
    source = (!source && args.source.indexOf('webpackage-store') < 0) ? 'webpackage-store-' + args.source : undefined;
    // source is a local store with the whole database name given
    source = source || args.source;

    // check source
    if (args.options.acceptunauthorizedssl || false) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    /* check source store to be available */
    var sourceUrl = source.indexOf('http') == 0 ? source : urlJoin(couchUrl, source);
    request = request.get(sourceUrl);

    /*    // optionally add authorization header
     (function () {
     var credentialsBuffer;
     if (args.options.username) {
     credentialsBuffer = new Buffer(args.options.username + ':' + args.options.password);
     request = request.set('Authorization', "Basic " + credentialsBuffer.toString('base64'))
     }
     })();*/

    // send request
    request.end(function (err, res) {
      if (err) {
        done('Source database not found: ' + sourceUrl + ' | error: ' + JSON.stringify(err));
        return;
      }
      /* if source store is available, create the replication doc */
      var replicationDoc = _createReplicationDoc(source, args);
      replicator.insert(replicationDoc,
        function (err, body) {
          if (err) {
            done(err);
            return;
          }
          // log the result to the uses stdout
          console.log(body);
          // send the result, if this is a child process (e.g. called from a testcase)
          if (process.send) {
            process.send(body);
          }
          done();
        });
    });
  }

  function _createReplicationDoc (source, args) {
    var replicationDoc = {
      _id: uuid.v1(),
      source: source.indexOf('http') == -1 ? source : urlJoin(source, '_api/replicate'),
      target: 'webpackage-store-' + args.target,
      create_target: true,
      continuous: args.options.continuous || false,
      user_ctx: {
        "roles": [
          "_admin" //this allows to replicate _design-docs as well
        ]
      }
    };
    // optionally add docIds
    if (args.options.webpackages) {
      replicationDoc.doc_ids = _parseArrayFromWebpackagesOption(args.options.webpackages);
    }
    // optionally set source authorization headers
    if (args.options.replicationsourcecredentials) {
      var buffer = new Buffer(args.options.replicationsourcecredentials);
      replicationDoc.source = {
        url: replicationDoc.source,
        headers: { Authorization: "Basic " + buffer.toString('base64') }
      };
    }
    return replicationDoc
  }

  function _parseArrayFromWebpackagesOption (option) {
    // replace some characters we might receive, but do not need
    var string = option.replace(/\[/g, '');
    string = option.replace(/\]/g, '');
    string = option.replace(/\"/g, '');
    //
    var webpackagesArray = string.split(/\s*,\s*/);
    if (webpackagesArray.length < 1) throw new Error('Empty array.');
    //
    return webpackagesArray
  }
}
;
