"use strict";

const constants = require('./constants');
const ValidationError = require('./error/validation-error');
const isPromise = require('./utils').isPromise;

class Validator {

  /**
   *
   * @param {RegExp|Function|Number|Array} validator
   * @param {Program} program
   */
  constructor(validator, program) {
    this._validator = validator;
    this._program = program;

    if (typeof this._validator === 'number') {
      this._checkFlagValidator();
    } else {
      this._checkOtherValidator();
    }
  }

  /**
   *
   * @private
   */
  _checkOtherValidator() {
    if (typeof this._validator !== 'function' && !(this._validator instanceof RegExp) && !Array.isArray(this._validator)) {
      const err = new ValidationError(
        "Caporal setup error - Invalid validator setup.",
        {validator: this._validator},
        this._program
      );
      this._program.fatalError(err);
    }
  }

  /**
   *
   * @private
   */
  _checkFlagValidator() {
    const isValidatorInvalid = Object.keys(constants).every(v => {
      return ((constants[v] & this._validator) === 0)
    });
    if (isValidatorInvalid) {
      const err = new ValidationError(
        "Caporal setup error - Invalid flag validator setup.",
        {validator: this._validator},
        this._program
      );
      this._program.fatalError(err);
    }
  }

  isArrayValidator() {
    return Array.isArray(this._validator);
  }

  getChoices() {
    return this.isArrayValidator() ? this._validator : [];
  }

  /**
   *
   * @param value
   * @returns {*}
   */
  validate(value) {

    if (typeof this._validator === 'function') {
      return this._validateWithFunction(value);
    }
    else if (this._validator instanceof RegExp) {
      return this._validateWithRegExp(value);
    }
    else if (Array.isArray(this._validator)) {
      return this._validateWithArray(value);
    }
    // Caporal flag validator
    else if(typeof this._validator === 'number') {
      return this._validateWithFlags(value);
    }
  }

  /**
   *
   * @returns {*}
   * @private
   */
  _validateWithFlags(value, unary) {
    if (!unary && this._validator & constants.ARRAY) {

      if (typeof value === 'string') {
        value = value.split(',');
      } else if (!Array.isArray(value)) {
        value = []
      }

      return value.map(function (el) {
        return this._validateWithFlags(el, true);
      }, this);
    }

    if (this._validator & constants.INT) {
      if (!Validator.isNumber(value)) {
        throw new ValidationError("Type (INT) validation failed", {value}, this._program);
      }
      return parseInt(value);
    }
    else if (this._validator & constants.FLOAT) {
      if (!Validator.isNumber(value)) {
        throw new ValidationError("Type (FLOAT) validation failed", {value}, this._program);
      }
      return parseFloat(value);
    }
    else if (this._validator & constants.STRING) {
      if (typeof value !== 'string') {
        throw new ValidationError("Type (STRING) validation failed", {value}, this._program);
      }
      return value;
    }
    else if (this._validator & constants.BOOL) {
      if (typeof value === 'boolean') {
        return value;
      } else if (/^(true|false|yes|no|0|1)$/i.test(value) === false) {
        throw new ValidationError("Type (BOOL) validation failed", {value}, this._program);
      } else {
        return !(value === '0' || value === 'no' || value === 'false');
      }
    }

    return value;
  }

  /**
   *
   * @returns {*}
   * @private
   */
  _validateWithFunction(value) {
    const throwAsInvalid = (_value, _e) => {
      throw new ValidationError(
        "Function validation failed",
        {validator: this._validator, _value, error: _e},
        this._program
      );
    }
    try {
      const result = this._validator(value);
      if (isPromise(result)) {
        return result.catch(e => throwAsInvalid(value, e));
      } else {
        return result
      }
    } catch(e) {
      throwAsInvalid(value, e);
    }
  }

  /**
   *
   * @returns {*}
   * @private
   */
  _validateWithArray(value) {
    if (this._validator.map(String).indexOf(value) === -1) {
      throw new ValidationError(
        "Array validation failed",
        {validator: this._validator, value},
        this._program
      );
    }
    return value;
  }

  /**
   *
   * @returns {*}
   * @private
   */
  _validateWithRegExp(value) {
    if (!this._validator.test(value)) {
      throw new ValidationError(
        "RegExp validation failed",
        {validator: this._validator, value},
        this._program
      );
    }
    return value;
  }

  static isNumber(obj) {
    return !isNaN(parseFloat(obj));
  }
}

module.exports = Validator;
