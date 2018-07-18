"use strict";

const c = require('colorette');

exports.colorize = (text) => {
  return text.replace(/<([a-z0-9-_.]+)>/gi, (match) => {
    return c.blue(match);
  }).replace(/<command>/gi, (match) => {
    return c.magenta(match);
  }).replace(/\[([a-z0-9-_.]+)\]/gi, (match) => {
    return c.yellow(match);
  }).replace(/ --?([a-z0-9-_.]+)/gi, (match) => {
    return c.green(match);
  });
};
