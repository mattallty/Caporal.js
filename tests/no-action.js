"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0')
  .command('foo', 'My foo');

describe('Setting up no action()', () => {
  it(`should throw NoActionError`, () => {

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('NoActionError');
    });

    program.parse(makeArgv('foo'));

    const count = error.callCount;
    error.restore();
    should(count).be.eql(1);
    program.reset();
  });
});


