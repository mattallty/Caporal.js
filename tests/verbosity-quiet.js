"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0')
  .action(function() {
    this.log("This should NOT be displayed");
    this.debug('debug should NOT be displayed');
    this.warn('This should be displayed');
  });

describe('{caporal/program} --quiet', () => {
  it(`should only output warnings & errors`, (done) => {
    let output = 0;

    const listener = (out, level, txt) => output++;
    logger.on('logging', listener);

    program.parse(makeArgv('--quiet'));

    setImmediate(() => {
      should(output).eql(1);
      logger.removeListener('logging', listener);
      done();
    })
  });
});


