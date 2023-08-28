import { checkValidator, getTypeHint } from "../utils"
import { createOption } from "../../option"
import { InvalidValidatorError } from "../../error"
import { CaporalValidator } from "../../types"
import isNumber from "lodash/isNumber"
import { expect, it, describe } from "vitest"

const validators = Object.values(CaporalValidator).filter(isNumber)

describe("validator / utils", () => {
  describe("checkValidator()", () => {
    it("should throw InvalidValidatorError for an invalid Caporal Validator", () => {
      // @ts-expect-error for tests
      expect(() => checkValidator(1001)).toThrowError(InvalidValidatorError)
    })
    it("should throw InvalidValidatorError for all valid Caporal Validators", () => {
      // @ts-expect-error for tests
      expect(() => checkValidator(1001)).toThrowError(InvalidValidatorError)
    })
    it.each(validators)("should not throw for %d", (v) => {
      expect(() => checkValidator(v)).not.toThrowError(InvalidValidatorError)
    })

    it("should throw for an invalid caporal validator", () => {
      // @ts-expect-error for tests
      expect(() => checkValidator(1000)).toThrowError(InvalidValidatorError)
    })

    it("should throw for an invalid user defined validator", () => {
      // @ts-expect-error for tests
      expect(() => checkValidator("wrong")).toThrowError(InvalidValidatorError)
    })
  })

  describe("getTypeHint()", () => {
    it("should return 'boolean' for a boolean option whose default is true", () => {
      const opt = createOption("--use-this", "Use this", { default: true })
      expect(getTypeHint(opt)).toBe("boolean")
    })
    it("should return a JSON for an array-validator", () => {
      const opt = createOption("--name <name>", "Your name", {
        validator: ["john", "jesse"],
      })
      expect(getTypeHint(opt)).toBe('one of "john","jesse"')
    })
    it("should return undefined for an array-validator if the JSON representation is too long", () => {
      const arr = new Array(120).fill("str".repeat(15))
      const opt = createOption("--name <name>", "Your name", {
        validator: arr,
      })
      expect(getTypeHint(opt)).toBeUndefined()
    })
    it("should throw InvalidValidatorError for all valid Caporal Validators", () => {
      // @ts-expect-error for tests
      expect(() => checkValidator(1001)).toThrowError(InvalidValidatorError)
    })

    it.each(validators)("should not throw for %d", (v) => {
      expect(() => checkValidator(v)).not.toThrowError(InvalidValidatorError)
    })

    it("should throw for an invalid user defined validator", () => {
      // @ts-expect-error for tests
      expect(() => checkValidator("wrong")).toThrowError(InvalidValidatorError)
    })
  })
})
