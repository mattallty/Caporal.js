"use strict";

const BaseError = require('./base-error');
const chalk = require('chalk');

class InvalidArgumentValueError extends BaseError {

  constructor(arg, value, command, originalError, program) {
    let msg = `Invalid value '${value}' for argument ${chalk.italic(arg)}.\n   ${originalError.meta.originalError}`;
    super(msg, {arg, command, value}, program);
  }
}

module.exports = InvalidArgumentValueError;
