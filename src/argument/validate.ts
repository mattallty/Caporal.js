/**
 * @packageDocumentation
 * @internal
 */

import reduce from "lodash/reduce"
import { TooManyArgumentsError, MissingArgumentError, BaseError } from "../error"
import type {
  Argument,
  ArgumentsRange,
  ParsedArguments,
  ParsedArgumentsObject,
  ParsedArgument,
  Promisable,
} from "../types"

import type { Command } from "../command"
import { validate } from "../validator/validate"
import { findArgument } from "./find"

/**
 * Get the number of required argument for a given command
 *
 * @param cmd
 */
export function getRequiredArgsCount(cmd: Command): number {
  return cmd.args.filter((a) => a.required).length
}

export function getArgsObjectFromArray(
  cmd: Command,
  args: ParsedArguments,
): ParsedArgumentsObject {
  const result: ParsedArgumentsObject = {}
  return cmd.args.reduce((acc, arg, index) => {
    if (args[index] !== undefined) {
      acc[arg.name] = args[index]
    } else if (arg.default !== undefined) {
      acc[arg.name] = arg.default
    }
    return acc
  }, result)
}

/**
 * Check if the given command has at leat one variadic argument
 *
 * @param cmd
 */
export function hasVariadicArgument(cmd: Command): boolean {
  return cmd.args.some((a) => a.variadic)
}

export function getArgsRange(cmd: Command): ArgumentsRange {
  const min = getRequiredArgsCount(cmd)
  const max = hasVariadicArgument(cmd) ? Infinity : cmd.args.length
  return { min, max }
}

export function checkRequiredArgs(
  cmd: Command,
  args: ParsedArgumentsObject,
  parsedArgv: ParsedArguments,
): BaseError[] {
  const errors = cmd.args.reduce((acc, arg) => {
    if (args[arg.name] === undefined && arg.required) {
      acc.push(new MissingArgumentError(arg, cmd))
    }
    return acc
  }, [] as BaseError[])

  // Check if there is more args than specified
  if (cmd.strictArgsCount) {
    const numArgsError = checkNumberOfArgs(cmd, parsedArgv)
    if (numArgsError) {
      errors.push(numArgsError)
    }
  }

  return errors
}

function checkNumberOfArgs(
  cmd: Command,
  args: ParsedArguments,
): TooManyArgumentsError | void {
  const range = getArgsRange(cmd)
  const argsCount = Object.keys(args).length
  if (range.max !== Infinity && range.max < Object.keys(args).length) {
    return new TooManyArgumentsError(cmd, range, argsCount)
  }
}

export function removeCommandFromArgs(
  cmd: Command,
  args: ParsedArguments,
): ParsedArguments {
  const words = cmd.name.split(" ").length
  return args.slice(words)
}

function validateArg(arg: Argument, value: ParsedArgument): ReturnType<typeof validate> {
  return arg.validator ? validate(value, arg.validator, arg) : value
}

type VariadicArgument = ParsedArgument
type ArgsValidatorAccumulator = Record<string, Promisable<VariadicArgument>>

interface ArgsValidationResult {
  args: ParsedArgumentsObject
  errors: BaseError[]
}

/**
 *
 * @param cmd
 * @param parsedArgv
 *
 * @todo Bugs:
 *
 *
 * ts-node examples/pizza/pizza.ts cancel my-order jhazd hazd
 *
 * -> result ok, should be too many arguments
 *
 */
export async function validateArgs(
  cmd: Command,
  parsedArgv: ParsedArguments,
): Promise<ArgsValidationResult> {
  // remove the command from the argv array
  const formatedArgs = cmd.isProgramCommand()
    ? parsedArgv
    : removeCommandFromArgs(cmd, parsedArgv)

  // transfrom args array to object, and set defaults for arguments not passed
  const argsObj = getArgsObjectFromArray(cmd, formatedArgs)
  const errors: BaseError[] = []

  const validations = reduce(
    argsObj,
    (acc, value, key) => {
      const arg = findArgument(cmd, key)
      try {
        /* istanbul ignore if -- should not happen */
        if (!arg) {
          throw new BaseError(`Unknown argumment ${key}`)
        }
        acc[key] = validateArg(arg, value)
      } catch (e) {
        errors.push(e)
      }
      return acc
    },
    {} as ArgsValidatorAccumulator,
  )

  const result = await reduce(
    validations,
    async (prevPromise, value, key): Promise<ParsedArgumentsObject> => {
      const collection = await prevPromise
      collection[key] = await value
      return collection
    },
    Promise.resolve({}) as Promise<ParsedArgumentsObject>,
  )

  errors.push(...checkRequiredArgs(cmd, result, formatedArgs))

  return { args: result, errors }
}
