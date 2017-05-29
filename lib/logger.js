"use strict";

const winston = require('winston');
const util = require('util');
const prettyjson = require('prettyjson');

const CaporalTransport = function (options) {
  this.name = 'caporal';
  this.level = options.level || 'info';
};

util.inherits(CaporalTransport, winston.Transport);

CaporalTransport.prototype.log = function (level, msg, meta, callback) {
  if (meta !== null && typeof meta === 'object' && Object.keys(meta).length) {
    msg += "\n" + prettyjson.render(meta);
  }
  msg += "\n";
  const levelInt = winston.levels[level];
  const stdio = levelInt <= 1 ? 'stderr' : 'stdout';
  process[stdio].write(msg);
  callback(null, true, stdio);
};

exports.createLogger = function createLogger(opts) {

  opts = opts || {};

  const logger = exports.logger = new (winston.Logger)({
    transports: [
      new (CaporalTransport)(opts)
    ]
  });

  return logger;
};
