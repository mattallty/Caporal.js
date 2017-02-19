"use strict";

const GetterSetter = require('./utils').GetterSetter;
const Command = require('./command');
const parseArgs = require('minimist');
const path = require('path');
const createLogger = require('./logger').createLogger;
const colorize = require('./colorful').colorize;
const Table = require('cli-table2');
const chalk = require('chalk');

class Program extends GetterSetter {

  constructor() {
    super();
    this._commands = [];
    this.version = this.makeGetterSetter('version');
    this.name = this.makeGetterSetter('name');
    this.description = this.makeGetterSetter('description');
    this.logger = this.makeGetterSetter('logger');
    this.bin = this.makeGetterSetter('bin');
    this._bin = path.basename(process.argv[1]);
    this.logger(createLogger());
    this._defaultCommand = null;
  }

  help() {
    let help = `
   ${chalk.cyan(this.name() || this.bin())} ${chalk.dim(this.version())} - ${this.description()}
   
   ${chalk.bold('USAGE')}\n\n     ${chalk.italic(this.bin())} `;

    if (this._commands.length === 1) {
      const cmd = this._commands[0];
      help += colorize(cmd.name())
    } else {
      help += colorize('<command> [options]');

      const commandTable = new Table({
        chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
          , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
          , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
          , 'right': '' , 'right-mid': '' , 'middle': ' ' },
        style: { 'padding-left': 5, 'padding-right': 0 }
      });

      commandTable.push([chalk.magenta('help <command>'), 'Display help for a specific command']);

      this._commands.forEach(cmd => {
        commandTable.push(
            [chalk.magenta(cmd.name()), cmd.description()]
        );
      });

      help += "\n\n   " + chalk.bold('COMMANDS') + "\n\n" + colorize(commandTable.toString());
    }


    const optionsTable = new Table({
      chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
        , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
        , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
        , 'right': '' , 'right-mid': '' , 'middle': ' ' },
      style: { 'padding-left': 5, 'padding-right': 0 }
    });

    optionsTable.push(
        ['-h, --help', 'Display help'],
        ['-V, --version', 'Display version'],
        ['--no-color', 'Disable colors'],
        ['--quiet', 'Quiet mode'],
        ['-v, --verbose', 'Will output console.debug() messages']
    );

    help += "\n\n   " + chalk.bold('OPTIONS') + "\n\n" + colorize(optionsTable.toString());

    return this.logger().info(help + "\n\n");
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
    this.logger().error(errObj.message);
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

    let argsCopy = args.slice();
    const commandArr = [];
    /**
     * @type {Command}
     */
    let cmd;

    while(!cmd && argsCopy.length) {
      commandArr.push(argsCopy.shift());
      const cmdStr = commandArr.join(' ');
      [cmd] = this._commands.filter(c => (c.name() === cmdStr || c.getAlias() === cmdStr));
    }

    if (options.V || options.version) {
      return this.logger().info(this.version());
    }

    if (!cmd && this._getDefaultCommand()) {
      cmd = this._getDefaultCommand();
      argsCopy = args.slice();
    }

    if (!cmd || options.help || options.h) {
      return this.help();
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
   * @param {String|RegExp|Function|Number} [validator] - Option validator, used for checking or casting
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
   * @param {String|RegExp|Function|Number} [validator] - Option validator, used for checking or casting
   * @param {*} [defaultValue] - Default value
   * @public
   * @returns {Program}
   */
  argument(synopsis, description, validator, defaultValue) {
    const cmd = this._getDefaultCommand(true);
    let args = Array.prototype.slice.call(arguments);
    cmd.argument.apply(cmd, args);
    return this;
  }

  /**
   *
   * @returns {Command}
   * @private
   */
  _getDefaultCommand(create) {
    if (!this._defaultCommand && create) {
      this._defaultCommand = this.command('_default');
    }
    return this._defaultCommand;
  }

  /**
   * Parse command line arguments.
   * @param {Array} [argv] argv, default to process.argv
   * @public
   */
  parse(argv) {
    const args = parseArgs(argv.slice(2));
    let options = Object.assign({}, args);
    delete options._;
    this._run(args._, options)
  }

}

const constants = require('./constants');

Object.keys(constants).map(c => Program.prototype[c] = constants[c]);

module.exports = Program;
