/**
 * Created by hrbu on 24.11.2015.
 */
/**
 * Opts definition for testcases.
 *
 */

var opts = require('nomnom')
  .option('baseUrl', {
    type: 'string',
    default: 'http://base.gateway'
  })
  .option('storeName', {
    type: 'string',
    default: 'base-cli-test'
  })
  .option('adminCredentials', {
    type: 'string',
    default: process.env["BASE_AUTH_DATASTORE_ADMINCREDENTIALS"]
  })
  .parse();

module.exports = opts;
