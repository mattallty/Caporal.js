"use strict";

const BaseError = require('./base-error');
const chalk = require('chalk');
const getDashedOption = require('../utils').getDashedOption;

class MissingOptionError extends BaseError {
  constructor(option, command, program) {
    let msg = `Missing option ${chalk.italic(getDashedOption(option))}.`;
    super(msg, {option, command}, program);
  }
}

module.exports = MissingOptionError;
