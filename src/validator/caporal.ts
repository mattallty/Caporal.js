/**
 * @packageDocumentation
 * @internal
 */

import type { ParserTypes, Argument, Option } from "../types"
import { CaporalValidator } from "../types"
import { ValidationError } from "../error"
import { isNumeric } from "../option/utils"
import flatMap from "lodash/flatMap"

import {
  isNumericValidator,
  isStringValidator,
  isBoolValidator,
  isArrayValidator,
} from "./utils"

// Re-export for convenience
export { CaporalValidator }

export function validateWithCaporal(
  validator: CaporalValidator,
  value: ParserTypes | ParserTypes[],
  context: Argument | Option,
  skipArrayValidation = false,
): ParserTypes | ParserTypes[] {
  if (!skipArrayValidation && isArrayValidator(validator)) {
    return validateArrayFlag(validator, value, context)
  } else if (Array.isArray(value)) {
    // should not happen!
    throw new ValidationError({
      error: "Expected a scalar value, got an array",
      value,
      validator,
      context,
    })
  } else if (isNumericValidator(validator)) {
    return validateNumericFlag(validator, value, context)
  } else if (isStringValidator(validator)) {
    return validateStringFlag(value)
  } else if (isBoolValidator(validator)) {
    return validateBoolFlag(value, context)
  }
  return value
}

/**
 * The string validator actually just cast the value to string
 *
 * @param value
 * @ignore
 */
export function validateBoolFlag(
  value: ParserTypes,
  context: Argument | Option,
): boolean {
  if (typeof value === "boolean") {
    return value
  } else if (/^(true|false|yes|no|0|1)$/i.test(String(value)) === false) {
    throw new ValidationError({
      value,
      validator: CaporalValidator.BOOLEAN,
      context,
    })
  }
  return /^0|no|false$/.test(String(value)) === false
}

export function validateNumericFlag(
  validator: number,
  value: ParserTypes,
  context: Argument | Option,
): number {
  const str = value + ""
  if (Array.isArray(value) || !isNumeric(str)) {
    throw new ValidationError({
      value,
      validator,
      context,
    })
  }
  return parseFloat(str)
}

export function validateArrayFlag(
  validator: number,
  value: ParserTypes | ParserTypes[],
  context: Argument | Option,
): ParserTypes | ParserTypes[] {
  const values: ParserTypes[] =
    typeof value === "string" ? value.split(",") : !Array.isArray(value) ? [value] : value
  return flatMap(values, (el) => validateWithCaporal(validator, el, context, true))
}

/**
 * The string validator actually just cast the value to string
 *
 * @param value
 * @ignore
 */
export function validateStringFlag(value: ParserTypes | ParserTypes[]): string {
  return value + ""
}
