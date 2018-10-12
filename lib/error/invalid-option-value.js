"use strict";

const BaseError = require('./base-error');
const getDashedOption = require('../utils').getDashedOption;
const c = require('colorette');

class InvalidOptionValueError extends BaseError {
  constructor(option, value, command, originalError, program) {
    let msg = `Invalid value '${value}' for option ${c.italic(getDashedOption(option))}.\n   ${originalError.meta.originalError}`;

    super(msg, {option, command, originalError}, program);
  }
}

module.exports = InvalidOptionValueError;
