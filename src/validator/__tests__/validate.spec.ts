import { validate } from "../validate"
import { createArgument } from "../../argument"
import { FunctionValidator } from "../../types"

describe("validate()", () => {
  const arg = createArgument("<fake>", "Fake arg")
  it("should handle function validators", () => {
    const validator: FunctionValidator = function (value) {
      if (value !== "hey" && value !== "ho") {
        throw Error("my error")
      }
      return value
    }
    return expect(validate("hey", validator, arg)).resolves.toEqual("hey")
  })
  it("should handle regexp validators", () => {
    return expect(validate("TEST", /[A-Z]+/, arg)).toEqual("TEST")
  })
  it("should handle unknown validators", () => {
    return expect(validate("TEST", 1000, arg)).toEqual("TEST")
  })
})
