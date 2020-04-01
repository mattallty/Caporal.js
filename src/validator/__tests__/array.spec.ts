import { validateWithArray } from "../array"
import { createArgument } from "../../argument"
import { createOption } from "../../option"
import { ValidationError } from "../../error"

describe("validateWithArray()", () => {
  const arg = createArgument("<fake>", "Fake arg")
  const opt = createOption("--file <file>", "File")

  it("should validate a valid string", () => {
    expect(validateWithArray(["foo", "bar"], "bar", arg)).toEqual("bar")
    expect(validateWithArray(["foo", "bar"], "bar", opt)).toEqual("bar")
  })
  it("should throw for an invalid string", () => {
    expect(() => validateWithArray(["foo", "bar"], "invalid", arg)).toThrowError(
      ValidationError,
    )
    expect(() => validateWithArray(["foo", "bar"], "invalid", opt)).toThrowError(
      ValidationError,
    )
  })
  it("should validate a valid string[]", () => {
    expect(validateWithArray(["foo", "bar", "hey"], ["bar", "hey"], arg)).toEqual([
      "bar",
      "hey",
    ])
    expect(validateWithArray(["foo", "bar", "hey"], ["bar", "hey"], opt)).toEqual([
      "bar",
      "hey",
    ])
  })
  it("should throw for an invalid string[]", () => {
    expect(() =>
      validateWithArray(["foo", "bar", "hey"], ["bar", "bad"], arg),
    ).toThrowError(ValidationError)
    expect(() =>
      validateWithArray(["foo", "bar", "hey"], ["bar", "bad"], opt),
    ).toThrowError(ValidationError)
  })
})
