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
 * The backup will be created into the /backups folder.
 * We recommend to mount an external folder on this directory to write the backups on a host folder.
 * > Check the 'docker-compose-custom.yml' file for mounted volumes into the 'base.coredatastore' service.
 */
module.exports = function (vorpal) {
  var backupFolder = '/backups';
  var couchdbFolder = '/usr/local/var/lib/couchdb';

  vorpal
    .command('backup')
    .option('-v, --verbose [optionalBoolean]', 'Show details.')
    .description(
      'Backup the "base.coredatastore" > "' + couchdbFolder + '" folder.')
    .action(start);

  function start (args, done) {
    global.command = { args: args };
    var service = 'base.coredatastore';
    var backupFile = backupFolder + '/base.coredatastore_volume-' + new Date().toISOString().split(':').join('-').split('.')[ 0 ] + 'Z.tar.gz';
    var backupCommand = `'sh -c "mkdir -p ${backupFolder} && tar cfz ${backupFile} ${couchdbFolder}"'`;
    var commandArgs = '--rm --no-deps --entrypoint ' + backupCommand + ' ' + service;

    var execConfig = {
      composeCommand: {
        options: '-f docker-compose.yml -f custom/docker-compose-custom.yml',
        command: 'run',
        commandArgs: commandArgs
      },
      commandExecOptions: {
        cwd: path.join(__dirname, '../../../..', 'etc'),
        env: {
          BASE_AUTH_DATASTORE_ADMINCREDENTIALS: 'not required'
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
      console.log('Created backup file within container "%s": \n* %s', service, backupFile);
      console.log('Note: The /backup folder should be mounted from an external location, you want to manage your backups in. For details see the docker-compose-custom.yml file of your configuration.');
      //stderr && console.log('stderr: ', stderr);

      done()
    });
  }
};
