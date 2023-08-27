import { expect, it, describe, beforeAll, beforeEach, afterAll, afterEach } from "vitest"
const { default: prog, program, Program } = require("../dist")

describe("Javascript module", () => {
  it("default export should be a Program instance", async () => {
    // const def = await import("../dist/index.js")
    expect(prog).toBeInstanceOf(Program)
  })
  it("exports.program should be a Program instance", () => {
    expect(program).toBeInstanceOf(Program)
  })
})
