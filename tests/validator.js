"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0');

describe('Setting up an invalid validator flag', () => {

  it(`should throw ValidationError`, () => {

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('ValidationError');
    });

    program
      .command('foo')
      .option('-t <time-in-secs>', 'my option', 256)
      .action(function() {});

    program.parse(makeArgv(['foo', '-t', '2982']));
    should(error.callCount).be.eql(1);
    error.restore();
    program.reset();
  });
});

describe('Setting up an invalid validator (boolean)', () => {

  it(`should throw ValidationError`, () => {

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('ValidationError');
    });

    program
      .command('foo')
      .option('-t <time-in-secs>', 'my option', true)
      .action(function() {});

    program.parse(makeArgv(['foo', '-t', '2982']));
    should(error.callCount).be.eql(1);
    error.restore();
    program.reset();
  });
});
