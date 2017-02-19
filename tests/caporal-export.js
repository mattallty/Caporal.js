"use strict";

/* global Program, should */

describe("require('caporal')", () => {
  it(`should return {new Program()}`, () => {
    const caporal = require('../');
    should(caporal).be.an.instanceOf(Program);
  });
});


