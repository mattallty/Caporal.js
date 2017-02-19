"use strict";

/* global Program, logger, should, makeArgv, sinon */



describe('Setting up no command() but an action()', () => {

  const program = new Program();

  program
    .logger(logger)
    .version('1.0.0');

  it(`should execute action()`, (done) => {
    program.action(() => {
      done();
    });
    program.parse([]);
  });
});

describe('Setting up no command() but an argument() and an action()', () => {

  const program = new Program();

  program
    .logger(logger)
    .version('1.0.0')
    .argument('<foo>', 'My foo arg');

  it(`should execute action()`, (done) => {
    program.action(() => {
      done();
    });
    program.parse(makeArgv(['myarg']));
  });
});


