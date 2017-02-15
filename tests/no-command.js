"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0');

describe('{caporal/program} without command()', () => {
  it(`should execute action()`, (done) => {
    program.action(() => {
      done();
    });
    program.parse([]);
  });
});


