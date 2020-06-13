/**
 * @packageDocumentation
 * @internal
 */
import { ParserResult, ParserProcessedResult } from "../types"
import { validateArgs } from "../argument/validate"
import { validateOptions } from "../option/validate"
import type { Command } from "."

export async function validateCall(
  cmd: Command,
  result: ParserResult,
): Promise<ParserProcessedResult> {
  const { args: parsedArgs, options: parsedFlags } = result
  // check if there are some global flags to handle
  const { options: flags, errors: flagsErrors } = await validateOptions(cmd, parsedFlags)
  const { args, errors: argsErrors } = await validateArgs(cmd, parsedArgs)
  return { ...result, args, options: flags, errors: [...argsErrors, ...flagsErrors] }
}
