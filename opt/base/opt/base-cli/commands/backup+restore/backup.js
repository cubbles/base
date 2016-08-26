/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var composeProxy = require('../../lib/compose');
var execCompose = composeProxy.command;

/*
 * Important:
 * ----------
 * Running a backup, requires
 * 1) the 'cubbles/base' container mounted with the 'cubbles/base.coredatastore' volumes.
 *    This is expected as we want to backup the couchdb db files within the container.
 * 2) the 'cubbles/base' container mounted with a folder onto the '/backups' folder, to persist the backup file on a persistent store.
 *    The script stores backupFile into the '/backups' (inside the container).
 */
module.exports = function (vorpal) {
  var backupFolder = '/backups';
  var couchdbFolder = '/usr/local/var/lib/couchdb';

  vorpal
    .command('backup <cluster>')
    .option('-v, --verbose [optionalBoolean]', 'Show details.')
    .description(
      'Backup the "base.coredatastore" > "' + couchdbFolder + '" folder.')
    .action(start);

  function start (args, done) {
    global.command = { args: args };
    var cluster = args.cluster;
    var service = 'base.coredatastore';
    var backupFile = backupFolder + '/base.coredatastore_volume-' + new Date().toISOString().split(':').join('-').split('.')[ 0 ] + 'Z.tar.gz';
    var backupCommand = '"tar cfz ' + backupFile + ' ' + couchdbFolder + '"';
    var commandArgs = '--rm --no-deps --entrypoint ' + backupCommand + ' ' + service;

    var execConfig = {
      composeCommand: {
        options: '-f docker-compose.yml -f docker-compose-' + cluster + '.yml',
        cluster: cluster,
        command: 'run',
        commandArgs: commandArgs
      },
      commandExecOptions: {
        cwd: path.join(__dirname, '../../../..', 'etc/docker-compose-config'),
        env: {
          BASE_CLUSTER: cluster
        }
      }
    };

    execCompose(execConfig, function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        done(error);
        return
      }
      stdout && console.log(stdout);
      console.log('Created backup-file within container "%s": "%s"', service, backupFile);
      //stderr && console.log('stderr: ', stderr);

      done()
    });
  }
};
