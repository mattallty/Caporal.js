"use strict";

const GetterSetter = require('./utils').GetterSetter;
const Validator = require('./validator');

class Argument extends GetterSetter {

  /**
   *
   * @param {String} synopsis - Option synopsis
   * @param {String} description - Option description
   * @param {String|RegExp|Function|Number|Array} [validator] - Option validator, used for checking or casting
   * @param {*} [defaultValue] - Default value
   * @param {Program} program - program instance
   */
  constructor(synopsis, description, validator, defaultValue, program) {
    super();
    this._type = synopsis.substring(0, 1) === '[' ? Argument.OPTIONAL : Argument.REQUIRED;
    this._variadic = synopsis.substr(-4, 3) === '...';
    this._synopsis = synopsis;
    this._name = this.getCleanNameFromNotation(synopsis);
    this._description = description;
    this._validator = validator ? new Validator(validator, program) : null;
    this._default = defaultValue;
    this.synopsis = this.makeGetterSetter('synopsis');
    this.description = this.makeGetterSetter('description');
    this.default = this.makeGetterSetter('default');
  }

  hasDefault() {
    return this.default() !== undefined;
  }

  isRequired() {
    return this._type === Argument.REQUIRED
  }

  getChoices() {
    return this._validator ? this._validator.getChoices() : [];
  }

  isOptional() {
    return this._type === Argument.OPTIONAL
  }

  isVariadic() {
    return this._variadic === true
  }

  name() {
    return this._name;
  }

  _validate(value) {
    if (!this._validator) {
      return value;
    }
    return this._validator.validate(value);
  }
}

Object.defineProperties(Argument, {
  "OPTIONAL": {
    value: 'optional'
  },
  "REQUIRED": {
    value: 'required'
  }
});

module.exports = Argument;
