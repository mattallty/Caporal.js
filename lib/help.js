"use strict";

const merge = require('lodash.merge');
const Table = require('cli-table3');
const colorize = require('./colorful').colorize;
const c = require('colorette')

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
   * @param {Object} options - Help options
   * @param {Command|null} command - Command concerned or null for program help
   * @private
   */
  _addCustomHelp(help, options, command) {
    options = merge ({
      indent: true,
      name: command ? '' : 'MORE INFO'
    }, options);
    const key = command ? command._name : '_program';
    if ( !this._customHelp[key] ) this._customHelp[key] = [];
    this._customHelp[key].push([help, options]);
  }

  get(command) {

    if (!command && this._program._commands.length === 1) {
      command = this._program._commands[0];
    }

    const description = this._program.description() ? '- ' + this._program.description() : '';
    let help = `
   ${c.cyan(this._program.name() || this._program.bin())} ${c.dim(this._program.version())} ${description}

   ${this._getUsage(command)}`;

    if (!command || command.name() === '' && this._program._commands.length > 1) {
      help += "\n\n   " + this._getCommands();
    }

    help += this._renderHelp('_program');

    help += "\n\n   " + this._getGlobalOptions();

    return help + "\n";
  }

  _getCommands() {
    const commandTable = this._getSimpleTable();
    this._program._commands
      // don't include default command
      .filter((c) => c.name() !== '' && c.visible ())
      .forEach(cmd => {
        commandTable.push(
          [c.magenta(cmd.getSynopsis()), cmd.description()]
        );
      });
    commandTable.push([c.magenta('help <command>'), 'Display help for a specific command']);
    return c.bold('COMMANDS') + "\n\n" + colorize(commandTable.toString());
  }

  _getGlobalOptions() {
    const optionsTable = this._getSimpleTable();
    this._getPredefinedOptions().forEach(o => optionsTable.push(o));
    return c.bold('GLOBAL OPTIONS') + "\n\n" + colorize(optionsTable.toString());
  }

  _getCommandHelp(cmd) {
    const args = cmd.args();
    const options = cmd.options();
    let help = (cmd.name() ? cmd.name() + ' ' : '') + args.map(a => a.synopsis()).join(' ');

    help += this._renderHelp(cmd._name);

    if (args.length) {
      help += `\n\n   ${c.bold('ARGUMENTS')}\n\n`;
      const argsTable = this._getSimpleTable();
      args.forEach(a => {
        const def = a.hasDefault() ? 'default: ' + JSON.stringify(a.default()) : '';
        const req = a.isRequired() ? c.bold('required') : c.gray('optional');
        argsTable.push([a.synopsis(), a.description(), req, c.gray(def)])
      });
      help += argsTable.toString();
    }

    if (options.length) {
      help += `\n\n   ${c.bold('OPTIONS')}\n\n`;
      const optionsTable = this._getSimpleTable();
      options.forEach(a => {
        const def = a.hasDefault() ? 'default: ' + JSON.stringify(a.default()) : '';
        const req = a.isRequired() ? c.bold('required') : c.gray('optional');
        optionsTable.push([a.synopsis(), a.description(), req, c.gray(def)])
      });
      help += optionsTable.toString();
    }

    return help;
  }

  _getUsage(cmd) {
    let help = `${c.bold('USAGE')}\n\n     ${c.italic(this._program.name() || this._program.bin())} `;
    if (cmd) {
      help += colorize(this._getCommandHelp(cmd));
    } else {
      help += colorize('<command> [options]');
    }
    return help;
  }


  _getSimpleTable() {
    return new Table({
      chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
        , 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
        , 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
        , 'right': '', 'right-mid': '', 'middle': ' '
      },
      style: {'padding-left': 5, 'padding-right': 0}
    });
  }

  _getPredefinedOptions() {
    return [['-h, --help', 'Display help'],
      ['-V, --version', 'Display version'],
      ['--no-color', 'Disable colors'],
      ['--quiet', 'Quiet mode - only displays warn and error messages'],
      ['-v, --verbose', 'Verbose mode - will also output debug messages']];
  }

  _renderHelp ( key ) {
    if (!this._customHelp[key]) return '';
    let rendered = '';
    this._customHelp[key].forEach (function(args) {
      const help = args[0];
      const options = args[1];
      if (options.name) {
        rendered += "\n\n   " + c.bold(options.name);
      }
      const parsedHelp = options.indent ? "     " + help.split ( '\n' ).join ( '\n     ' ) : help;
      rendered += "\n\n" + parsedHelp;
    });
    return rendered;
  }

}


module.exports = Help;
