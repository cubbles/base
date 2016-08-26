/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var path = require('path');
var composeProxy = require('../../lib/compose');
var execCompose = composeProxy.command;

module.exports = function (vorpal) {
  vorpal
    .command('logs <cluster> [service]')
    .option('-v, --verbose [optionalBoolean]', 'Show details.')
    .option('--tail [optionalNumber]', 'Number of lines to show from the end of the logs for each container.')
    .description(
      'Show the logs of a Cubbles Base cluster or a specific service.')
    .action(start);

  function start (args, done) {
    global.command = { args: args };
    //console.log('parsed args: ',args)
    var cluster = args.cluster;
    var execConfig = {
      composeCommand: {
        options: '-f docker-compose.yml -f docker-compose-' + cluster + '.yml',
        cluster: cluster,
        command: 'logs',
        commandArgs: '-t --tail ' + (args.options.tail ? args.options.tail : 10) + (args.service ? ' ' + args.service : '')
      },
      commandExecOptions: {
        cwd: path.join(__dirname, '../../../..', 'etc/docker-compose-config'),
        env: { BASE_CLUSTER: cluster }
      }
    };
    execCompose(execConfig, function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        done(error);
        return
      }
      stdout && console.log(stdout);
      //stderr && console.log('stderr: ', stderr);

      done()
    });
  }
};