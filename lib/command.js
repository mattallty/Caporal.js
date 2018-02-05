"use strict";

const GetterSetter = require('./utils').GetterSetter;
const Option = require('./option');
const Argument = require('./argument');
const UnknownOptionError = require('./error/unknown-option');
const InvalidOptionValueError = require('./error/invalid-option-value');
const InvalidArgumentValueError = require('./error/invalid-argument-value');
const MissingOptionError = require('./error/missing-option');
const NoActionError = require('./error/no-action-error');
const WrongNumberOfArgumentError = require('./error/wrong-num-of-arg');
const Promise = require('bluebird');

/**
 * Command class
 */
class Command extends GetterSetter {

  /**
   *
   * @param {String|null} name - Command name.
   * @param {String} description - Command description
   * @param {Program} program Program instance
   */
  constructor(name, description, program) {
    super();
    this._name = name;
    this._description = description;
    this._options = [];
    this._program = program;
    this._logger = this._program.logger();
    this._alias = null;
    this.description = this.makeGetterSetter('description');
    this._args = [];
    this._default = false;
    this._lastAddedArgOrOpt = null;
    this._setupLoggerMethods();
  }


  /**
   * Add help for the current command
   *
   * @param {String} help - Help string
   * @returns {Command}
   */
  help(help, options) {
    this._program._helper._addCustomHelp(help, options, this);
    return this;
  }

  /**
   * @private
   * @returns {Command.command|null|Program.command|string|*}
   */
  name() {
    return this._name === '_default' ? '' : this._name;
  }

  /**
   * @private
   * @returns {Argument[]}
   */
  args(index) {
    return typeof index !== 'undefined' ? this._args[index] : this._args;
  }

  /**
   * @private
   * @returns {Option[]}
   */
  options() {
    return this._options;
  }

  /**
   * @private
   */
  getSynopsis() {
    return this.name() + ' ' + (this.args().map(a => a.synopsis()).join(' '));
  }

  /**
   * @private
   * @returns {null|String}
   */
  getAlias() {
    return this._alias;
  }

  /**
   * Add command argument
   *
   * @param {String} synopsis - Argument synopsis like `<my-argument>` or `[my-argument]`.
   * Angled brackets (e.g. `<item>`) indicate required input. Square brackets (e.g. `[env]`) indicate optional input.
   * @param {String} description - Option description
   * @param {String|RegExp|Function|Number|Array} [validator] - Option validator, used for checking or casting
   * @param {*} [defaultValue] - Default value
   * @public
   * @returns {Command}
   */
  argument(synopsis, description, validator, defaultValue) {
    const arg = new Argument(synopsis, description, validator, defaultValue, this._program);
    this._lastAddedArgOrOpt = arg;
    this._args.push(arg);
    return this;
  }

  /**
   *
   * @returns {Number}
   * @private
   */
  _requiredArgsCount() {
    return this.args().filter(a => a.isRequired()).length;
  }

  /**
   *
   * @returns {Number}
   * @private
   */
  _optionalArgsCount() {
    return this.args().filter(a => a.isOptional()).length;
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
   * @returns {Option|undefined}
   * @private
   */
  _findOption(optName) {
    return this._options.find(o => (o.getShortCleanName() === optName ||  o.getLongCleanName() === optName));
  }


  /**
   *
   * @param {String} name - Argument name
   * @returns {Argument|undefined}
   * @private
   */
  _findArgument(name) {
    return this._args.find(a => a.name() === name);
  }

  /**
   * @private
   */
  _getLongOptions() {
    return this._options.map(opt => opt.getLongCleanName()).filter(o => typeof o !== 'undefined');
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
    return this.args().find(a => a.isVariadic()) !== undefined;
  }

  /**
   *
   * @param {Array} args
   * @return {Object}
   * @private
   */
  _argsArrayToObject(args) {
    return this.args().reduce((acc, arg, index) => {
      if (typeof args[index] !== 'undefined') {
        acc[arg.name()] = args[index];
      } else if(arg.hasDefault()) {
        acc[arg.name()] = arg.default();
      }
      return acc;
    }, {});

  }

  /**
   *
   * @param {Array} args
   * @returns {Array}
   * @private
   */
  _splitArgs(args) {
    return this.args().reduce((acc, arg) => {
      if (arg.isVariadic()) {
        acc.push(args.slice());
      } else {
        acc.push(args.shift());
      }
      return acc;
    }, []);
  }

  /**
   *
   * @param {Array} argsArr
   * @private
   */
  _checkArgsRange(argsArr) {
    const range = this._acceptedArgsRange();
    const argsCount = argsArr.length;
    if (argsCount < range.min || argsCount> range.max) {
      const expArgsStr = range.min === range.max ? `exactly ${range.min}.` : `between ${range.min} and ${range.max}.`;
      throw new WrongNumberOfArgumentError(
        "Wrong number of argument(s)" + (this.name() ? ' for command ' + this.name() : '') +
        `. Got ${argsCount}, expected ` + expArgsStr,
        {},
        this._program
      )
    }
  }

  /**
   *
   * @param args
   * @returns {*}
   * @private
   */
  _validateArgs(args) {
    return Object.keys(args).reduce((acc, key) => {
      const arg = this._findArgument(key);
      const value = args[key];
      try {
        acc[key] = arg._validate(value);
      } catch(e) {
        throw new InvalidArgumentValueError(key, value, this, e, this._program);
      }
      return acc;
    }, {});
  }

  /**
   *
   * @param options
   * @returns {*}
   * @private
   */
  _checkRequiredOptions(options) {
    return this._options.reduce((acc, opt) => {
      if (typeof acc[opt.getLongCleanName()] === 'undefined' && typeof acc[opt.getShortCleanName()] === 'undefined') {
        if (opt.hasDefault()) {
          acc[opt.getLongCleanName()] = opt.default();
        } else if (opt.isRequired()) {
          throw new MissingOptionError(opt.getLongOrShortCleanName(), this, this._program);
        }
      }
      return acc;
    }, options);
  }

  /**
   *
   * @param options
   * @returns {*}
   * @private
   */
  _validateOptions(options) {
    return Object.keys(options).reduce((acc, key) => {
      if (Command.NATIVE_OPTIONS.indexOf(key) !== -1) {
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
  }

  /**
   *
   * @param options
   * @returns {*}
   * @private
   */
  _addLongNotationToOptions(options) {
    return Object.keys(options).reduce((acc, key) => {
      if (key.length === 1) {
        const value = acc[key];
        const opt = this._findOption(key);
        if (opt && opt.getLongCleanName()) {
          acc[opt.getLongCleanName()] = value;
        }
      }
      return acc;
    }, options);
  }

  /**
   *
   * @param options
   * @returns {*}
   * @private
   */
  _camelCaseOptions(options) {
    return this._options.reduce((acc, opt) => {
      if (typeof options[opt.getLongCleanName()] !== 'undefined') {
        acc[opt.name()] = options[opt.getLongCleanName()];
      } else {
        acc[opt.name()] = options[opt.getShortCleanName()];
      }
      return acc;
    }, {});
  }

  /**
   *
   * @param args
   * @param options
   * @returns {*}
   * @private
   */
  _validateCall(args, options) {
    // check min & max arguments accepted
    this._checkArgsRange(args);
    // split args
    args = this._splitArgs(args);
    // transfrom args array to object, and set defaults for arguments not passed
    args = this._argsArrayToObject(args);
    // arguments validation
    args = this._validateArgs(args);
    // check required options
    options = this._checkRequiredOptions(options);
    // options validation
    options = this._validateOptions(options);
    // add long notation if exists
    options = this._addLongNotationToOptions(options);
    // camelcase options
    options = this._camelCaseOptions(options);
    return {args, options};
  }


  /**
   * Add an option
   *
   * @param {String} synopsis - Option synopsis like '-f, --force', or '-f, --file <file>', or '--with-openssl [path]'
   * @param {String} description - Option description
   * @param {String|RegExp|Function|Number|Array} [validator] - Option validator, used for checking or casting
   * @param {*} [defaultValue] - Default value
   * @param {Boolean} [required] - Is the option itself required
   * @public
   * @returns {Command}
   */
  option(synopsis, description, validator, defaultValue, required) {
    const opt = new Option(synopsis, description, validator, defaultValue, required, this._program);
    this._lastAddedArgOrOpt = opt;
    this._options.push(opt);
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
   * @private
   */
  _run(args, options) {
    if (!this._action) {
      return this._program.fatalError(new NoActionError(
        "Caporal Setup Error: You have not defined an action for you program/command. Use .action()",
        {},
        this._program
      ));
    }
    const actionResults = this._action.apply(this, [args, options, this._logger]);
    const response = Promise.resolve(actionResults);
    return response
      .catch(err => {
        err = err instanceof Error ? err : new Error(err);
        return this._program.fatalError(err);
      })
  }

  /**
   *
   * @private
   */
  _setupLoggerMethods() {
    ['error', 'warn', 'info', 'log', 'debug'].forEach(function(lev) {
      const overrideLevel = (lev === 'log') ? 'info' : lev;
      this[lev] = this._logger[overrideLevel].bind(this._logger);
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

  /**
   * Autocomplete callabck
   */
  complete(callback) {
    this._program._autocomplete.registerCompletion(this._lastAddedArgOrOpt, callback);
    return this;
  }

  /**
   * Sets default Command if none is selected
   * @returns {Command}
   */
  default() {
    this._default = true;
    return this;
  }
}

Object.defineProperties(Command, {
  "NATIVE_OPTIONS": {
    value: ['h', 'help', 'V', 'version', 'color', 'quiet', 'silent', 'v', 'verbose']
  }
});

module.exports = Command;
