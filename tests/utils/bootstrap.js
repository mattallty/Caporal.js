"use strict";

global.Program = require('../../lib/program');
global.should = require('should/as-function');
global.logger = require('./callback-logger').logger;
global.makeArgv = require('./make-argv');
global.sinon = require('sinon');
