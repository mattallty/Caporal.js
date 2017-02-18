"use strict";

const BaseError = require('./base-error');

class OptionSyntaxError extends BaseError {
  constructor(synopsis, program) {
    let msg = `Syntax error in option synopsis: ${synopsis}`;
    super(msg, {synopsis}, program);
  }
}

module.exports = OptionSyntaxError;
