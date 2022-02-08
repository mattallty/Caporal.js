/**
 * @packageDocumentation
 * @internal
 */

import type { ParserTypes, FunctionValidator, Argument, Option } from "../types"
import { ValidationError } from "../error"

export async function validateWithFunction(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validator: FunctionValidator<any>,
  value: ParserTypes | ParserTypes[],
  context: Argument | Option,
): Promise<ParserTypes | ParserTypes[]> {
  if (Array.isArray(value)) {
    return Promise.all(
      value.map((v) => {
        return validateWithFunction(validator, v, context) as Promise<ParserTypes>
      }),
    )
  }
  try {
    return await validator(value)
  } catch (error) {
    throw new ValidationError({
      validator,
      value,
      error,
      context,
    })
  }
}
