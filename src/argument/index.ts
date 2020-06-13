/**
 * @packageDocumentation
 * @internal
 */
import type { Argument, CreateArgumentOpts } from "../types"
import { checkValidator, getTypeHint } from "../validator/utils"
import { parseArgumentSynopsis } from "./synopsis"

/**
 *
 * @param synopsis - Argument synopsis
 * @param description - Argument description
 * @param [options] - Various argument options like validator and default value
 */
export function createArgument(
  synopsis: string,
  description: string,
  options: CreateArgumentOpts = {},
): Argument {
  const { validator, default: defaultValue } = options
  checkValidator(validator)

  const syno = parseArgumentSynopsis(synopsis)
  const arg: Argument = {
    kind: "argument",
    default: defaultValue,
    description,
    choices: Array.isArray(validator) ? validator : [],
    validator,
    ...syno,
  }
  arg.typeHint = getTypeHint(arg)

  return arg
}
