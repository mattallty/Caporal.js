"use strict";

const tabtab = require('tabtab');
const parseArgs = require('micromist');
const Promise = require('bluebird');
const Option = require('./option');

class Autocomplete {

  constructor(program) {
    this._program = program;
    this._tab = tabtab({
      name: this._program.bin(),
      cache: false
    });
    this._completions = {};
  }

  listen(options) {
    this._tab.on(this._program.bin(), this._complete.bind(this));
    this._tab.handle(options);
  }

  /**
   * Register a completion handler
   *
   * @param {Argument|Option} arg_or_opt argument or option to complete
   * @param {Function} completer
   */
  registerCompletion(arg_or_opt, completer) {
    this._completions[arg_or_opt.name()] = completer;
  }

  /**
   * @param {Argument|Option} arg_or_opt argument or option to complete
   */
  getCompletion(arg_or_opt) {
    return this._completions[arg_or_opt.name()];
  }

  _findCommand(cmdStr) {

    let cmd;
    const commandArr = [];
    const args = cmdStr.split(' ').filter(s => s != '');
    const commands = this._program.getCommands();

    while (!cmd && args.length) {
      commandArr.push(args.shift());
      const cmdStr = commandArr.join(' ');
      cmd = commands.filter(c => {
        return (c.name() === cmdStr || c.getAlias() === cmdStr)
      })[0];
    }

    if (!cmd && this._program._getDefaultCommand()) {
      cmd = this._program._getDefaultCommand();
    }
    return cmd;
  }

  _countArgs(currentCommand, args) {
    let realArgsCmdFound = false;
    return args._.reduce((acc, value, index, arr) => {
      const possibleCmd = arr.slice(0, index + 1).join(' ');
      if (currentCommand && (currentCommand.name() === possibleCmd || currentCommand.alias() === possibleCmd)) {
        realArgsCmdFound = true;
      } else if (realArgsCmdFound && value.trim()) {
        acc++;
      }
      return acc;
    }, 0);
  }

  _getOptionsAlreadyUsed(args) {
    return args.filter(o => o.startsWith('-') || o.startsWith('--'));
  }

  _lastPartialIsKnownOption(currentCommand, lastPartialIsOption, lastPartial) {
    return lastPartialIsOption &&
      currentCommand &&
      currentCommand.options().some(o => (lastPartial === o.getShortName() || lastPartial === o.getLongName()));
  }

  _lastPartialIsKnownArg(currentCommand, lastPartialIsArg, lastPartial) {
    return lastPartialIsArg &&
      currentCommand &&
      currentCommand.args().some(
        a => (a.getChoices().length && a.getChoices().includes(lastPartial))
      );
  }


  _getCurrentOption(currentCommand, lastPartialIsKnownOption, lastPartial) {
    return lastPartialIsKnownOption ?
      currentCommand.options()
        .filter(o => (lastPartial === o.getShortName() || lastPartial === o.getLongName()))[0]
      : null;
  }

  _getPossibleArgumentValues(currentCommand, lastPartialIsOption, argsCount, lastPartial) {
    if (!currentCommand ||
      lastPartialIsOption) {
      return Promise.resolve([]);
    }

    const arg = currentCommand.args(lastPartial ? argsCount - 1 : argsCount);
    if (!arg) {
      return Promise.resolve([]);
    }

    // Choices
    if (arg.getChoices().length) {
      return Promise.resolve(
        arg.getChoices()
          .map(choice => choice + ':Value for argument ' + arg.synopsis())
          .filter(choice => !lastPartial || choice.startsWith(lastPartial))
      );
    }

    // Promise completion
    const completion = this.getCompletion(arg);

    if (typeof completion === 'function') {
      return this._hanldleCompletionHandler(completion, arg);
    }

    return Promise.resolve([]);
  }

  _hanldleCompletionHandler(handler, argOrOpt) {
    const result = handler();
    const type = argOrOpt instanceof Option ? 'option' : 'argument';
    return Promise.resolve(result).then(res => {
      if (!Array.isArray(res)) {
        res = [res];
      }
      return res.map(r => r + `:Value for ${type} ${argOrOpt.synopsis()}`)
    });
  }

  _getPossibleOptionNames(currentCommand, optionsAlreadyUsed, lastPartial, lastPartialIsOption) {
    const optNames = currentCommand ?
      currentCommand.options().map(o => {
        if ((o.getShortName() && o.getShortName() != lastPartial && o.getShortName().startsWith(lastPartial)) ||
          (o.getLongName() && o.getLongName() != lastPartial && o.getLongName().startsWith(lastPartial))) {
          return o.getLongOrShortName() + ':' + o.description();
        } else if (!lastPartialIsOption && optionsAlreadyUsed.indexOf(o.getShortName()) === -1 &&
          optionsAlreadyUsed.indexOf(o.getLongName()) === -1) {
          return o.getLongOrShortName() + ':' + o.description();
        }
      }).filter(o => typeof o != 'undefined') : [];

    return Promise.resolve(optNames);
  }

  _getPossibleOptionValues(currentOption) {
    if (!currentOption) {
      return Promise.resolve([]);
    }
    // Choices
    if (currentOption.getChoices().length) {
      return Promise.resolve(currentOption.getChoices());
    }

    // Promise completion
    const completion = this.getCompletion(currentOption);
    if (typeof completion === 'function') {
      return this._hanldleCompletionHandler(completion, currentOption);
    }

    return Promise.resolve([]);
  }

  _getPossibleCommands(currentCommand, cmdStr) {
    const commands = this._program
      .getCommands()
      .filter(c => {
        if (!cmdStr) {
          return true;
        }
        return (c.name().startsWith(cmdStr) ||
          (c.getAlias() && c.getAlias().startsWith(cmdStr))) &&
          (!currentCommand || !this._isSameCommand(c, currentCommand))
      })
      .filter(c => c.name() !== '') // do not take the default command
      .map(c => {
        return c.name() + ':' + c.description()
      });

    return Promise.resolve(commands);
  }

  _isSameCommand(command, command2) {
    return command2.name() === command.name();
  }

  _complete(data, done) {

    const currCommand = this._findCommand(data.args.slice(3).join(' '));
    const args = parseArgs(data.args.slice(1), currCommand ? currCommand.parseArgsOpts : {});
    const cmd = args._.join(' ');

    const realArgsCount = this._countArgs(currCommand, args);
    const optionsAlreadyUsed = this._getOptionsAlreadyUsed(data.args);
    const lastPartial = data.lastPartial;

    const lastPartIsOption = data.lastPartial.startsWith('-')
    const lastPartIsKnownOption = this._lastPartialIsKnownOption(currCommand, lastPartIsOption, lastPartial);
    const currOption = this._getCurrentOption(currCommand, lastPartIsKnownOption, lastPartial);

    const possArgValues = this._getPossibleArgumentValues(currCommand,
      lastPartIsOption, realArgsCount, data.lastPartial);
    const possOptNames = this._getPossibleOptionNames(currCommand, optionsAlreadyUsed, lastPartial, lastPartIsOption);
    const possOptValues = this._getPossibleOptionValues(currOption);
    const possCommands = this._getPossibleCommands(currCommand, cmd);

    return Promise.all([possCommands, possArgValues, possOptNames, possOptValues])
      .then(function (results) {
        const completions = []
          .concat.apply([], results)
          .filter(e => typeof e != 'undefined');
        done(null, completions);
        return completions;
      })
      .catch(err => {
        done(err);
        return [];
      })
  }

}

module.exports = Autocomplete;
