"use strict";

const camelCase = require('lodash').camelCase;

class GetterSetter {

  makeGetterSetter(varname) {
    return function(value) {
      const key = '_' + varname;
      if (value) {
        this[key] = value;
        return this;
      }
      return this[key];
    }.bind(this);
  }

  getCleanNameFromNotation(str) {
    str = str.replace(/([[\]<>]+)/g, '').replace('...', '');
    return camelCase(str);
  }

}

exports.GetterSetter = GetterSetter;

/**
 *
 * @param {String} option
 */
exports.getDashedOption = function getDashedOption(option) {
  if (option.length === 1) {
    return '-' + option;
  }
  return '--' + option;
};


/**
 *
 * @param {Object} obj
 */
exports.isPromise = function isPromise(obj) {
  return obj && typeof obj.then === 'function';
}
