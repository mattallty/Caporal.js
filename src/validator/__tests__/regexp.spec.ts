import { validateWithRegExp } from "../regexp"
import { createArgument } from "../../argument"
import { createOption } from "../../option"
import { ValidationError } from "../../error"

describe("validateWithRegExp()", () => {
  const arg = createArgument("<fake>", "Fake arg")
  const opt = createOption("--file <file>", "File")

  it("should validate a valid string", () => {
    expect(validateWithRegExp(/^ex/, "example", arg)).toEqual("example")
    expect(validateWithRegExp(/^ex/, "example", opt)).toEqual("example")
  })
  it("should throw for an invalid string", () => {
    expect(() => validateWithRegExp(/^ex/, "invalid", arg)).toThrowError(ValidationError)
    expect(() => validateWithRegExp(/^ex/, "invalid", opt)).toThrowError(ValidationError)
  })
  it("should validate a valid string[]", () => {
    expect(validateWithRegExp(/^ex/, ["example", "executor"], arg)).toEqual([
      "example",
      "executor",
    ])
    expect(validateWithRegExp(/^ex/, ["example", "executor"], opt)).toEqual([
      "example",
      "executor",
    ])
  })
  it("should throw for an invalid string[]", () => {
    expect(() => validateWithRegExp(/^ex/, ["example", "invalid"], arg)).toThrowError(
      ValidationError,
    )
    expect(() => validateWithRegExp(/^ex/, ["example", "invalid"], opt)).toThrowError(
      ValidationError,
    )
  })
})
