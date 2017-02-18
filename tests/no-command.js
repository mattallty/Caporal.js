"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0')
  .reset();

describe('Setting up no command() but an action()', () => {
  it(`should execute action()`, (done) => {
    program.action(() => {
      done();
    });
    program.parse([]);
  });
});


