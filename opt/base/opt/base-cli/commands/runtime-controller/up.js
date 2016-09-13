/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var path = require('path');
var composeProxy = require('../../lib/compose');
var execCompose = composeProxy.command;

module.exports = function (vorpal) {

  vorpal
    .command('up')
    .description('Start the Cubbles Base.')
    .option('-a, --account <login:password>', 'Credentials for the coredatastore admin account.')
    .option('-f, --forceRecreate [optionalBoolean]', 'Force recreation of docker containers (default=false).')
    .option('-v, --verbose [optionalBoolean]', 'Show details.')
    .action(start);

  function start (args, done) {
    var adminCredentials;
    try {
      _validateAdminAccountPattern(args.options.account);
      adminCredentials = args.options.account;
    } catch (error) {
      console.error('ERROR: ', error.message);
      done();
      return;
    }

    global.command = { args: args };
    var execConfig = {
      composeCommand: {
        options: '-f docker-compose.yml -f custom/docker-compose-custom.yml',
        command: 'up',
        commandArgs: '-d' + (args.options.forceRecreate ? ' --force-recreate' : '')
      },
      commandExecOptions: {
        cwd: path.join(__dirname, '../../../..', 'etc'),
        env: {
          BASE_AUTH_DATASTORE_ADMINCREDENTIALS: adminCredentials
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
      //stderr && console.log('stderr: ', stderr);
    });
  }
}
;

/**
 *
 * @param coredatastoreAdminAccount
 * @return {boolean}
 */
function _validateAdminAccountPattern (coredatastoreAdminAccount) {
  var credentialsRegex = '([^:]*):([^:]*)';
  if (coredatastoreAdminAccount && coredatastoreAdminAccount.match(credentialsRegex)) {
    return true;
  } else {
    throw new Error('Option "-c" NOT given OR its value does NOT match the regex "' + credentialsRegex + '". Valid example: "admin:mypassword"');
  }
}