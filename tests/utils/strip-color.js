"use strict";

module.exports = function(str) {
  return str.replace(/\x1b\[[0-9]+m/ig, '')
}
