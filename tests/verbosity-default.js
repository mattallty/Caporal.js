"use strict";

/* global Program, should, makeArgv */
const createLogger = require('../lib/logger').createLogger;

describe('Caporal with default verbosity', () => {
  it(`should output at info level when CAPORAL_LOGGER_LEVEL is not set`, (done) => {
    delete process.env.CAPORAL_LOGGER_LEVEL;
    const program = new Program();
    const customLogger = createLogger();

    program
      .logger(customLogger)
      .version('1.0.0')
      .reset()
      .command('foo', 'My foo')
      .action(function() {
        this.debug('debug should NOT be displayed');
        this.info("This should be displayed");
        this.warn('This should be displayed');
      });

    let output = 0;
    const listener = _ => output++;
    customLogger.on('logging', listener);

    program.parse(makeArgv(['foo']));

    setImmediate(() => {
      should(output).eql(2);
      customLogger.removeListener('logging', listener);
      done();
    })
  });

  it(`should output at debug level when CAPORAL_LOGGER_LEVEL is set to debug`, (done) => {
    process.env.CAPORAL_LOGGER_LEVEL = 'debug';
    const program = new Program();
    const customLogger = createLogger();
    program
      .logger(customLogger)
      .version('1.0.0')
      .reset()
      .command('foo', 'My foo')
      .action(function() {
        this.debug('debug should be displayed');
        this.info("This should be displayed");
        this.warn('This should be displayed');
      });

    let output = 0;
    const listener = _ => output++;
    customLogger.on('logging', listener);

    program.parse(makeArgv(['foo']));

    setImmediate(() => {
      should(output).eql(3);
      customLogger.removeListener('logging', listener);
      done();
    })
  });
});


