"use strict";

//const program = global.program = require('../..');
const Program = global.Program = require('../../lib/program');
const should = global.should = require('should/as-function');
const logger = global.logger = require('./callback-logger').logger;
const makeArgv = global.makeArgv = require('./make-argv');
const sinon = global.sinon = require('sinon');
