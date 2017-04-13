"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0');


describe('Calling {program} help', function() {

  it(`should output global help for single command program`, function() {
    program
      .argument('<required>', 'Required arg')
      .argument('[optional]', 'Optional arg')
      .option('-f, --foo', 'Foo option')
      .action(function() {});

    const help = sinon.spy(program, "help");
    const exit = sinon.stub(process, "exit");
    program.parse(makeArgv('help'));
    should(help.callCount).be.eql(1);
    should(exit.callCount).be.eql(1);
    help.restore();
    exit.restore();
    program.reset();
  });

  it(`should output global help for multiple commands program`, function() {
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
    const exit = sinon.stub(process, "exit");
    program.parse(makeArgv('help'));
    should(help.callCount).be.eql(1);
    should(exit.callCount).be.eql(1);
    help.restore();
    exit.restore();
    program.reset();
  });

  it(`should output command-specific help for multiple commands program`, function() {
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
    const exit = sinon.stub(process, "exit");
    program.parse(makeArgv(['help', 'command1']));
    should(help.callCount).be.eql(1);
    should(exit.callCount).be.eql(1);
    exit.restore();
    help.restore();
    program.reset();
  });

  it(`should output command-specific help for single command program`, function() {
    program
      .description('my desc')
      .command('command1', '1st command')
      .argument('<required>', 'Required arg')
      .argument('[optional]', 'Optional arg', null, 2)
      .option('-f, --foo', 'Foo option')
      .option('-b, --bar', 'Bar option', null, 1, true)
      .action(function() {});

    const help = sinon.spy(program, "help");
    const exit = sinon.stub(process, "exit");
    program.parse(makeArgv(['help', 'command1']));
    should(help.callCount).be.eql(1);
    should(exit.callCount).be.eql(1);
    help.restore();
    exit.restore();
    program.reset();
  });

});
