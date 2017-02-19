"use strict";

/* global Program, logger, should, sinon */

const program = new Program();

program.
  logger(logger)
  .version('1.0.0');

describe("program.fataError()", () => {
  it(`should call logger.error() and exit(2)`, () => {
    const error = sinon.stub(logger, 'error').withArgs("foo");
    const exit = sinon.stub(process, 'exit').withArgs(2);

    program.fatalError(new Error("foo"));

    should(error.callCount).eql(1);
    should(exit.callCount).eql(1);

    logger.error.restore();
    process.exit.restore();
  });
});


