const { default: prog, program, Program } = require("../dist")

describe("Javascript module", () => {
  test("default export should be a Program instance", () => {
    expect(prog).toBeInstanceOf(Program)
  })
  test("exports.program should be a Program instance", () => {
    expect(program).toBeInstanceOf(Program)
  })
})
