"use strict";

const chalk = require('chalk');

exports.colorize = (text) => {
  return text.replace(/<([a-z0-9-_.]+)>/gi, (match) => {
    return chalk.blue(match);
  }).replace(/<command>/gi, (match) => {
    return chalk.magenta(match);
  }).replace(/\[([a-z0-9-_.]+)\]/gi, (match) => {
    return chalk.yellow(match);
  }).replace(/ --?([a-z0-9-_.]+)/gi, (match) => {
    return chalk.green(match);
  });
};
