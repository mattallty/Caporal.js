"use strict";

const Table = require('cli-table2');
const chalk = require('chalk');
const colorize = require('./colorful').colorize;

/**
 * @private
 */
class Help {

  constructor(program) {
    this._program = program;
    this._customHelp = {};
  }

  /**
   * Add a custom help for the whole program or a specific command
   *
   * @param {String} help - Help text
   * @param {Command|null} command - Command concerned or null for program help
   * @private
   */
  _addCustomHelp(help, command) {
    this._customHelp[command ? command._name : '_program'] = help;
  }

  get(command) {

    if (!command && this._program._commands.length === 1) {
      command = this._program._commands[0];
    }

    const description = this._program.description() ? '- ' + this._program.description() : '';
    let help = `
   ${chalk.cyan(this._program.name() || this._program.bin())} ${chalk.dim(this._program.version())} ${description}
     
   ${this._getUsage(command)}`;

    if (!command && this._program._commands.length > 1) {
      help += "\n\n   " + this._getCommands();
    }

    help += "\n\n   " + this._getGlobalOptions();

    if (this._customHelp['_program']) {
      help += "\n\n   " + chalk.bold('MORE INFO') + "\n\n     " + this._customHelp['_program'];
    }

    return help + "\n";
  }

  _getCommands() {
    const commandTable = this._getSimpleTable();
    this._program._commands.forEach(cmd => {
      commandTable.push(
        [chalk.magenta(cmd.getSynopsis()), cmd.description()]
      );
    });
    commandTable.push([chalk.magenta('help <command>'), 'Display help for a specific command']);
    return chalk.bold('COMMANDS') + "\n\n" + colorize(commandTable.toString());
  }

  _getGlobalOptions() {
    const optionsTable = this._getSimpleTable();
    this._getPredefinedOptions().forEach(o => optionsTable.push(o));
    return chalk.bold('GLOBAL OPTIONS') + "\n\n" + colorize(optionsTable.toString());
  }

  _getCommandHelp(cmd) {
    const args = cmd.args();
    const options = cmd.options();
    let help = (cmd.name() ? cmd.name() + ' ' : '') + args.map(a => a.synopsis()).join(' ');

    if (this._customHelp[cmd._name]) {
      help += `\n\n     ${this._customHelp[cmd._name]}`;
    }

    if (args.length) {
      help += `\n\n   ${chalk.bold('ARGUMENTS')}\n\n`;
      const argsTable = this._getSimpleTable();
      args.forEach(a => {
        const def = a.hasDefault() ? 'default: ' + JSON.stringify(a.default()) : '';
        const req = a.isRequired() ? chalk.bold('required') : chalk.grey('optional');
        argsTable.push([a.synopsis(), a.description(), req, chalk.grey(def)])
      });
      help += argsTable.toString();
    }

    if (options.length) {
      help += `\n\n   ${chalk.bold('OPTIONS')}\n\n`;
      const optionsTable = this._getSimpleTable();
      options.forEach(a => {
        const def = a.hasDefault() ? 'default: ' + JSON.stringify(a.default()) : '';
        const req = a.isRequired() ? chalk.bold('required') : chalk.grey('optional');
        optionsTable.push([a.synopsis(), a.description(), req, chalk.grey(def)])
      });
      help += optionsTable.toString();
    }

    return help;
  }

  _getUsage(cmd) {
    let help = `${chalk.bold('USAGE')}\n\n     ${chalk.italic(this._program.bin())} `;
    if (cmd) {
      help += colorize(this._getCommandHelp(cmd));
    } else {
      help += colorize('<command> [options]');
    }
    return help;
  }



  _getSimpleTable() {
    return new Table({
      chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
        , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
        , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
        , 'right': '' , 'right-mid': '' , 'middle': ' ' },
      style: { 'padding-left': 5, 'padding-right': 0 }
    });
  }

  _getPredefinedOptions() {
    return [['-h, --help', 'Display help'],
      ['-V, --version', 'Display version'],
      ['--no-color', 'Disable colors'],
      ['--quiet', 'Quiet mode - only displays warn and error messages'],
      ['-v, --verbose', 'Verbose mode - will also output debug messages']];
  }

}


module.exports = Help;
