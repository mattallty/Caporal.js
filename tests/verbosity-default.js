"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0')
  .reset()
  .command('foo', 'My foo')
  .action(function() {
    this.debug('debug should NOT be displayed');
    this.info("This should be displayed");
    this.warn('This should be displayed');
  });

describe('Caporal with default verbosity', () => {
  it(`should output at info level`, (done) => {

    let output = 0;
    const listener = _ => output++;
    logger.on('logging', listener);

    program.parse(makeArgv(['foo']));

    setImmediate(() => {
      should(output).eql(2);
      logger.removeListener('logging', listener);
      done();
    })
  });
});


