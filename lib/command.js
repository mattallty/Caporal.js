"use strict";

const GetterSetter = require('./utils').GetterSetter;
const Option = require('./option');
const Validator = require('./validator');
const UnknownOptionError = require('./error/unknown-option');
const InvalidOptionValueError = require('./error/invalid-option-value');
const InvalidArgumentValueError = require('./error/invalid-argument-value');
const NoActionError = require('./error/no-action-error');
const WrongNumberOfArgumentError = require('./error/wrong-num-of-arg');

const Argument = {};
Object.defineProperties(Argument, {
  "OPTIONAL": {
    value: 'optional'
  },
  "REQUIRED": {
    value: 'required'
  }
});


class Command extends GetterSetter {

  /**
   *
   * @param {String|null} synopsis Command synospis. Can be null if the command does not take any arguments
   * @param {String} description Command description
   * @param {RegExp[]|Function[]|Number[]} validators - Arguments validators if any
   * @param {Object} [defaults] - Arguments defaults
   * @param {Program} program Program instance
   * @private
   */
  constructor(synopsis, description, validators, defaults, program) {
    super();
    this._synopsis = synopsis;
    this._description = description;
    this._defaults = defaults || {};
    this._validators = validators.map(v => new Validator(v, program));
    this._options = [];
    this._program = program;
    this._logger = this._program.logger();
    this._alias = null;
    this.synopsis = this.makeGetterSetter('synopsis');
    this.description = this.makeGetterSetter('description');
    this._analysis = this._analyseSynopsis(true);
    this._name = this._analysis.command;
    this._args = this._analysis.args;
    this._commandArray = this._analysis.commandArray;
    this._setupLoggerMethods();
  }



  name() {
    return this._name;
  }

  args() {
    return this._args;
  }

  /**
   *
   * @returns {Number}
   * @private
   */
  _requiredArgsCount() {
    return this.args().filter(a => a.type === Argument.REQUIRED).length;
  }

  /**
   *
   * @returns {Number}
   * @private
   */
  _optionalArgsCount() {
    return this.args().filter(a => a.type === Argument.OPTIONAL).length;
  }

  /**
   *
   * @returns {{min: Number, max: *}}
   * @private
   */
  _acceptedArgsRange() {
    const min = this._requiredArgsCount();
    const max = this._hasVariadicArguments() ? Infinity : (this._requiredArgsCount() + this._optionalArgsCount());
    return {min, max};
  }

  /**
   *
   * @param optName
   * @returns {*}
   * @private
   */
  _findOption(optName) {
    return this._options.filter(o => (o.getShortCleanName() === optName ||  o.getLongCleanName() === optName))[0];
  }

  /**
   * @private
   */
  getOptions(type) {
    type = type || 'long';
    return this._options.map(opt => opt[type === 'long' ? 'getLongCleanName' : 'getShortCleanName']());
  }

  /**
   * Allow chaining command() with other .command()
   * @returns {Command}
   */
  command() {
    return this._program.command.apply(this._program, arguments);
  }

  /**
   * @private
   * @returns {boolean}
   */
  _hasVariadicArguments() {
    return this.args().filter(a => a.variadic === true).length > 0;
  }

  /**
   *
   * @param args
   * @param options
   * @returns {*}
   * @private
   */
  _validateCall(args, options) {

    // transfrom args array to object, and set defaults for arguments not passed
    args = this.args().reduce((acc, arg, index) => {
      if (typeof args[index] !== 'undefined') {
        acc[arg.cleanName] = args[index];
      } else if(typeof this._defaults[arg.cleanName] !== 'undefined') {
        acc[arg.cleanName] = this._defaults[arg.cleanName];
      }
      return acc;
    }, {});

    // min & max arguments accepted
    const range = this._acceptedArgsRange();
    const argsCount = Object.keys(args).length;
    if (argsCount < range.min || args.length > range.max) {
      throw new WrongNumberOfArgumentError(
        "Wrong number of argument(s) for command " + (this.name() || '') + `Got ${argsCount} arguments, expected between ${range.min} and ${range.max}`,
        {},
        this._program
      )
    }

    // arguments validation
    args = Object.keys(args).reduce((acc, key, index) => {
      let value = args[key];
      const validator = this._validators[index] || this._validators[index-1] || this._validators[0] || null;
      if (validator) {
        try {
          acc[key] = validator.validate(value);
        } catch(e) {
          throw new InvalidArgumentValueError(key, value, this, this._program);
        }
      }
      return acc;
    }, {});

    // options validation
    options = Object.keys(options).reduce((acc, key) => {

      if (Command.NATIVE_OPTIONS.includes(key)) {
        return acc;
      }

      const value = acc[key];
      const opt = this._findOption(key);

      if (!opt) {
        throw new UnknownOptionError(key, this, this._program);
      }

      try {
        acc[key] = opt._validate(value);
      } catch(e) {
        throw new InvalidOptionValueError(key, value, this, e, this._program);
      }

      return acc;
    }, options);

    // set defaults
    options = this._options.reduce((acc, opt) => {
      if (typeof acc[opt.getLongCleanName()] === 'undefined' &&
        typeof acc[opt.getShortCleanName()] === 'undefined' &&
        opt.hasDefault()) {
        acc[opt.getLongCleanName()] = opt.default();
      }
      return acc;
    }, options);

    // add long notation if exists
    options = Object.keys(options).reduce((acc, key) => {
      if (key.length === 1) {
        const value = acc[key];
        const opt = this._findOption(key);
        if (opt && opt.getLongCleanName()) {
          acc[opt.getLongCleanName()] = value;
        }
      }
      return acc;
    }, options);

    return {args, options};
  }

  /**
   *
   * @param {String} type - Argument type ('required' or 'optional')
   * @param value
   * @param acc
   * @private
   */
  _analyseArgument(type, value, acc) {
    const arg = {};
    arg.type = type;
    arg['name'] = value;
    arg['variadic'] = value.substr(-4, 3) === '...';
    arg['cleanName'] = this.getCleanNameFromNotation(value);
    acc.args.push(arg);
  }

  /**
   *
   * @returns {Object}
   * @private
   */
  _analyseSynopsis() {

    const defaults = {commandArray:[], args:[], command: null};

    if (typeof this._synopsis !== 'string') {
      return defaults;
    }

    const infos = this._synopsis.split(/[\s\t,]+/).reduce((acc, value) => {
      if (value.substring(0, 1) === '[') {
        this._analyseArgument(Argument.OPTIONAL, value, acc);
      } else if (value.substring(0, 1) === '<') {
        this._analyseArgument(Argument.REQUIRED, value, acc);
      } else {
        acc.commandArray.push(value)
      }
      return acc;
    }, defaults);

    if (infos.commandArray.length) {
      infos.command = infos.commandArray.join(' ');
    }

    return infos;
  }

  /**
   * Add an option
   * @param {String} synopsis - Option synopsis like '-f, --force', or '-f, --file <file>'
   * @param {String} description - Option description
   * @param {String|RegExp|Function|Number} [validator] - Option validator, used for checking or casting
   * @param {*} [defaultValue] - Default value
   * @public
   * @returns {Command}
   */
  option(synopsis, description, validator, defaultValue) {
    this._options.push(new Option(synopsis, description, validator, defaultValue, this._program));
    return this;
  }

  /**
   * Set the corresponding action to execute for this command
   *
   * @param {Function} action - Action to execute
   * @returns {Command}
   * @public
   */
  action(action) {
    this._action = action;
    return this;
  }

  /**
   * Run the command's action
   *
   * @param {Object} args - Arguments
   * @param {Object} options - Options
   * @returns {*}
   * @private
   */
  _run(args, options) {
    /*
    const reformatedArgs = this.args().reduce((acc, arg) => {
      if (arg.variadic) {
        acc.push(args.slice());
      } else {
        acc.push(args.shift());
      }
      return acc;
    }, []);*/

    if (!this._action) {
      return this._program.fatalError(new NoActionError(
        "Caporal Setup Error: You don't have defined an .action() for you program/command.",
        {},
        this._program
      ));
    }

    return this._action.apply(this, [args, options]);
  }

  /**
   *
   * @private
   */
  _setupLoggerMethods() {
    ['error', 'warn', 'info', 'log', 'debug'].forEach(function(lev) {
      const overrideLevel = (lev === 'log') ? 'info' : lev;
      this[lev] = this._logger[overrideLevel] ? this._logger[overrideLevel].bind(this._logger) : function(){}
    }, this);
  }

  /**
   * Set an alias for this command. Only one alias can be set up for a command
   *
   * @param {String} alias - Alias
   * @returns {Command}
   * @public
   */
  alias(alias) {
    this._alias = alias;
    return this;
  }

}

Object.defineProperties(Command, {
  "NATIVE_OPTIONS": {
    value: ['h', 'help', 'V', 'version', 'no-color', 'quiet', 'v', 'verbose']
  }
});

module.exports = Command;
