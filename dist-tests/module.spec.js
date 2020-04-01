const { Program: ProgramClass } = require("../dist/program")
const { default: prog, program, Program } = require("../dist")

describe("Javascript module", () => {
  test("default export should be a Program instance", () => {
    expect(prog).toBeInstanceOf(ProgramClass)
  })
  test("exports.program should be a Program instance", () => {
    expect(program).toBeInstanceOf(ProgramClass)
  })
  test("exports.Program should be a Program instance", () => {
    expect(Program).toEqual(ProgramClass)
  })
})
