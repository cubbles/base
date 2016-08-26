/**
 * Created by hrbu on 24.11.2015.
 */
/**
 * Opts definition for testcases.
 *
 * Note: You can override each option by passing it as process argument
 * --baseUrl=http://gateway
 * --baseReplicateUrl=http://gateway
 */

var opts = require('nomnom')
    .option('proxyUrl', {
        type: 'string',
        default: 'http://base.gateway/_proxy/demo-services/couchdb'
    })
    .option('proxyReplicateUrl', {
        type: 'string',
        default: 'http://replicator:test@base.gateway/_proxy/demo-services/couchdb'
    })
    .option('couchUrl', {
        type: 'string',
        default: 'http://admin:admin@demo-services.couchdb:5984'
    })
    .option('dbNamePrefix', {
        type: 'string',
        default: 'demo'
    })
    .option('storeName', {
        type: 'string',
        default: 'api-test'
    })
    .option('finallyRemoveTestData', {
        type: 'boolean',
        default: process.env.REMOVE_TESTDATA ? JSON.parse(process.env.REMOVE_TESTDATA) : true
    })
    .parse();

module.exports = opts;
