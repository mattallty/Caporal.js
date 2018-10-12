"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();
const chalk = require('chalk');

program
  .logger(logger)
  .version('1.0.0')
  .command('issue118', 'Fix!');


describe('Issue #118 - Unknown option --undefined', () => {
  it('should return shortname in error text whenever longname is not provided', () => {

    sinon.stub(program, 'fatalError', (err) => {
      should(err.name).eql('MissingOptionError');
      should(err.originalMessage).equal(`Missing option ${chalk.italic('-z')}.`);
    });
    program.option('-z <whatever>', 'Random option', program.INT, null, true);
    program.parse(makeArgv([]));

  });
});
