/**
 * @packageDocumentation
 * @module caporal/autocomplete
 */
import tabtab from "tabtab"
import { parseArgv } from "../parser"
import { Program } from "../program"
import { removeCommandFromArgs } from "../argument/validate"
import { Argument, Option } from "../types"
import { Command } from "../command"
import { isOptionObject } from "../option"
import { findCommand } from "../command/find"
import filter from "lodash/filter"
import flatMap from "lodash/flatMap"

import { Completions, Completer, CompletionItem, CompletionContext } from "./types"

const completions: Completions = new Map()

/**
 * Register a completion handler
 *
 * @param {Argument|Option} arg_or_opt argument or option to complete
 * @param {Function} completer
 */
export function registerCompletion(
  argOrOpt: Argument | Option,
  completer: Completer,
): void {
  completions.set(argOrOpt, completer)
}

export async function installCompletion(program: Program): Promise<void> {
  return tabtab.install({
    name: program.getBin(),
    completer: program.getBin(),
  })
}

export async function uninstallCompletion(program: Program): Promise<void> {
  return tabtab.uninstall({
    name: program.getBin(),
  })
}

/**
 * Called by tabtab
 */
export async function complete(
  program: Program,
  { env, argv } = { env: process.env, argv: process.argv },
): Promise<CompletionItem[] | false> {
  const compEnv = tabtab.parseEnv(env)
  if (!compEnv.complete) {
    return false
  }

  const ctx = await getContext(program, compEnv, argv)
  const compPromises = [
    getCompCommands(ctx),
    getCompArgValues(ctx),
    getCompOptNames(ctx),
    getCompOptValues(ctx),
  ]

  const comps = flatMap(await Promise.all(compPromises))
  tabtab.log(comps)

  return comps
}

async function getContext(
  program: Program,
  compEnv: tabtab.TabtabEnv,
  argv: string[],
): Promise<CompletionContext> {
  const { lastPartial } = compEnv
  argv = argv.slice(4)
  const currentCmd = await findCommand(program, argv)
  const parserResult = parseArgv(currentCmd?.getParserConfig(), argv)
  const lastPartIsOpt = lastPartial.startsWith("-")
  const lastPartIsKnownOpt = Boolean(
    lastPartIsOpt && currentCmd && getLastPartIsKnownOpt(currentCmd, lastPartial),
  )
  const currentOpt = currentCmd
    ? currentCmd.options.find((o) => o.allNames.includes(lastPartial))
    : undefined

  const ctx = {
    program,
    currentCmd,
    compEnv,
    parserResult,
    lastPartIsOpt,
    lastPartIsKnownOpt,
    currentOpt,
  }
  return ctx
}

async function getCompCommands(ctx: CompletionContext): Promise<CompletionItem[]> {
  const {
    compEnv: { line },
    program,
    currentCmd,
  } = ctx
  const commandMatch = (cmd: Command, str: string): boolean => {
    return cmd.name.startsWith(str) || cmd.getAliases().some((a) => a.startsWith(str))
  }
  let commands = await program.getAllCommands()
  commands = filter(commands, (cmd) => commandMatch(cmd, line) && cmd !== currentCmd)
  return commands.map((cmd) => ({
    name: cmd.name,
    description: cmd.description,
  }))
}

async function getCompOptNames(ctx: CompletionContext): Promise<CompletionItem[]> {
  const {
    compEnv: { lastPartial },
    currentCmd,
  } = ctx

  if (!currentCmd) {
    return []
  }

  const matchOptionName = (o: Option): boolean => {
    return Boolean(
      (o.shortNotation != lastPartial && o.shortNotation?.startsWith(lastPartial)) ||
        (o.longNotation != lastPartial && o.longNotation?.startsWith(lastPartial)),
    )
  }

  return filter(currentCmd.options, matchOptionName).map((opt) => ({
    name: opt.notation,
    description: opt.description,
  }))
}

async function getCompOptValues(ctx: CompletionContext): Promise<CompletionItem[]> {
  const { currentOpt } = ctx
  if (!currentOpt) {
    return []
  }
  // Choices
  if (currentOpt.choices.length) {
    return currentOpt.choices.map((choice) => ({
      name: choice.toString(),
      description: "Value for option " + currentOpt.synopsis,
    }))
  }

  // Promise completion
  const completer = completions.get(currentOpt)
  if (completer) {
    return hanldleCompleter(ctx, completer, currentOpt)
  }

  return []
}

async function getCompArgValues(ctx: CompletionContext): Promise<CompletionItem[]> {
  const {
    compEnv: { lastPartial },
    parserResult: { args },
    currentCmd,
    lastPartIsOpt,
  } = ctx

  if (!currentCmd || lastPartIsOpt) {
    return []
  }

  const formatedArgs = currentCmd.isProgramCommand()
    ? args
    : removeCommandFromArgs(currentCmd, args)

  const argsCount = formatedArgs.length
  const arg = currentCmd.args[argsCount]

  if (!arg) {
    return []
  }

  // Choices
  if (arg.choices.length) {
    return arg.choices
      .map((choice) => ({
        name: choice.toString(),
        description: "Value for argument " + arg.synopsis,
      }))
      .filter((choice) => !lastPartial || choice.name.toString().startsWith(lastPartial))
  }

  // Promise completion
  const completion = completions.get(arg)
  if (completion) {
    return hanldleCompleter(ctx, completion, arg)
  }

  return []
}

async function hanldleCompleter(
  ctx: CompletionContext,
  completer: Completer,
  argOrOpt: Argument | Option,
): Promise<CompletionItem[]> {
  const type = isOptionObject(argOrOpt) ? "option" : "argument"
  const res = await completer(ctx)
  return res.map((item) => {
    if (typeof item === "object") {
      return item
    }
    return {
      name: "" + item,
      description: `Value for ${type} ${argOrOpt.synopsis}`,
    }
  })
}

function getLastPartIsKnownOpt(cmd: Command, lastPartial: string): boolean {
  return cmd.options.some((o) => o.allNames.includes(lastPartial))
}
