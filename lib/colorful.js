"use strict";

const c = require('colorette');

exports.colorize = (text) => {
  return text.replace(/<([^>]+)>/gi, (match) => {
    return c.blue(match);
  }).replace(/<command>/gi, (match) => {
    return c.magenta(match);
  }).replace(/\[([^[\]]+)\]/gi, (match) => {
    return c.yellow(match);
  }).replace(/ --?([^\s,]+)/gi, (match) => {
    return c.green(match);
  });
};
