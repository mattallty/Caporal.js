/**
 * @packageDocumentation
 * @internal
 */

import reduce from "lodash/reduce"
import { findOption } from "./find"
import { MissingFlagError, UnknownOptionError, BaseError } from "../error"
import { findGlobalOption } from "."
import { validate } from "../validator/validate"

import type { ParsedOption, ParsedOptions, Promisable, Option } from "../types"
import type { Command } from "../command"

function validateOption(opt: Option, value: ParsedOption): ReturnType<typeof validate> {
  return opt.validator ? validate(value, opt.validator, opt) : value
}

export function checkRequiredOpts(cmd: Command, opts: ParsedOptions): BaseError[] {
  return cmd.options.reduce((acc, opt) => {
    if (opts[opt.name] === undefined && opt.required) {
      acc.push(new MissingFlagError(opt, cmd))
    }
    return acc
  }, [] as BaseError[])
}

function applyDefaults(cmd: Command, opts: ParsedOptions): ParsedOptions {
  return cmd.options.reduce((acc, opt) => {
    if (acc[opt.name] === undefined && opt.default !== undefined) {
      acc[opt.name] = opt.default
    }
    return acc
  }, opts)
}

type OptionsPromises = Record<string, Promisable<ParsedOption>>

interface OptionsValidationResult {
  options: ParsedOptions
  errors: BaseError[]
}

export async function validateOptions(
  cmd: Command,
  options: ParsedOptions,
): Promise<OptionsValidationResult> {
  options = applyDefaults(cmd, options)
  const errors: BaseError[] = []
  const validations = reduce(
    options,
    (...args) => {
      const [acc, value, name] = args
      const opt = findGlobalOption(name) || findOption(cmd, name)
      try {
        if (opt) {
          acc[name] = validateOption(opt, value)
        } else if (cmd.strictOptions) {
          throw new UnknownOptionError(name, cmd)
        }
      } catch (e) {
        errors.push(e as BaseError)
      }
      return acc
    },
    {} as OptionsPromises,
  )
  const result = await reduce(
    validations,
    async (prevPromise, value, key): Promise<ParsedOptions> => {
      const collection = await prevPromise
      collection[key] = await value
      return collection
    },
    Promise.resolve({}) as Promise<ParsedOptions>,
  )

  errors.push(...checkRequiredOpts(cmd, result))
  return { options: result, errors }
}
