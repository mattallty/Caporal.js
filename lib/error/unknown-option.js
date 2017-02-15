"use strict";

const BaseError = require('./base-error');
const getSuggestions = require('../suggest').getSuggestions;
const getBoldDiffString = require('../suggest').getBoldDiffString;
const chalk = require('chalk');

class UnknownOptionError extends BaseError {
  constructor(option, command, program) {
    let optionDashed;
    if (option.length === 1) {
      optionDashed = '-' + option;
    } else {
      optionDashed = '--' + option;
    }
    const suggestions = getSuggestions(option, command.getOptions());

    let msg = `Unknown option ${chalk.italic(optionDashed)}.`;
    if (suggestions.length) {
      msg += ' Did you mean ' + suggestions.map(
          s => '--' + getBoldDiffString(option, s)
        ).join(' or maybe ') + ' ?';
    }
    super(msg, {option, command}, program);
  }
}

module.exports = UnknownOptionError;
