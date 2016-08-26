/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var path = require('path');
var Mocha = require('mocha');

module.exports = function (vorpal) {

  vorpal
    .command('test-demo-services_couchdb')
    .description('Test the Base Demo-Services. Requires the Demo-Services to be up.')
    .action(start);

  function start (args, done) {
    // global.command = { args: args };
    // var cluster = args.cluster;

    /*
     Run mocha tests.
     @see https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
     */
    // Instantiate a Mocha instance.
    var mocha = new Mocha({});
    mocha.addFile('lib/test-demo-services/test/couchdb/_mocha-global-hooks.js');
    mocha.addFile('lib/test-demo-services/test/couchdb/download-api-storelevel.js');
    mocha.addFile('lib/test-demo-services/test/couchdb/replicate-api-storelevel.js');

    var resultLog = '';
    var failedLog = '';
    console.log("Testsuite: Running tests ...");

    /*
     * @see https://github.com/mochajs/mocha/blob/master/lib/runner.js#L41
     */
    mocha.run(function (failures) {
      process.on('exit', function () {
        resultLog += '\n' + 'Failures: ' + failures;
        console.log(resultLog);
        console.log(failedLog);
        done();  // exit with non-zero status if there were failures
      })
    })
      .on('pass', function (test) {
        resultLog += '\n' + ' Passed: ' + test.title;
      })
      .on('fail', function (test, err) {
        resultLog += '\n' + ' Failed: ' + test.title;
        failedLog += '\n' + ' Failed: ' + test.title;
        failedLog += '\n' + JSON.stringify(err);
      })
      .on('end', function () {
        resultLog += '\n' + '================';
        resultLog += '\n' + 'All tests done.';
      });
  }
};
