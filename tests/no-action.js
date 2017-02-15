"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0');

describe('{caporal/program} without action()', () => {
  it(`should execute action()`, (done) => {

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('NoActionError');
      done()
    });

    program.parse([]);

    const count = error.callCount;
    program.reset();
    error.restore();
    should(count).be.eql(1);
  });
});


