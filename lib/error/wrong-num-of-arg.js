"use strict";

const BaseError = require('./base-error');

class WrongNumberOfArgumentError extends BaseError {}

module.exports = WrongNumberOfArgumentError;
