"use strict";

/* global Program, logger, should, makeArgv, sinon */

describe('Issue #107 - Implicit boolean option', () => {
  context('having the shorthand and the longhand', () => {
    beforeEach(() => {
      this.program = new Program();
      this.action = sinon.spy();
      this.program
        .logger(logger)
        .version('1.0.0')
        .command('cmd', 'Command')
        .option('-b, --bool', 'Implicit boolean')
        .argument('[a]', 'A', this.program.INT)
        .action(this.action);
      this.fatalError = sinon.stub(this.program, "fatalError");
    });

    afterEach(() => {
      this.fatalError.restore();
      this.program.reset();
    });

    it(`should call the action with {a: 1} and {bool: true}`, () => {
      this.program.parse(makeArgv(['cmd', '-b', '1']));
      should(this.fatalError.callCount).eql(0);
      should(this.action.callCount).eql(1);
      should(this.action.calledWith({a: 1}, {bool: true}, logger));
    });

    it(`should call the action with {} and {bool: true}`, () => {
      this.program.parse(makeArgv(['cmd', '-b']));
      should(this.fatalError.callCount).eql(0);
      should(this.action.callCount).eql(1);
      should(this.action.calledWith({}, {bool: true}, logger));
    });

    it(`should call the action with {a: 1} and {bool: false}`, () => {
      this.program.parse(makeArgv(['cmd', '1']));
      should(this.fatalError.callCount).eql(0);
      should(this.action.callCount).eql(1);
      should(this.action.calledWith({a: 1}, {bool: false}, logger));
    });
  });

  context('only having the longhand', () => {
    beforeEach(() => {
      this.program = new Program();
      this.action = sinon.spy();
      this.program
        .logger(logger)
        .version('1.0.0')
        .command('cmd', 'Command')
        .option('--bool', 'Implicit boolean')
        .argument('[a]', 'A', this.program.INT)
        .action(this.action);
      this.fatalError = sinon.stub(this.program, "fatalError");
    });

    afterEach(() => {
      this.fatalError.restore();
      this.program.reset();
    });

    it(`should call the action with {a: 1} and {bool: true}`, () => {
      this.program.parse(makeArgv(['cmd', '--bool', '1']));
      should(this.fatalError.callCount).eql(0);
      should(this.action.callCount).eql(1);
      should(this.action.calledWith({a: 1}, {bool: true}, logger));
    });

    it(`should call the action with {} and {bool: true}`, () => {
      this.program.parse(makeArgv(['cmd', '--bool']));
      should(this.fatalError.callCount).eql(0);
      should(this.action.callCount).eql(1);
      should(this.action.calledWith({}, {bool: true}, logger));
    });

    it(`should call the action with {a: 1} and {bool: false}`, () => {
      this.program.parse(makeArgv(['cmd', '1']));
      should(this.fatalError.callCount).eql(0);
      should(this.action.callCount).eql(1);
      should(this.action.calledWith({a: 1}, {bool: false}, logger));
    });
  });

  context('only having the shorthand', () => {
    beforeEach(() => {
      this.program = new Program();
      this.action = sinon.spy();
      this.program
        .logger(logger)
        .version('1.0.0')
        .command('cmd', 'Command')
        .option('-b', 'Implicit boolean')
        .argument('[a]', 'A', this.program.INT)
        .action(this.action);
      this.fatalError = sinon.stub(this.program, "fatalError");
    });

    afterEach(() => {
      this.fatalError.restore();
      this.program.reset();
    });

    it(`should call the action with {a: 1} and {b: true}`, () => {
      this.program.parse(makeArgv(['cmd', '-b', '1']));
      should(this.fatalError.callCount).eql(0);
      should(this.action.callCount).eql(1);
      should(this.action.calledWith({a: 1}, {b: true}, logger));
    });

    it(`should call the action with {} and {b: true}`, () => {
      this.program.parse(makeArgv(['cmd', '-b']));
      should(this.fatalError.callCount).eql(0);
      should(this.action.callCount).eql(1);
      should(this.action.calledWith({}, {b: true}, logger));
    });

    it(`should call the action with {a: 1} and {b: false}`, () => {
      this.program.parse(makeArgv(['cmd', '1']));
      should(this.fatalError.callCount).eql(0);
      should(this.action.callCount).eql(1);
      should(this.action.calledWith({a: 1}, {b: false}, logger));
    });
  });
});
