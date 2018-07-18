"use strict";

const BaseError = require('./base-error');
const getDashedOption = require('../utils').getDashedOption;
const c = require('colorette');

class MissingOptionError extends BaseError {
  constructor(option, command, program) {
    let msg = `Missing option ${c.italic(getDashedOption(option))}.`;
    super(msg, {option, command}, program);
  }
}

module.exports = MissingOptionError;
