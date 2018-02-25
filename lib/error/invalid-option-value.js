"use strict";

const BaseError = require('./base-error');
const chalk = require('chalk');
const getDashedOption = require('../utils').getDashedOption;

class InvalidOptionValueError extends BaseError {
  constructor(option, value, command, originalError, program) {
    let msg = `Invalid value '${value}' for option ${chalk.italic(getDashedOption(option))}.\n   ${originalError.meta.originalError}`;

    super(msg, {option, command, originalError}, program);
  }
}

module.exports = InvalidOptionValueError;
