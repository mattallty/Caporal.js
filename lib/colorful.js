"use strict";

const chalk = require('chalk');

exports.colorize = (text) => {
  return text.replace(/<([^>]+)>/gi, (match) => {
    return chalk.blue(match);
  }).replace(/<command>/gi, (match) => {
    return chalk.magenta(match);
  }).replace(/\[([^\[\]]+)\]/gi, (match) => {
    return chalk.yellow(match);
  }).replace(/ --?([^\s,]+)/gi, (match) => {
    return chalk.green(match);
  });
};
