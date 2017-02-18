"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0')
  .reset()
  .command('foo', 'Fooooo')
  .argument('<foo>', 'My bar', /^[a-z]+$/)
  .action(function(){});

describe('Passing an invalid required argument value', () => {
  it(`should throw InvalidArgumentValueError`, () => {
    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('InvalidArgumentValueError');
    });
    program.parse(makeArgv(['foo', '827E92']));
    should(error.callCount).eql(1);
    program.reset();
    error.restore();
  });
});

describe('Passing an invalid optional argument value', () => {
  it(`should throw InvalidArgumentValueError`, () => {

    program
      .reset()
      .command('foo', 'Fooooo')
      .argument('[foo]', 'My bar', /^[a-z]+$/)
      .action(function(){});

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('InvalidArgumentValueError');
    });
    program.parse(makeArgv(['foo', '827E92']));
    should(error.callCount).eql(1);
    program.reset();
    error.restore();
  });
});

describe('Setting up a default argument value', () => {
  it(`should take default value if not passed`, () => {

    program
      .reset()
      .command('foo', 'Fooooo')
      .argument('[foo]', 'My bar', /^[a-z]+$/, 'bar')
      .action(function(args){
        should(args.foo).eql('bar');
      });

    const error = sinon.stub(program, "fatalError");
    program.parse(makeArgv(['foo']));
    should(error.callCount).eql(0);
    program.reset();
    error.restore();
  });
});

describe('Passing an unknown argument', () => {

  it(`should throw WrongNumberOfArgumentError`, () => {

    program
      .reset()
      .command('foo', 'Fooooo')
      .action(function(){});

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('WrongNumberOfArgumentError');
    });

    program.parse(makeArgv(['foo', '827E92']));
    should(error.callCount).eql(1);
    program.reset();
    error.restore();
  });
});

describe('Setting up an argument without validator', () => {

  it(`should not throw any error`, () => {

    program
      .reset()
      .command('foo', 'Fooooo')
      .argument('<foo>', 'My foo')
      .action(function(){});

    const error = sinon.stub(program, "fatalError");

    program.parse(makeArgv(['foo', '827E-Z92']));
    should(error.callCount).eql(0);
    program.reset();
    error.restore();
  });
});

describe('Setting up a variadic argument', () => {
  it(`should return an array when passed`, () => {

    program
      .reset()
      .command('foo', 'Fooooo')
      .argument('[foo]', 'My bar', /^[a-z]+$/, 'bar')
      .argument('[other-foo...]', 'Other foo')
      .action(function(args){
        should(args.foo).eql('bar');
        should(args.otherFoo).eql(['im', 'a', 'variadic', 'arg']);
      });

    const error = sinon.stub(program, "fatalError");
    program.parse(makeArgv(['foo', 'bar', 'im', 'a', 'variadic', 'arg']));
    should(error.callCount).eql(0);
    program.reset();
    error.restore();
  });
});

describe('Setting up an optionnal argument', () => {
  it(`should succed if this argument is not passed and no default is provided`, () => {

    const action = sinon.spy();

    program
      .reset()
      .command('foo', 'Fooooo')
      .argument('[foo]', 'My bar', /^[a-z]+$/)
      .action(action);

    program.parse(makeArgv(['foo']));
    should(action.callCount).eql(1);
    program.reset();
  });
});

