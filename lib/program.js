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
      help += colorize(cmd.synopsis())
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
            [chalk.magenta(cmd.synopsis()), cmd.description()]
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
   * @param {...RegExp|Function|Number} validator - One or more validators for command arguments
   * @param {Object} [defaults] - Arguments defaults
   * @returns {Command}
   */
  command(synospis, description, validator, defaults) {
    const validators  = Array.prototype.slice.call(arguments, 2);
    const cmd = new Command(synospis, description, validators, defaults, this);
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
      [cmd] = this._commands.filter(c => c.name() === commandArr.join(' '));
    }

    if (options.V || options.version) {
      return this.logger().info(this.version());
    }

    if (!cmd) {
      cmd = this._getDefaultCommand();
    }

    if (!cmd || options.help || options.h) {
      return this.help();
    }

    // If quiet, only output warning & errors
    if (options.quiet) {
      const logger = this.logger();
      logger && logger.transports && logger.transports.caporal && (logger.transports.caporal.level = 'warn');

    // verbose mode
    } else if (options.v || options.verbose) {
      const logger = this.logger();
      logger && logger.transports && logger.transports.caporal && (logger.transports.caporal.level = 'debug');
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
   * Sets a unique action for the program
   */
  action(action) {
    this._getDefaultCommand().action(action);
    return this;
  }

  /**
   * Set an option on the default command
   * @returns {*}
   */
  option() {
    const cmd = this._getDefaultCommand();
    let args = Array.prototype.slice.call(arguments);
    args = args.slice(0, 4)
    while (args.length < 4) {
      args.push(null);
    }
    args.push(this._program);
    cmd.option.apply(cmd, args);
    return this;
  }

  /**
   *
   * @returns {Command}
   * @private
   */
  _getDefaultCommand() {
    if (!this._defaultCommand) {
      this._defaultCommand = this.command('*');
    }
    return this._defaultCommand;
  }

  /**
   * Parse command line arguments.
   * @param {Array} [argv] argv, default to process.argv
   * @public
   */
  parse(argv) {
    argv = argv || process.argv;
    const args = parseArgs(argv.slice(2));
    let options = Object.assign({}, args);
    delete options._;
    this._run(args._, options)
  }

}

const constants = require('./constants');

Object.keys(constants).map(c => Program.prototype[c] = constants[c]);

module.exports = Program;
