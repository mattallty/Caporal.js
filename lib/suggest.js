"use strict";

const levenshtein = require('fast-levenshtein');
const chalk = require('chalk');

/**
 *
 * @param {String} input - User input
 * @param {String[]} possibilities - Possibilities to retrieve suggestions from
 */
exports.getSuggestions = function getSuggestions(input, possibilities) {
  return possibilities
    .map(p => {
      return {suggestion: p,  distance: levenshtein.get(input, p)};
    })
    .filter(p => p.distance <= 2)
    .sort((a, b) => a.distance - b.distance)
    .map(p => p.suggestion);
};

exports.getBoldDiffString = (from, to) => {
  return to.split('').map((char, index) => {
    if (char != from.charAt(index)) {
      return chalk.bold(char);
    }
    return char;
  }).join('')
};

