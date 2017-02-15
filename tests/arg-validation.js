"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0')
  .command('foo <bar>', 'Fooooo', /^[a-z]+$/)
  .action(function(){});

describe('{caporal/program} with an invalid argument', () => {

  it(`should throw an error`, () => {

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('InvalidArgumentValueError');
    });

    program.parse(makeArgv(['foo', '827E92']));
    program.reset();
    error.restore();
  });
});
