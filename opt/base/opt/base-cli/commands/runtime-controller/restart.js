/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var path = require('path');
var composeProxy = require('../../lib/compose');
var composeOptions = require('../../lib/compose-options');
var execCompose = composeProxy.command;

module.exports = function (vorpal) {

  vorpal
    .command('restart <service>')
    .option('-v, --verbose [optionalBoolean]', 'Show details.')
    .description(
      'Restart a service of the Cubbles Base.')
    .action(start);

  function start (args, done) {
    global.command = { args: args };
    var execConfig = {
      composeCommand: {
        options: composeOptions.getOptions(),
        command: 'restart',
        commandArgs: args.service
      },
      commandExecOptions: {
        cwd: path.join(__dirname, '../../../..', 'etc'),
        env: {
          BASE_AUTH_DATASTORE_ADMINCREDENTIALS: 'not required' }
      }
    };
    execCompose(execConfig, function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        done(error);
        return
      }
      stdout && console.log('stdout: ########', stdout);
      //stderr && console.log('stderr: ', stderr);
    });
  }
};