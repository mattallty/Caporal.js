"use strict";

/* global Program, logger, should, makeArgv, sinon */

const myLogger = require('../lib/logger').createLogger();
const stripColor = require('chalk').stripColor;

describe('logger', () => {

  it(`should log info() to stdout`, () => {

    const write = process.stdout.write;
    let logStr = null;

    sinon.stub(process.stdout, "write", function(str) {
      logStr = str;
    });
    const callback = sinon.stub().withArgs(null, true, 'stdout');

    myLogger.log('info', 'foo', {foo:'bar'}, callback);

    const oldWrite = process.stdout.write;
    process.stdout.write = write;

    should(stripColor(logStr)).be.eql("foo\nfoo: bar\n");
    should(callback.called).be.ok();
    should(oldWrite.called).be.ok();

  });
});


