import { createOption } from ".."
import { FlagSyntaxError } from "../../error"

describe("createOption()", () => {
  it("should create a basic short option", () => {
    const opt = createOption("-f <file>", "My simple option")
    expect(opt).toMatchObject({
      allNames: ["f"],
      allNotations: ["-f"],
      shortName: "f",
      shortNotation: "-f",
      description: "My simple option",
      choices: [],
      name: "f",
      valueType: 1,
      boolean: false,
      valueRequired: true,
      required: false,
      synopsis: "-f <file>",
      variadic: false,
      visible: true,
    })
  })
  it("should create a basic long option", () => {
    const opt = createOption("--file <file>", "My simple option")
    expect(opt).toMatchObject({
      allNames: ["file"],
      allNotations: ["--file"],
      longName: "file",
      longNotation: "--file",
      description: "My simple option",
      choices: [],
      name: "file",
      valueType: 1,
      boolean: false,
      valueRequired: true,
      required: false,
      synopsis: "--file <file>",
      variadic: false,
      visible: true,
    })
  })
  it("should create a short option without value", () => {
    const opt = createOption("-f", "My simple option")
    expect(opt).toMatchObject({
      allNames: ["f"],
      allNotations: ["-f"],
      shortName: "f",
      shortNotation: "-f",
      description: "My simple option",
      choices: [],
      name: "f",
      boolean: true,
      valueRequired: false,
      valueType: 2,
      default: false,
      required: false,
      synopsis: "-f",
      variadic: false,
      visible: true,
    })
  })
  it("should create a short option with optional value", () => {
    const opt = createOption("-p [mean]", "My simple option")
    expect(opt).toMatchObject({
      allNames: ["p"],
      allNotations: ["-p"],
      shortName: "p",
      shortNotation: "-p",
      description: "My simple option",
      choices: [],
      name: "p",
      boolean: false,
      valueRequired: false,
      valueType: 0,
      required: false,
      synopsis: "-p [mean]",
      variadic: false,
      visible: true,
    })
  })
  it("should set choices if validator is an array", () => {
    const opt = createOption("-p [mean]", "My simple option", {
      validator: ["card", "cash"],
    })
    expect(opt).toMatchObject({
      allNames: ["p"],
      allNotations: ["-p"],
      shortName: "p",
      shortNotation: "-p",
      description: "My simple option",
      choices: ["card", "cash"],
      name: "p",
      boolean: false,
      typeHint: 'one of "card","cash"',
      valueRequired: false,
      validator: ["card", "cash"],
      valueType: 0,
      required: false,
      synopsis: "-p [mean]",
      variadic: false,
      visible: true,
    })
  })

  test.each([["bad synopsis"], ["another"], ["---fooo"]])(
    "should throw for a malformed synopsis '%s'",
    (a) => {
      expect(() => createOption(a, "My simple option")).toThrowError(FlagSyntaxError)
    },
  )
})
