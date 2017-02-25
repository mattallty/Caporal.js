"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0');


describe('Calling {program} help', () => {

  it(`should output global help for single command program`, () => {
    program
      .argument('<required>', 'Required arg')
      .argument('[optional]', 'Optional arg')
      .option('-f, --foo', 'Foo option')
      .action(function() {});

    const help = sinon.spy(program, "help");
    program.parse(makeArgv('help'));
    should(help.callCount).be.eql(1);
    help.restore();
    program.reset();
  });

  it(`should output global help for multiple commands program`, () => {
    program
      .description('my desc')
      .command('command1', '1st command')
      .argument('<required>', 'Required arg')
      .argument('[optional]', 'Optional arg', null, 2)
      .option('-f, --foo', 'Foo option')
      .action(function() {})
      .command('command2', '2nd command')
      .argument('<required>', 'Required arg')
      .argument('[optional]', 'Optional arg')
      .option('-f, --foo', 'Foo option')
      .action(function() {})


    const help = sinon.spy(program, "help");
    program.parse(makeArgv('help'));
    should(help.callCount).be.eql(1);
    help.restore();
    program.reset();
  });

  it(`should output command-specific help for multiple commands program`, () => {
    program
      .description('my desc')
      .command('command1', '1st command')
      .argument('<required>', 'Required arg')
      .argument('[optional]', 'Optional arg', null, 2)
      .option('-f, --foo', 'Foo option')
      .option('-b, --bar', 'Bar option', null, 1, true)
      .action(function() {})
      .command('command2', '2nd command')
      .argument('<required>', 'Required arg')
      .argument('[optional]', 'Optional arg')
      .option('-f, --foo', 'Foo option')
      .option('-b, --bar', 'Bar option', null, 1, true)
      .action(function() {})


    const help = sinon.spy(program, "help");
    program.parse(makeArgv(['help', 'command1']));
    should(help.callCount).be.eql(1);
    help.restore();
    program.reset();
  });

  it(`should output command-specific help for single command program`, () => {
    program
      .description('my desc')
      .command('command1', '1st command')
      .argument('<required>', 'Required arg')
      .argument('[optional]', 'Optional arg', null, 2)
      .option('-f, --foo', 'Foo option')
      .option('-b, --bar', 'Bar option', null, 1, true)
      .action(function() {});

    const help = sinon.spy(program, "help");
    program.parse(makeArgv(['help', 'command1']));
    should(help.callCount).be.eql(1);
    help.restore();
    program.reset();
  });

});
