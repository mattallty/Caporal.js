"use strict";

/* global should, sinon */

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



  it(`should log error() to stderr`, () => {

    const write = process.stderr.write;
    let logStr = null;

    sinon.stub(process.stderr, "write", function(str) {
      logStr = str;
    });
    const callback = sinon.stub().withArgs(null, true, 'stderr');

    myLogger.log('error', 'foo', {foo:'bar'}, callback);

    const oldWrite = process.stderr.write;
    process.stderr.write = write;

    should(stripColor(logStr)).be.eql("foo\nfoo: bar\n");
    should(callback.called).be.ok();
    should(oldWrite.called).be.ok();

  });

  it(`should log without meta`, () => {

    const write = process.stdout.write;
    let logStr = null;

    sinon.stub(process.stdout, "write", function(str) {
      logStr = str;
    });
    const callback = sinon.stub().withArgs(null, true, 'stdout');

    myLogger.log('info', 'foo', null, callback);

    const oldWrite = process.stdout.write;
    process.stdout.write = write;

    should(stripColor(logStr)).be.eql("foo");
    should(callback.called).be.ok();
    should(oldWrite.called).be.ok();

  });

});


