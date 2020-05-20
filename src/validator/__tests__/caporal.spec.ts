import { createArgument } from "../../argument"
import { createOption } from "../../option"
import { ValidationError } from "../../error"
import { validateWithCaporal, CaporalValidator } from "../caporal"

describe("validateWithCaporal()", () => {
  const arg = createArgument("<fake>", "Fake arg")
  const opt = createOption("--file <file>", "File")

  it("should work with an array validator", () => {
    expect(validateWithCaporal(CaporalValidator.ARRAY, ["val2"], arg)).toEqual(["val2"])
    expect(validateWithCaporal(CaporalValidator.ARRAY, ["val2"], opt)).toEqual(["val2"])
    expect(validateWithCaporal(CaporalValidator.ARRAY, "hey", arg)).toEqual(["hey"])
    expect(validateWithCaporal(CaporalValidator.ARRAY, "hey", opt)).toEqual(["hey"])
    expect(validateWithCaporal(CaporalValidator.ARRAY, "hey,ho", arg)).toEqual([
      "hey",
      "ho",
    ])

    expect(validateWithCaporal(CaporalValidator.ARRAY, "hey,ho", opt)).toEqual([
      "hey",
      "ho",
    ])

    expect(validateWithCaporal(CaporalValidator.ARRAY, ["hey", "ho"], arg)).toEqual([
      "hey",
      "ho",
    ])

    expect(validateWithCaporal(CaporalValidator.ARRAY, ["hey", "ho"], opt)).toEqual([
      "hey",
      "ho",
    ])

    expect(validateWithCaporal(CaporalValidator.ARRAY, 123, arg)).toEqual([123])
    expect(validateWithCaporal(CaporalValidator.ARRAY, 123, opt)).toEqual([123])
  })
  it("should work with an numeric validator", () => {
    expect(validateWithCaporal(CaporalValidator.NUMBER, 123, arg)).toEqual(123)
    expect(validateWithCaporal(CaporalValidator.NUMBER, 123, opt)).toEqual(123)
    expect(validateWithCaporal(CaporalValidator.NUMBER, "123", arg)).toEqual(123)
    expect(validateWithCaporal(CaporalValidator.NUMBER, "123", opt)).toEqual(123)
    expect(validateWithCaporal(CaporalValidator.NUMBER, "3.14", arg)).toEqual(3.14)
    expect(validateWithCaporal(CaporalValidator.NUMBER, "3.14", opt)).toEqual(3.14)
    expect(() => validateWithCaporal(CaporalValidator.NUMBER, "hello", arg)).toThrowError(
      ValidationError,
    )
    expect(() => validateWithCaporal(CaporalValidator.NUMBER, "hello", opt)).toThrowError(
      ValidationError,
    )
    expect(() =>
      validateWithCaporal(CaporalValidator.NUMBER, ["array"], arg),
    ).toThrowError(ValidationError)

    expect(() =>
      validateWithCaporal(CaporalValidator.NUMBER, ["array"], opt),
    ).toThrowError(ValidationError)

    expect(() => validateWithCaporal(CaporalValidator.NUMBER, true, arg)).toThrowError(
      ValidationError,
    )

    expect(() => validateWithCaporal(CaporalValidator.NUMBER, true, opt)).toThrowError(
      ValidationError,
    )

    expect(() => validateWithCaporal(CaporalValidator.NUMBER, false, arg)).toThrowError(
      ValidationError,
    )
    expect(() => validateWithCaporal(CaporalValidator.NUMBER, false, opt)).toThrowError(
      ValidationError,
    )
  })

  it("should work with an string validator", () => {
    expect(validateWithCaporal(CaporalValidator.STRING, "hey", arg)).toEqual("hey")
    expect(validateWithCaporal(CaporalValidator.STRING, "hey", opt)).toEqual("hey")
    expect(validateWithCaporal(CaporalValidator.STRING, 1, opt)).toEqual("1")
    expect(validateWithCaporal(CaporalValidator.STRING, 3.14, opt)).toEqual("3.14")
    expect(validateWithCaporal(CaporalValidator.STRING, true, opt)).toEqual("true")
    expect(validateWithCaporal(CaporalValidator.STRING, false, opt)).toEqual("false")
    expect(() =>
      validateWithCaporal(CaporalValidator.STRING, ["hello"], arg),
    ).toThrowError(ValidationError)
    expect(() =>
      validateWithCaporal(CaporalValidator.STRING, ["hello"], opt),
    ).toThrowError(ValidationError)
  })

  it("should work with an boolean validator", () => {
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, true, arg)).toEqual(true)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, true, opt)).toEqual(true)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, false, arg)).toEqual(false)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, false, opt)).toEqual(false)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, 1, arg)).toEqual(true)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, 1, opt)).toEqual(true)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, 0, arg)).toEqual(false)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, 0, opt)).toEqual(false)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, "true", arg)).toEqual(true)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, "true", opt)).toEqual(true)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, "false", arg)).toEqual(false)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, "false", opt)).toEqual(false)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, "yes", arg)).toEqual(true)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, "yes", opt)).toEqual(true)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, "no", arg)).toEqual(false)
    expect(validateWithCaporal(CaporalValidator.BOOLEAN, "no", opt)).toEqual(false)
    expect(() =>
      validateWithCaporal(CaporalValidator.BOOLEAN, ["hello"], arg),
    ).toThrowError(ValidationError)

    expect(() =>
      validateWithCaporal(CaporalValidator.BOOLEAN, ["hello"], opt),
    ).toThrowError(ValidationError)

    expect(() =>
      validateWithCaporal(CaporalValidator.BOOLEAN, "unknown", arg),
    ).toThrowError(ValidationError)

    expect(() =>
      validateWithCaporal(CaporalValidator.BOOLEAN, "unknown", opt),
    ).toThrowError(ValidationError)

    expect(() => validateWithCaporal(CaporalValidator.BOOLEAN, 2, arg)).toThrowError(
      ValidationError,
    )

    expect(() => validateWithCaporal(CaporalValidator.BOOLEAN, 2, opt)).toThrowError(
      ValidationError,
    )
  })
})
