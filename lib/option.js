"use strict";

const GetterSetter = require('./utils').GetterSetter;
const Validator = require('./validator');
const OptionSyntaxError = require('./error/option-syntax-error');

class Option extends GetterSetter {

  /**
   *
   * @param {String} synopsis - Option synopsis
   * @param {String} description - Option description
   * @param {String|RegExp|Function|Number|Array} [validator] - Option validator, used for checking or casting
   * @param {*} [defaultValue] - Default value
   * @param {Boolean} [required] - Is the option itself required
   * @param {Program} [program] - Program instance
   */
  constructor(synopsis, description, validator, defaultValue, required, program) {
    super();
    this._synopsis = synopsis;
    this._description = description;
    this._program = program;
    this._validator = validator ? new Validator(validator, program) : null;
    this._default = defaultValue;
    this.synopsis = this.makeGetterSetter('synopsis');
    this.description = this.makeGetterSetter('description');
    this.default = this.makeGetterSetter('default');
    const analysis = this._analyseSynopsis();
    this._valueType = analysis.valueType;
    this._required = required || false;
    this._varadic = analysis.variadic;
    this._allCleanNames = analysis.allCleanNames;
    this._longCleanName = analysis.longCleanName;
    this._shortCleanName = analysis.shortCleanName;
    this._short = analysis.short;
    this._long = analysis.long;
    this._booleanFlag = analysis.booleanFlag;
    this._name = this.getCleanNameFromNotation(this._longCleanName || this._shortCleanName);
    if (this.isImplicitBoolean())
      this._default = false;
  }

  hasDefault() {
    return typeof this._default !== 'undefined' && this._default !== null;
  }

  getChoices() {
    return this._validator ? this._validator.getChoices() : [];
  }

  isImplicitBoolean() {
    return this._valueType === undefined;
  }

  isRequired() {
    return this._required;
  }

  getLongOrShortCleanName() {
    return this.getLongCleanName() || this.getShortCleanName();
  }

  getLongOrShortName() {
    return this._long || this._short;
  }

  getShortName() {
    return this._short;
  }

  getLongName() {
    return this._long;
  }


  getLongCleanName() {
    return this._longCleanName;
  }

  getShortCleanName() {
    return this._shortCleanName;
  }

  name() {
    return this._name;
  }

  _analyseOption(type, value, acc) {
    acc.valueType = type;
    acc.variadic = value.substr(-4, 3) === '...';
  }

  /**
   *
   * @returns {*}
   * @private
   */
  _analyseSynopsis() {

    const infos = this._synopsis.split(/[\s\t,]+/).reduce((acc, value) => {
      if (value.substring(0, 2) === '--') {
        acc.long = value;
        acc.longCleanName = value.substring(2);
        acc.allCleanNames.push(value.substring(2));
      } else if (value.substring(0, 1) === '-') {
        acc.short = value;
        acc.shortCleanName = value.substring(1);
        acc.allCleanNames.push(value.substring(1));
      } else if (value.substring(0, 1) === '[') {
        this._analyseOption(Option.OPTIONAL_VALUE, value, acc);
      } else if (value.substring(0, 1) === '<') {
        this._analyseOption(Option.REQUIRED_VALUE, value, acc);
      } else {
        this._program.fatalError(new OptionSyntaxError(this._synopsis, this._program));
      }
      return acc;
    }, { allCleanNames: [] });

    return infos;
  }

  _validate(value) {
    if (!this._validator) {
      return value;
    }
    return this._validator.validate(value);
  }
}

Object.defineProperties(Option, {
  "OPTIONAL_VALUE": {
    value: 'optional'
  },
  "REQUIRED_VALUE": {
    value: 'required'
  }
});

module.exports = Option;
