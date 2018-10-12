"use strict";

const BaseError = require('./base-error');
const getSuggestions = require('../suggest').getSuggestions;
const getBoldDiffString = require('../suggest').getBoldDiffString;
const getDashedOption = require('../utils').getDashedOption;
const c = require('colorette');

class UnknownOptionError extends BaseError {
  constructor(option, command, program) {
    const suggestions = getSuggestions(option, command._getLongOptions());
    let msg = `Unknown option ${c.italic(getDashedOption(option))}.`;
    if (suggestions.length) {
      msg += ' Did you mean ' + suggestions.map(
        s => '--' + getBoldDiffString(option, s)
      ).join(' or maybe ') + ' ?';
    }
    super(msg, {option, command}, program);
  }
}

module.exports = UnknownOptionError;
