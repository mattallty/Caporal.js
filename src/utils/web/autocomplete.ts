/**
 * Autocomplete mock for caporal-web
 *
 * @packageDocumentation
 * @internal
 */
import type { Program } from "../../program"
import type { Argument, Option } from "../../types"
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function registerCompletion(
  argOrOpt: Argument | Option,
  completer: () => unknown,
) {}

export async function installCompletion(program: Program): Promise<void> {}

export async function uninstallCompletion(program: Program): Promise<void> {}
