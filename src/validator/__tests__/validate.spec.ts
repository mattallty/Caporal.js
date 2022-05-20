import { validate } from "../validate"
import { createArgument } from "../../argument"
import { FunctionValidator } from "../../types"

describe("validate()", () => {
  const arg = createArgument("<fake>", "Fake arg")
  it("should handle function validators", () => {
    const validator: FunctionValidator<string> = (value) => {
      if (value !== "hey" && value !== "ho") {
        throw Error("my error")
      }
      return value
    }
    return expect(validate("hey", validator, arg)).resolves.toEqual("hey")
  })
  it("should handle regexp validators", () =>
    expect(validate("TEST", /[A-Z]+/, arg)).toEqual("TEST"))
  it("should handle unknown validators", () =>
    expect(validate("TEST", 1000, arg)).toEqual("TEST"))
})
