"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0');

describe('Passing -V', () => {
  it(`should return program version (${program.version()})`, () => {
    const version = sinon.stub(program, "version");
    program.parse(makeArgv('-V'));
    should(version.called).be.true();
    version.restore();
  });
});

describe('Passing --version', () => {
  it(`should return program version (${program.version()})`, () => {
    const version = sinon.stub(program, "version");
    program.parse(makeArgv('--version'));
    should(version.called).be.true();
    version.restore();
  });
});

describe('Passing -h', () => {
  it(`should call help() when only one command`, () => {
    program
      .reset()
      .command('foo', 'My foo');

    const help = sinon.spy(program, "help");
    program.parse(makeArgv(['foo', '-h']));
    should(help.called).be.ok();
    help.restore();
  });
  it(`should call help() when more than one command`, () => {
    program
      .reset()
      .command('foo', 'My foo')
      .command('bar', 'My bar');
    const help = sinon.spy(program, "help");
    program.parse(makeArgv(['foo', '-h']));
    should(help.called).be.ok();
    help.restore();
  });

});
