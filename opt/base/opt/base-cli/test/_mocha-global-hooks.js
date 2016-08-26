/**
 * Created by hrbu on 24.11.2015.
 * This file implements the global mocha root-level hooks 'before' and 'after'.
 * @see https://mochajs.org/#hooks >> Root-Level Hooks
 *
 * The test suite expects to have a boot2docker-instance running.
 */
'use strict';
var assert = require('assert');

before(function (done) {
  done()
});

after(function (done) {
  done()
});

