import { checkValidator, getTypeHint } from "../utils"
import { createOption } from "../../option"
import { InvalidValidatorError } from "../../error"
import { CaporalValidator } from "../../types"
import isNumber from "lodash/isNumber"

const validators = Object.values(CaporalValidator).filter(isNumber)

describe("validator / utils", () => {
  describe("checkValidator()", () => {
    it("should throw InvalidValidatorError for an invalid Caporal Validator", () => {
      expect(() => checkValidator(1001)).toThrowError(InvalidValidatorError)
    })
    it("should throw InvalidValidatorError for all valid Caporal Validators", () => {
      expect(() => checkValidator(1001)).toThrowError(InvalidValidatorError)
    })
    test.each(validators)("should not throw for %d", (v) => {
      expect(() => checkValidator(v)).not.toThrowError(InvalidValidatorError)
    })

    it("should throw for an invalid caporal validator", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(() => checkValidator(1000)).toThrowError(InvalidValidatorError)
    })

    it("should throw for an invalid user defined validator", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
      expect(() => checkValidator(1001)).toThrowError(InvalidValidatorError)
    })
    test.each(validators)("should not throw for %d", (v) => {
      expect(() => checkValidator(v)).not.toThrowError(InvalidValidatorError)
    })

    it("should throw for an invalid user defined validator", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(() => checkValidator("wrong")).toThrowError(InvalidValidatorError)
    })
  })
})
