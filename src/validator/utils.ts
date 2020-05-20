/**
 * @packageDocumentation
 * @internal
 */

import type { Validator } from "../types"
import { CaporalValidator, Argument, Option } from "../types"
import isNumber from "lodash/isNumber"
import { InvalidValidatorError } from "../error"

export function isCaporalValidator(
  validator: Validator | undefined,
): validator is number {
  if (typeof validator !== "number") {
    return false
  }
  const mask = getCaporalValidatorsMask()
  const exist = (mask & validator) === validator
  return exist
}

export function isNumericValidator(validator: Validator | undefined): boolean {
  return isCaporalValidator(validator) && Boolean(validator & CaporalValidator.NUMBER)
}

export function isStringValidator(validator: Validator | undefined): boolean {
  return isCaporalValidator(validator) && Boolean(validator & CaporalValidator.STRING)
}

export function isBoolValidator(validator: Validator | undefined): boolean {
  return isCaporalValidator(validator) && Boolean(validator & CaporalValidator.BOOLEAN)
}

export function isArrayValidator(validator: Validator | undefined): boolean {
  return isCaporalValidator(validator) && Boolean(validator & CaporalValidator.ARRAY)
}

function getCaporalValidatorsMask(): number {
  return Object.values(CaporalValidator)
    .filter(isNumber)
    .reduce((a, b) => a | b, 0)
}

function checkCaporalValidator(validator: CaporalValidator): void {
  if (!isCaporalValidator(validator)) {
    throw new InvalidValidatorError(validator)
  }
}

function checkUserDefinedValidator(validator: Validator): void {
  if (
    typeof validator !== "function" &&
    !(validator instanceof RegExp) &&
    !Array.isArray(validator)
  ) {
    throw new InvalidValidatorError(validator)
  }
}

export function checkValidator(validator: Validator | undefined): void {
  if (validator !== undefined) {
    typeof validator === "number"
      ? checkCaporalValidator(validator)
      : checkUserDefinedValidator(validator)
  }
}

export function getTypeHint(obj: Argument | Option): string | undefined {
  let hint
  if (
    isBoolValidator(obj.validator) ||
    ("boolean" in obj && obj.boolean && obj.default !== false)
  ) {
    hint = "boolean"
  } else if (isNumericValidator(obj.validator)) {
    hint = "number"
  } else if (Array.isArray(obj.validator)) {
    const stringified = JSON.stringify(obj.validator)
    if (stringified.length < 300) {
      hint = "one of " + stringified.substr(1, stringified.length - 2)
    }
  }
  return hint
}
