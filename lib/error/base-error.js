"use strict";

const chalk = require('chalk');

class BaseError extends Error {
  constructor(message, meta, program) {
    const spaces = " ".repeat(3);
    const msg = spaces + chalk.red("Error: " + message) + "\n" + spaces +
                `Type ${chalk.bold(program.bin() + ' --help')} for help.\n`;
    super(msg);
    this.name = this.constructor.name;
    this.originalMessage = message;
    this.meta = meta;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = BaseError;
