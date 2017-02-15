"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0');

describe('{caporal/program} -V', () => {
  it(`should return program version (${program.version()})`, () => {
    const version = sinon.stub(program, "version");
    program.parse(makeArgv('-V'));
    should(version.called).be.true();
    version.restore();
  });
});

describe('{caporal/program} --version', () => {
  it(`should return program version (${program.version()})`, () => {
    const version = sinon.stub(program, "version");
    program.parse(makeArgv('--version'));
    should(version.called).be.true();
    version.restore();
  });
});

describe('{caporal/program} -h', () => {
  it(`should call help()`, () => {
    const help = sinon.stub(program, "help");
    program.parse(makeArgv('-h'));
    should(help.called).be.true();
    help.restore()
  });
});
