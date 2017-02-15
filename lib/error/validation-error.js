"use strict";

const BaseError = require('./base-error');

class ValidationError extends BaseError {}

module.exports = ValidationError;
