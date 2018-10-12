"use strict";

const c = require('colorette');

class BaseError extends Error {
  constructor(message, meta, program) {
    const spaces = " ".repeat(3);
    const msg = spaces + c.red("Error: " + message) + "\n" + spaces +
                `Type ${c.bold(program.bin() + ' --help')} for help.\n`;
    super(msg);
    this.name = this.constructor.name;
    this.originalMessage = message;
    this.meta = meta;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = BaseError;
