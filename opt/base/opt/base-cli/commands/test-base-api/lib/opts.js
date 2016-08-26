/**
 * Created by hrbu on 24.11.2015.
 */
/**
 * Opts definition for testcases.
 *
 * Note: You can override each option by passing it as process argument
 * --baseUrl=http://gateway
 * --baseUploadUrl=http://dev:webble%231@gateway
 * --baseReplicateUrl=http://replicator:webble%231@gateway
 * --couchUrl=http://admin:admin@coredatastore:5984
 */

var opts = require('nomnom')
  .option('baseUrl', {
    type: 'string',
    default: 'http://base.gateway'
  })
  .option('baseUploadUrl', {
    type: 'string',
    default: 'http://base.gateway'
  })
  .option('baseUploadWithCookieUrl', {
    type: 'string',
    default: 'http://base.gateway'
  })
  .option('baseReplicateUrl', {
    type: 'string',
    default: 'http://base.gateway'
  })
  .option('couchUrl', {
    type: 'string',
    default: 'http://' + process.env[ "BASE_AUTH_DATASTORE_ADMINCREDENTIALS" ] + '@base.coredatastore:5984'
  })
  .option('storeName', {
    type: 'string',
    default: 'base-api-test'
  })
  .option('finallyRemoveTestData', {
    type: 'boolean',
    // default: process.env.REMOVE_TESTDATA ? JSON.parse(process.env.REMOVE_TESTDATA) : true
    default: false
  })
  .option('dbNamePrefix', {
    type: 'string',
    default: 'webpackage-store'
  })
  .option('authenticationServicePath', {
    type: 'string',
    default: '_api/authenticate'
  })
  .parse();

module.exports = opts;
