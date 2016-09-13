/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var path = require('path');
var Mocha = require('mocha');

module.exports = function (vorpal) {

  vorpal
    .command('test-base-api')
    .description('Test the Base API`s. Requires the Base to be up.')
    .action(start);

  function start (args, done) {
    // global.command = { args: args };

    /*
     Run mocha tests.
     @see https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
     */
    // Instantiate a Mocha instance.
    var mocha = new Mocha({});
    mocha.addFile('commands/test-base-api/test/_mocha-global-hooks.js');
    mocha.addFile('commands/test-base-api/test/authentication-api.js');
    mocha.addFile('commands/test-base-api/test/download-api-storelevel.js');
    mocha.addFile('commands/test-base-api/test/replicate-api-storelevel.js');
    mocha.addFile('commands/test-base-api/test/search-api-storelevel.js');
    mocha.addFile('commands/test-base-api/test/upload-api-storelevel.js');
    mocha.addFile('commands/test-base-api/test/upload-api-storelevelWithCookie.js');

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
