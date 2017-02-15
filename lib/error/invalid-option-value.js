"use strict";

const BaseError = require('./base-error');
const chalk = require('chalk');

class InvalidOptionValueError extends BaseError {
  constructor(option, value, command, originalError, program) {
    let optionDashed;
    if (option.length === 1) {
      optionDashed = '-' + option;
    } else {
      optionDashed = '--' + option;
    }

    let msg = `Invalid value '${value}' for option ${chalk.italic(optionDashed)}.`;
    super(msg, {option, command, originalError}, program);
  }
}

module.exports = InvalidOptionValueError;
