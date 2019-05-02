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

describe('Setting up an option without validator', () => {

  it(`should return empty array for option.getChoices()`, () => {

    program
      .command('foo')
      .option('-t <time-in-secs>', 'my option')
      .action(function() {});

    program.parse(makeArgv(['foo', '-t', '2982']));
    should(program.getCommands()[0]._options[0].getChoices()).be.eql([]);
    program.reset();
  });
});

describe('Setting up an option with an non-Array validator', () => {

  it(`should return empty array for validator.getChoices()`, () => {

    program
      .command('foo')
      .option('-t <time-in-secs>', 'my option', program.INT)
      .action(function() {});

    program.parse(makeArgv(['foo', '-t', '2982']));
    should(program.getCommands()[0]._options[0]._validator.getChoices()).be.eql([]);
    program.reset();
  });
});

describe('Setting up an option with a function validator', () => {

  it(`should return empty array for validator.getChoices()`, () => {

    program
      .command('foo')
      .option('-t <time-in-secs>', 'my option', opt => opt)
      .action(function() {});

    program.parse(makeArgv(['foo', '-t', '2982']));
    should(program.getCommands()[0]._options[0]._validator.getChoices()).be.eql([]);
    program.reset();
  })
})

describe('Setting up an option with a promise validator', () => {

  it(`should return empty array for validator.getChoices()`, () => {

    program
      .command('foo')
      .option('-t <time-in-secs>', 'my option', opt => Promise.resolve(opt))
      .action(function() {});

    program.parse(makeArgv(['foo', '-t', '2982']));
    should(program.getCommands()[0]._options[0]._validator.getChoices()).be.eql([]);
    program.reset();
  })
})
