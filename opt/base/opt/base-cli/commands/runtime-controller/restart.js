/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var path = require('path');
var composeProxy = require('../../lib/compose');
var execCompose = composeProxy.command;

module.exports = function (vorpal) {

  vorpal
    .command('restart <cluster> <service>')
    .option('-v, --verbose [optionalBoolean]', 'Show details.')
    .description(
      'Restart a service of the Cubbles Base.')
    .action(start);

  function start (args, done) {
    global.command = { args: args };
    var cluster = args.cluster;
    var execConfig = {
      composeCommand: {
        options: '-f docker-compose.yml -f docker-compose-' + cluster + '.yml',
        cluster: cluster,
        command: 'restart',
        commandArgs: args.service
      },
      commandExecOptions: {
        cwd: path.join(__dirname, '../../../..', 'etc/docker-compose-config'),
        env: {
          BASE_CLUSTER: cluster,
          BASE_AUTH_DATASTORE_ADMINCREDENTIALS: 'not needed' }
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