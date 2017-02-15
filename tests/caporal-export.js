"use strict";

/* global Program, logger, should, makeArgv, sinon */

describe("require('caporal')", () => {
  it(`should return {new Program()}`, () => {
    const caporal = require('../');
    should(caporal).be.an.instanceOf(Program);
  });
});


