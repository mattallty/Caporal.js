"use strict";

/* global Program, logger, should, makeArgv, sinon */

describe('Chaining 2 commands', () => {

  const program = new Program();

  program
    .logger(logger)
    .version('1.0.0')
    .command('foo')
    .action(function() {})
    .command('bar')
    .action(function() {})

  it(`should generate 2 commands`, () => {
    program.parse(makeArgv(['foo']));
    should(program._commands.length).eql(2);
  });


});

describe('Aliasing a command', () => {

  const program = new Program();

  const action = sinon.stub();

  program
    .logger(logger)
    .version('1.0.0')
    .command('foo')
    .alias('f')
    .action(action);

  it(`should allow calling it with alias`, () => {
    program.parse(makeArgv(['f']));
    should(action.callCount).be.eql(1);
  });


});


