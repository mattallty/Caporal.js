import { validateWithFunction } from "../function"
import { createArgument } from "../../argument"
import { createOption } from "../../option"
import { ValidationError } from "../../error"
import { FunctionValidator } from "../../types"

describe("validateWithFunction()", () => {
  const validator: FunctionValidator = function (value) {
    if (value !== "hey" && value !== "ho") {
      throw Error("my error")
    }
    return value
  }
  const arg = createArgument("<fake>", "Fake arg", { validator })
  const opt = createOption("--file <file>", "File")

  it("should validate a valid value", async () => {
    await expect(validateWithFunction(validator, "hey", arg)).resolves.toEqual("hey")
    await expect(validateWithFunction(validator, "hey", opt)).resolves.toEqual("hey")
  })

  it("should throw for an invalid value", async () => {
    await expect(validateWithFunction(validator, "invalid", arg)).rejects.toBeInstanceOf(
      ValidationError,
    )
    await expect(validateWithFunction(validator, "invalid", opt)).rejects.toBeInstanceOf(
      ValidationError,
    )
  })
  it("should validate a valid array", async () => {
    await expect(validateWithFunction(validator, ["ho"], arg)).resolves.toEqual(["ho"])
    await expect(validateWithFunction(validator, ["ho"], opt)).resolves.toEqual(["ho"])
    await expect(validateWithFunction(validator, ["ho", "hey"], arg)).resolves.toEqual([
      "ho",
      "hey",
    ])
    await expect(validateWithFunction(validator, ["ho", "hey"], opt)).resolves.toEqual([
      "ho",
      "hey",
    ])
  })
  it("should throw for an invalid array", async () => {
    await expect(
      validateWithFunction(validator, ["invalid", "hey"], arg),
    ).rejects.toBeInstanceOf(ValidationError)

    await expect(
      validateWithFunction(validator, ["invalid", "hey"], opt),
    ).rejects.toBeInstanceOf(ValidationError)
  })
})
