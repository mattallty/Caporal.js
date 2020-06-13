/**
 * @packageDocumentation
 * @internal
 */

import { format } from "util"
import c from "chalk"
import { BaseError } from "./base"
import { Validator, ParserTypes, Argument, Option, CaporalValidator } from "../types"
import { isCaporalValidator } from "../validator/utils"

interface ValidationErrorParameters {
  value: ParserTypes | ParserTypes[]
  error?: Error | string
  validator: Validator
  context: Argument | Option
}

function isOptionObject(obj: Option | Argument): obj is Option {
  return "allNotations" in obj
}

export class ValidationError extends BaseError {
  constructor({ value, error, validator, context }: ValidationErrorParameters) {
    let message = error instanceof Error ? error.message : error
    const varName = isOptionObject(context) ? "option" : "argument"
    const name = isOptionObject(context)
      ? context.allNotations.join("|")
      : context.synopsis

    if (isCaporalValidator(validator)) {
      switch (validator) {
        case CaporalValidator.NUMBER:
          message = format(
            'Invalid value for %s %s.\nExpected a %s but got "%s".',
            varName,
            c.redBright(name),
            c.underline("number"),
            c.redBright(value),
          )
          break
        case CaporalValidator.BOOLEAN:
          message = format(
            'Invalid value for %s %s.\nExpected a %s (true, false, 0, 1), but got "%s".',
            varName,
            c.redBright(name),
            c.underline("boolean"),
            c.redBright(value),
          )
          break
        case CaporalValidator.STRING:
          message = format(
            'Invalid value for %s %s.\nExpected a %s, but got "%s".',
            varName,
            c.redBright(name),
            c.underline("string"),
            c.redBright(value),
          )
          break
      }
    } else if (Array.isArray(validator)) {
      message = format(
        'Invalid value for %s %s.\nExpected one of %s, but got "%s".',
        varName,
        c.redBright(name),
        "'" + validator.join("', '") + "'",
        c.redBright(value),
      )
    } else if (validator instanceof RegExp) {
      message = format(
        'Invalid value for %s %s.\nExpected a value matching %s, but got "%s".',
        varName,
        c.redBright(name),
        c.whiteBright(validator.toString()),
        c.redBright(value),
      )
    }
    super(message + "")
  }
}
