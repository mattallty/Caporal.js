"use strict";

/* global Program, logger, should, makeArgv, sinon */

const Promise = require('bluebird');

describe('Setting up no action()', () => {

  it(`should throw NoActionError`, () => {

    const program = new Program();

    program
      .logger(logger)
      .version('1.0.0')
      .command('foo', 'My foo');

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


describe('Setting up a sync action', () => {

  it(`should call this action`, () => {

    const program = new Program();
    const action = sinon.spy();

    program
      .logger(logger)
      .version('1.0.0')
      .command('foo', 'My foo')
      .action(action);

    program.parse(makeArgv('foo'));

    should(action.callCount).be.eql(1);

    program.reset();
  });

});


describe('Setting up a async action', () => {

  it(`should succeed for a resolved promise`, () => {

    const program = new Program();
    const action = function() {
      return Promise.resolve('foo')
    };
    const stub = sinon.spy(action);

    program
      .logger(logger)
      .version('1.0.0')
      .command('foo', 'My foo')
      .action(stub);

    program.parse(makeArgv('foo'));

    should(stub.callCount).be.eql(1);
    program.reset();

  });

  it(`should fatalError() for a rejected promise (error string)`, (done) => {

    const program = new Program();
    const action = function() {
      return Promise.reject('Failed!')
    };
    const stub = sinon.spy(action);
    const fatalError = sinon.stub(program, "fatalError");

    program
      .logger(logger)
      .version('1.0.0')
      .command('foo', 'My foo')
      .action(stub);

    program.parse(makeArgv('foo'));

    setImmediate(function () {
      should(stub.callCount).be.eql(1);
      should(fatalError.callCount).be.eql(1);
      done()
    });

  });
  it(`should fatalError() for a rejected promise (error object)`, (done) => {

    const program = new Program();
    const action = function() {
      return Promise.reject(new Error('Failed!'))
    };
    const stub = sinon.spy(action);
    const fatalError = sinon.stub(program, "fatalError");

    program
      .logger(logger)
      .version('1.0.0')
      .command('foo', 'My foo')
      .action(stub);

    program.parse(makeArgv('foo'));

    setImmediate(function () {
      should(stub.callCount).be.eql(1);
      should(fatalError.callCount).be.eql(1);
      done()
    });

  });

});
