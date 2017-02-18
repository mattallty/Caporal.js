"use strict";

const winston = require('winston');
const util = require('util');
const prettyjson = require('prettyjson');

const CaporalTransport = function (options) {
  options = options || {};
  this.name = 'caporal';
  this.level = options.level || 'info';
  this._callback = options.callback || function(text, level){
    //console.log("caporal-callback: %s: %s", level, text);
  }
};

util.inherits(CaporalTransport, winston.Transport);

CaporalTransport.prototype.setCallback = function(callback) {
  this._callback = callback;
};

CaporalTransport.prototype.log = function (level, msg, meta, callback) {
  if (typeof meta === 'object' && Object.keys(meta).length) {
    msg += "\n" + prettyjson.render(meta);
  }
  const levelInt = winston.levels[level];
  this._callback(msg, levelInt <= 1 ? 'stderr' : 'stdout');
  callback(null, true);
};

exports.logger = new (winston.Logger)({
  transports: [
    new (CaporalTransport)()
  ]
});
