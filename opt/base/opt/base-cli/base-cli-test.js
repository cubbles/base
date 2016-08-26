/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var path = require('path');
var Mocha = require('mocha');

/*
 Run mocha tests.
 @see https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
 */
// Instantiate a Mocha instance.
var mocha = new Mocha({});
mocha.addFile('test/_mocha-global-hooks.js');
mocha.addFile('test/replicator.add-replication.js');

var resultLog = '';
var failedLog = '';
console.log("Testsuite: Running tests ...");

/*
 * @see https://github.com/mochajs/mocha/blob/master/lib/runner.js#L41
 */
var currentSuite;
mocha.run(function (failures) {
  process.on('exit', function () {
    resultLog += '\n' + 'Failures: ' + failures;
    console.log(resultLog);
    console.log(failedLog);
  })
})
  .on('suite', function (suite) {
    resultLog += '\n' + suite.title;
    currentSuite=suite;
  })
  .on('pass', function (test) {
    resultLog += '\n' + ' Passed: ' + test.title;
  })
  .on('fail', function (test, err) {
    resultLog += '\n' + ' Failed: ' + test.title;
    failedLog += '\n' + ' Failed: ' + currentSuite.title + ' > ' + test.title;
    failedLog += '\n' + JSON.stringify(err);
  })
  .on('end', function () {
    resultLog += '\n' + '================';
    resultLog += '\n' + 'All tests done.';
  });

