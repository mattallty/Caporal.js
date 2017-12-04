"use strict";

/* global Program, logger, should, sinon */

describe('Execute command', () => {

  const program = new Program();
  const actionFoo = sinon.stub();
  const actionBar = sinon.stub();

  program
    .logger(logger)
    .version('1.0.0')
    .command('foo')
    .option('--foo-option', 'foo option', program.INT, 1)
    .action(actionFoo)
    .command('bar')
    .option('--bar-option', 'bar option', program.INT, 2)
    .action(actionBar)

  it('should execute 1 command', () => {
    program.exec(['foo'], {
      'fooOption': 11,
    });

    should(actionFoo.callCount).be.eql(1);
    should(actionBar.callCount).be.eql(0);
  });

});