"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  //.logger(logger)
  .version('1.0.0')
  .command('foo')
  .action(function() {})
  .command('bar')
  .action(function() {})

describe('Chaining 2 commands', () => {
  it(`should generate 2 commands`, () => {
    program.parse(makeArgv(['foo']));
    should(program._commands.length).eql(2);
  });
});


