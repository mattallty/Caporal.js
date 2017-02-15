"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();
const stripColor = require('chalk').stripColor;

program
  .logger(logger)
  .version('1.0.0');


describe('{caporal/program} --foo', () => {

  it(`should suggest --foor and --afoo and --footx`, () => {
    program
      .option('--foor <foor>')
      .option('--afoo <afoo>')
      .option('--footx <footx>')
      .action(function() {});

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('UnknownOptionError');
      should(stripColor(err.originalMessage)).containEql('foor');
      should(stripColor(err.originalMessage)).containEql('afoo');
      should(stripColor(err.originalMessage)).containEql('footx');
    });
    program.parse(makeArgv('--foo'));
    should(error.callCount).be.eql(1);
    error.restore();
    program.reset();
  });
});
