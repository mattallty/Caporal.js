"use strict";

/* global Program, logger, should, makeArgv, sinon */

const InvalidArgumentValueError = require('../lib/error/invalid-argument-value');
const WrongNumberOfArgumentError = require('../lib/error/wrong-num-of-arg');
const program = new Program();

program
  .logger(logger)
  .version('1.0.0')
  .reset()
  .command('foo', 'Fooooo')
  .argument('<foo>', 'My bar', /^[a-z]+$/)
  .action(function(){});

describe("Argument validation", function() {

  beforeEach(function () {
    this.fatalError = sinon.stub(program, "fatalError");
    this.action = sinon.spy();
  });

  afterEach(function () {
    this.fatalError.restore();
    program.reset();
  });

  it(`should throw InvalidArgumentValueError for an invalid required argument value (Regex validator)`, function() {
    program.parse(makeArgv(['foo', '827E92']));
    should(this.fatalError.callCount).eql(1);
    should(this.fatalError.calledWith(sinon.match.instanceOf(InvalidArgumentValueError))).be.ok();
  });

  it(`should throw InvalidArgumentValueError for an invalid optional argument value (Regex validator)`, function() {
    program
      .command('foo', 'Fooooo')
      .argument('[foo]', 'My bar', /^[a-z]+$/)
      .action(this.action);

    program.parse(makeArgv(['foo', '827E92']));
    should(this.fatalError.callCount).eql(1);
    should(this.fatalError.calledWith(sinon.match.instanceOf(InvalidArgumentValueError))).be.ok();
  });

  it(`should throw InvalidArgumentValueError for an invalid optional argument value (Array validator)`, function() {
    program
      .command('foo', 'Fooooo')
      .argument('[foo]', 'My bar', ["bim", "bam", "boom"])
      .action(this.action);

    program.parse(makeArgv(['foo', '827E92']));
    should(this.fatalError.callCount).eql(1);
    should(this.fatalError.calledWith(sinon.match.instanceOf(InvalidArgumentValueError))).be.ok();
  });


  it(`should throw InvalidArgumentValueError for an invalid required argument value (Array validator)`, function() {
    program
      .command('foo', 'Fooooo')
      .argument('<foo>', 'My bar', ["bim", "bam", "boom"])
      .action(this.action);

    program.parse(makeArgv(['foo', '827E92']));
    should(this.fatalError.callCount).eql(1);
    should(this.fatalError.calledWith(sinon.match.instanceOf(InvalidArgumentValueError))).be.ok();
  });

  it(`should not throw InvalidArgumentValueError for an valid required argument value (Array validator)`, function() {
    program
      .command('foo', 'Fooooo')
      .argument('<foo>', 'My bar', ["bim", "bam", "boom"])
      .action(this.action);

    program.parse(makeArgv(['foo', 'bam']));
    should(this.fatalError.callCount).eql(0);
  });

  it(`should take default value if not passed when setting up a default argument value`, function() {
    program
      .command('foo', 'Fooooo')
      .argument('[foo]', 'My bar', /^[a-z]+$/, 'bar')
      .action(this.action);

    program.parse(makeArgv(['foo']));
    should(this.action.callCount).eql(1);
    should(this.action.calledWith({foo:"bar"}));
    should(this.fatalError.callCount).eql(0);
  });

  it(`should throw WrongNumberOfArgumentError when passing an unknown argument for a command that does not accept arguments`, function() {
    program
      .command('foo', 'Fooooo')
      .action(this.action);

    program.parse(makeArgv(['foo', '827E92']));
    should(this.fatalError.callCount).eql(1);
    should(this.fatalError.calledWith(sinon.match.instanceOf(WrongNumberOfArgumentError))).be.ok();
  });

  it(`should throw WrongNumberOfArgumentError for a known command when forgetting an argument`, function() {

    program
      .command('foo', 'Fooooo')
      .argument('<joe>', 'max')
      .argument('<jiji...>', 'jiji')
      .action(this.action);

    program.parse(makeArgv(['foo']));
    should(this.fatalError.callCount).eql(1);
    should(this.fatalError.calledWith(sinon.match.instanceOf(WrongNumberOfArgumentError))).be.ok();
  });

  it(`should throw WrongNumberOfArgumentError for a default command when forgetting an argument`, function() {
    program
      .argument('<joe>', 'max')
      .argument('<jiji...>', 'jiji')
      .action(this.action);

    program.parse(makeArgv(['foo']));
    should(this.fatalError.callCount).eql(1);
    should(this.fatalError.calledWith(sinon.match.instanceOf(WrongNumberOfArgumentError))).be.ok();
  });

  it(`should not throw any error when passing an argument without validator`, function() {
    program
      .command('foo', 'Fooooo')
      .argument('<foo>', 'My foo')
      .action(this.action);

    program.parse(makeArgv(['foo', '827E-Z92']));
    should(this.fatalError.callCount).eql(0);
  });

  it(`should return an array for variadic arguments without validator`, function() {
    program
      .command('foo', 'Fooooo')
      .argument('[foo]', 'My bar', /^[a-z]+$/, 'bar')
      .argument('[other-foo...]', 'Other foo')
      .action(this.action);

    program.parse(makeArgv(['foo', 'bar', 'im', 'a', 'variadic', 'arg']));
    should(this.fatalError.callCount).eql(0);
    should(this.action.calledWith({foo: "bar", otherFoo: ['im', 'a', 'variadic', 'arg']}))
  });

  it(`should handled optional arguments with no default and no validator`, function() {
    program
      .command('foo', 'Fooooo')
      .argument('[foo]', 'My bar', /^[a-z]+$/)
      .action(this.action);

    program.parse(makeArgv(['foo']));
    should(this.action.callCount).eql(1);
  });

});
