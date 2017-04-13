"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0');

describe('Predefined options', function() {

  it(`-V should return program version (${program.version()})`, function() {
    const version = sinon.stub(program, "version");
    const exit = sinon.stub(process, "exit");
    program.parse(makeArgv('-V'));
    should(version.called).be.true();
    should(exit.callCount).eql(1);
    exit.restore();
    version.restore();
  });

  it(`--version should return program version (${program.version()})`, function() {
    const version = sinon.stub(program, "version");
    const exit = sinon.stub(process, "exit");
    program.parse(makeArgv('--version'));
    should(version.called).be.true();
    should(exit.callCount).eql(1);
    exit.restore();
    version.restore();
  });

  it(`-h should call help() when only one command`, function() {
    program
      .reset()
      .command('foo', 'My foo');

    const exit = sinon.stub(process, "exit");
    const help = sinon.spy(program, "help");
    program.parse(makeArgv(['foo', '-h']));
    should(help.called).be.ok();
    should(exit.callCount).eql(1);
    exit.restore();
    help.restore();
  });

  it(`-h should call help() when more than one command`, function() {
    program
      .reset()
      .command('foo', 'My foo')
      .command('bar', 'My bar');

    const exit = sinon.stub(process, "exit");
    const help = sinon.spy(program, "help");
    program.parse(makeArgv(['foo', '-h']));
    should(help.called).be.ok();
    should(exit.callCount).eql(1);
    exit.restore();
    help.restore();

  });

});
