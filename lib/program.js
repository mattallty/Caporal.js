"use strict";

const GetterSetter = require('./utils').GetterSetter;
const Command = require('./command');
const parseArgs = require('micromist');
const Help = require('./help');
const path = require('path');
const Autocomplete = require('./autocomplete');
const createLogger = require('./logger').createLogger;
const tabtabComplete  = require('tabtab/src/complete');
const WrongNumberOfArgumentError = require('./error/wrong-num-of-arg');
const kebabCase = require('lodash.kebabcase');

class Program extends GetterSetter {

  constructor() {
    super();
    this._commands = [];
    this._helper = new Help(this);
    this.version = this.makeGetterSetter('version');
    this.name = this.makeGetterSetter('name');
    this.description = this.makeGetterSetter('description');
    this.logger = this.makeGetterSetter('logger');
    this.bin = this.makeGetterSetter('bin');
    this._bin = path.basename(process.argv[1] || 'caporal');
    this._autocomplete = new Autocomplete(this);
    this._supportedShell = ['bash', 'zsh', 'fish'];
    this.logger(createLogger());
    this._defaultCommand = null;
  }

  /**
   * @private
   */
  _help(cmdStr) {
    const cmd = this._commands.filter(c => (c.name() === cmdStr || c.getAlias() === cmdStr))[0];
    const help = this._helper.get(cmd);
    console.log(help);
    return help;
  }

  /**
   * Add a global help for your program
   *
   * @param {String} help - Help string
   * @returns {Program}
   */
  help(help, options) {
    this._helper._addCustomHelp(help, options);
    return this;
  }

  /**
   * @private
   */
  getCommands() {
    return this._commands;
  }

  /**
   * Reset all commands
   *
   * @private
   * @returns {Program}
   */
  reset() {
    this._commands = [];
    this._defaultCommand = null;
    return this;
  }

  /**
   *
   * @param synospis
   * @param description
   * @returns {Command}
   */
  command(synospis, description) {
    const cmd = new Command(synospis, description, this);
    this._commands.push(cmd);
    return cmd;
  }

  /**
   * @param {Error} errObj - Error object
   * @private
   */
  fatalError(errObj) {
    this.logger().error("\n" + errObj.message);
    process.exit(2);
  }

  /**
   * Find the command to run, based on args, performs checks, then run it
   *
   * @param {Array} args - Command arguments
   * @param {Object} options - Options passed
   * @returns {*}
   * @private
   */
  _run(args, options) {

    if (args[0] === 'help') {
      this._help(args.slice(1).join(' '));
      return process.exit(0);
    }

    let argsCopy = args.slice();
    const commandArr = [];
    /**
     * @type {Command}
     */
    let cmd;

    while(!cmd && argsCopy.length) {
      commandArr.push(argsCopy.shift());
      const cmdStr = commandArr.join(' ');
      cmd = this._commands.filter(c => (c.name() === cmdStr || c.getAlias() === cmdStr))[0];
    }

    if (options.V || options.version) {
      this.logger().info(this.version());
      return process.exit(0);
    }

    if(!cmd) {
      let _filter = this._commands.filter(c => c._default === true);
      if(_filter.length > 0) {
        cmd = _filter[0];
        argsCopy = args.slice();
      }
    }

    if (!cmd && this._getDefaultCommand()) {
      cmd = this._getDefaultCommand();
      argsCopy = args.slice();
    }

    if (!cmd) {
      this._help(args.join(' '));
      return process.exit(1);
    }

    if (options.help || options.h) {
      this._help(args.join(' '));
      return process.exit(0);
    }

    if (process.env.CAPORAL_LOGGER_LEVEL !== undefined
      && Object.keys(this.logger().levels).indexOf(process.env.CAPORAL_LOGGER_LEVEL) > -1) {
      this._changeLogLevel(process.env.CAPORAL_LOGGER_LEVEL);
    }

    // If quiet, only output warning & errors
    if (options.quiet || options.silent) {
      this._changeLogLevel('warn');
    // verbose mode
    } else if (options.v || options.verbose) {
      this._changeLogLevel('debug');
    }

    let validated;

    try {
      validated = cmd._validateCall(argsCopy, options);
    } catch(err) {
      return this.fatalError(err);
    }

    return cmd._run(validated.args, validated.options);
  }

  /**
   *
   * @private
   */
  _changeLogLevel(level) {
    const logger = this.logger();
    Object.keys(logger.transports).forEach(t => logger.transports[t].level = level)
  }

  /**
   * Sets a unique action for the program
   *
   * @param {Function} action - Action to run
   */
  action(action) {
    this._getDefaultCommand(true).action(action);
    return this;
  }

  /**
   * Set an option on the default command
   *
   * @param {String} synopsis - Option synopsis like '-f, --force', or '-f, --file <file>'
   * @param {String} description - Option description
   * @param {String|RegExp|Function|Number|Array} [validator] - Option validator, used for checking or casting
   * @param {*} [defaultValue] - Default value
   * @param {Boolean} [required] - Is the option itself required
   * @returns {Program}
   */
  option(synopsis, description, validator, defaultValue, required) {
    const cmd = this._getDefaultCommand(true);
    let args = Array.prototype.slice.call(arguments);
    cmd.option.apply(cmd, args);
    return this;
  }

  /**
   * Add an argument to the default command
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
    const cmd = this._getDefaultCommand(true);
    let args = Array.prototype.slice.call(arguments);
    cmd.argument.apply(cmd, args);
    return cmd;
  }

  /**
   *
   * @returns {Command}
   * @private
   */
  _getDefaultCommand(create) {
    if (!this._defaultCommand && create) {
      this._defaultCommand = this.command('_default', 'Default command');
    }
    return this._defaultCommand;
  }

  /**
   * @private
   * @param args
   * @param argv
   * @returns {*}
   */
  _handleCompletionCommand(args, argv) {
    if(argv[1] === '--') {
      return this._autocomplete.listen({"_" : args._});
    }
    const complete = new tabtabComplete({name: this.bin()});

    if (typeof argv[1] !== "string" || this._supportedShell.indexOf(argv[1]) === -1) {
      this.fatalError(new WrongNumberOfArgumentError(`A valid shell must be passed (${this._supportedShell.join('/')})`, {}, this));
    } else {
      this.logger().info(complete.script(this.bin(), this.bin(), argv[1].toLowerCase()));
    }
  }

  /**
   * Parse command line arguments.
   * @param {Array} [argv] argv
   * @public
   */
  parse(argv) {
    const argvSlice = argv.slice(2);
    let cmd = this._commands.filter(c => (c.name() === argvSlice[0] || c.getAlias() === argvSlice[0]))[0];
    if (!cmd)
      cmd = this._getDefaultCommand(false);
    const args = parseArgs(argv, cmd ? cmd.parseArgsOpts : {});
    let options = Object.assign({}, args);
    delete options._;

    if (args._[0] === 'completion') {
      return this._handleCompletionCommand(args, argvSlice);
    }

    return this._run(args._, options);
  }

  /**
   * Execute input command with given arguments & options
   * @param args
   * @param options
   * @public
   */
  exec(args, options) {
    const kebabOptions = Object.keys(options).reduce(function(result, key) {
      result[kebabCase(key)] = options[key];
      return result;
    }, {});
    return this._run(args, kebabOptions);
  }
}

const constants = require('./constants');

Object.keys(constants).map(c => Program.prototype[c] = constants[c]);

module.exports = Program;
