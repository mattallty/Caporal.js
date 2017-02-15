"use strict";

const GetterSetter = require('./utils').GetterSetter;
const Validator = require('./validator');

class Option extends GetterSetter {

  /**
   *
   * @param {String} synopsis - Option synopsis
   * @param {String} description - Option description
   * @param {String|RegExp|Function|Number} [validator] - Option validator, used for checking or casting
   * @param {*} [defaultValue] - Default value
   */
  constructor(synopsis, description, validator, defaultValue, program) {
    super();
    this._synopsis = synopsis;
    this._description = description;
    this._validator = validator ? new Validator(validator, program) : null;
    this._default = defaultValue;
    this.synopsis = this.makeGetterSetter('synopsis');
    this.description = this.makeGetterSetter('description');
    this.default = this.makeGetterSetter('default');
    this._analysis = this._analyseSynopsis();
  }

  hasDefault() {
    return this.default() !== undefined;
  }

  isRequired() {
    return this._analysis.type === Option.REQUIRED
  }

  isVariadic() {
    return this._analysis.variadic === true
  }

  getLongName() {
    return this._analysis.long;
  }

  getLongCleanName() {
    return this._analysis.longCleanName;
  }

  getShortName() {
    return this._analysis.short;
  }

  getShortCleanName() {
    return this._analysis.shortCleanName;
  }

  _analyseOption(type, value, acc) {
    acc.type = type;
    acc.booleanFlag = false;
    acc.variadic = value.substr(-4, 3) === '...';
    acc.valueName = this.getCleanNameFromNotation(value);
  }

  _analyseSynopsis() {

    const infos = this._synopsis.split(/[\s\t,]+/).reduce((acc, value) => {
      if (value.substring(0, 2) === '--') {
        acc.long = value;
        acc.longCleanName = value.substring(2);
      } else if (value.substring(0, 1) === '-') {
        acc.short = value;
        acc.shortCleanName = value.substring(1);
      } else if (value.substring(0, 1) === '[') {
        this._analyseOption(Option.OPTIONAL, value, acc);
      } else if (value.substring(0, 1) === '<') {
        this._analyseOption(Option.REQUIRED, value, acc);
      }
      return acc;
    }, {booleanFlag:true});

    return infos;
  }

  _validate(value) {
    return (!this._validator || this._validator.validate(value))
  }
}

Object.defineProperties(Option, {
  "OPTIONAL": {
    value: 'optional'
  },
  "REQUIRED": {
    value: 'required'
  }
});

module.exports = Option;
