/**
 * This is the command line parser internaly used by Caporal.
 *
 * ::: tip No need to use this!
 * Usually, **you won't need to use the parser** directly, but if you
 * just want to parse some args without all capabilities brought
 * by Caporal, feel free to play with it.
 * :::
 *
 * ## Usage
 *
 * ```ts
 * import { parseArgv } from "caporal/parser"
 *
 * const {args, options} = parseArgv({
 *  // ... options
 * })
 * ```
 *
 * @packageDocumentation
 * @module caporal/parser
 */

import invert from "lodash/invert"
import findIndex from "lodash/findIndex"
import type {
  ParserOptions,
  ParserResult,
  ParserTypes,
  ParsedOptions,
  ParsedArguments,
} from "../types"
import {
  isNumeric,
  isConcatenatedOpt,
  isNegativeOpt,
  isOptionStr,
  formatOptName,
  isOptArray,
} from "../option/utils"

const DDASH = "--"

function isDdash(str?: string): str is string {
  return str === DDASH
}

function castAsBool(value: string | boolean): boolean {
  if (typeof value === "boolean") {
    return value
  }
  return /^true|1|yes|on$/.test(value)
}

function castAsString(val: string | boolean): string {
  return val + ""
}

function autoCast(val: string): ParserTypes {
  // auto-casting "true" & "false"
  if (/^true|false$/.test(val)) {
    return val === "true"
  }
  // auto-casting numbers
  return isNumeric(val) ? parseFloat(val) : val
}

function cast(name: string, val: string | true, options: ParserOptions): ParserTypes {
  const cleanName = formatOptName(name)

  // Force casting to string
  if (options.string.includes(cleanName)) {
    return castAsString(val)
  }

  // Force casting to bool
  if (options.boolean.includes(cleanName) || typeof val === "boolean") {
    return castAsBool(val)
  }

  return options.autoCast ? autoCast(val) : val
}

/**
 * Parse a line
 *
 * @param line Line to be parsed
 * @param options Parser options
 * @internal
 */
export function parseLine(
  line: string,
  options: Partial<ParserOptions> = {},
): ParserResult {
  return parseArgv(options, line.split(" "))
}
/**
 *
 * @param args Return the next option position unless there is some ddash before
 */
function getNextOptPosition(args: string[]): number {
  const ddash = args.indexOf("--")
  const opt = findIndex(args, isOptionStr)
  return ddash < opt && ddash !== -1 ? -1 : opt
}

class Tree {
  cursor: number
  private ddashHandled = false

  constructor(private argv: string[]) {
    this.cursor = 0
  }

  /* istanbul ignore next */
  toJSON(): {
    cursor: number
    ddashHandled: boolean
    argv: string[]
    current?: string
  } {
    return {
      cursor: this.cursor,
      ddashHandled: this.ddashHandled,
      current: this.current,
      argv: this.argv,
    }
  }

  markDdashHandled(): Tree {
    this.ddashHandled = true
    return this
  }

  hasDdashHandled(): boolean {
    return this.ddashHandled
  }

  next(): string | undefined {
    return this.argv[this.cursor + 1]
  }

  slice(start?: number, end?: number): string[] {
    return this.argv.slice(start, end)
  }

  sliceFromHere(end?: number): string[] {
    return this.slice(this.cursor, end)
  }

  forward(by = 1): true {
    if (by === -1) {
      return this.end()
    }
    this.cursor += by
    return true
  }

  end(): true {
    this.cursor = this.length
    return true
  }

  get current(): string | undefined {
    return this.argv[this.cursor]
  }

  get length(): number {
    return this.argv.length
  }
}

class ArgumentParser {
  public readonly args: ParsedArguments = []
  public readonly ddash: ParsedArguments = []
  public readonly rawArgv: string[]
  public readonly line: string
  private variadicId?: number
  private key: "args" | "ddash" = "args"

  constructor(private config: ParserOptions, argv: string[]) {
    this.line = argv.join(" ")
    this.rawArgv = argv
  }

  toJSON(): {
    args: ParsedArguments
    ddash: ParsedArguments
    rawArgv: string[]
    line: string
  } {
    return {
      args: this.args,
      ddash: this.ddash,
      rawArgv: this.rawArgv,
      line: this.line,
    }
  }

  inVariadicContext(): boolean | undefined {
    const argsLen = this[this.key].length
    if (this.config.variadic.includes(argsLen)) {
      this.variadicId = argsLen
    }
    if (this.variadicId !== undefined) {
      return true
    }
  }

  markDdashHandled(tree: Tree): true {
    if (this.config.ddash) {
      // if ddash enabled, update the key
      this.key = "ddash"
    }
    return tree.markDdashHandled().forward()
  }

  push(...values: string[]): true {
    this[this.key].push(...values.map(this.config.autoCast ? autoCast : String))
    return true
  }

  pushVariadic(tree: Tree): true {
    const args = tree.sliceFromHere()
    const until = getNextOptPosition(args)
    this.variadicId = this.variadicId || 0
    const variadic = (this[this.key][this.variadicId] =
      (this[this.key][this.variadicId] as ParserTypes[]) || [])

    variadic.push(
      ...args
        .slice(0, until === -1 ? undefined : until)
        .filter((s: string) => !isDdash(s))
        .map(this.config.autoCast ? autoCast : String),
    )

    return tree.forward(until)
  }

  visit(tree: Tree): unknown {
    if (!tree.current || (isOptionStr(tree.current) && !tree.hasDdashHandled())) {
      return false
    }
    if (isDdash(tree.current)) {
      return this.markDdashHandled(tree)
    } else if (!this.inVariadicContext()) {
      this.push(tree.current)
      return tree.forward()
    }
    return this.pushVariadic(tree)
  }
}

class OptionParser {
  public readonly options: ParsedOptions = {}
  public readonly rawOptions: ParsedOptions = {}

  constructor(private config: ParserOptions) {}

  toJSON(): {
    options: ParsedOptions
    rawOptions: ParsedOptions
  } {
    return {
      options: this.options,
      rawOptions: this.rawOptions,
    }
  }

  handleOptWithoutValue(name: string, tree: Tree): void {
    const next = tree.next()
    const nextIsOptOrUndef = isOptionStr(next) || isDdash(next) || next === undefined
    this.compute(
      name,
      cast(name, nextIsOptOrUndef ? true : (next as string), this.config),
    )
    if (!nextIsOptOrUndef) {
      tree.forward()
    }
  }

  handleConcatenatedOpts(tree: Tree, names: string[], val?: ParserTypes): void {
    if (val === undefined) {
      val = true
      const next = tree.next()
      const last = names[names.length - 1]
      const alias = this.config.alias[last]
      const shouldTakeNextAsVal =
        next && !isOptionStr(next) && !isDdash(next) && !this.isBoolean(last, alias)
      if (shouldTakeNextAsVal) {
        tree.forward()
        val = next as string
      }
    }
    this.computeMulti(names, val)
  }

  visit(tree: Tree): boolean {
    // only handle options
    /* istanbul ignore if */
    if (!tree.current || !isOptionStr(tree.current) || tree.hasDdashHandled()) {
      // this is never reached because the scan stops if
      // a visior returns true, and as the Argument visitor is the first in the
      // list, arguments objects never reach the Options visitor
      // keeping it here in case we change the order of visitors
      return false
    }

    const [name, rawval] = tree.current.split("=", 2)
    const concatOpts = isConcatenatedOpt(name)

    if (concatOpts) {
      this.handleConcatenatedOpts(tree, concatOpts, rawval)
    } else if (rawval) {
      this.compute(name, cast(name, rawval, this.config))
    } else {
      this.handleOptWithoutValue(name, tree)
    }

    return tree.forward()
  }

  compute(name: string, val: ParserTypes): void {
    const no = isNegativeOpt(name)
    const cleanName = formatOptName(name)
    const alias = this.config.alias[cleanName]

    if (this.isVariadic(cleanName, alias)) {
      const prop = this.options[cleanName]
      this.rawOptions[name] = this.options[cleanName] = (isOptArray(prop)
        ? prop
        : [prop]
      ).concat(val)
    } else {
      this.rawOptions[name] = this.options[cleanName] = no ? !val : val
    }
    if (alias) {
      this.options[alias] = this.options[cleanName]
    }
  }

  // todo: handle variadic, even for compute multi
  // TIP: (maybe just split and redirect the last char to compute())
  computeMulti(multi: string[], val: ParserTypes): void {
    const n = multi.length
    multi.forEach((o, index) => {
      const alias = this.config.alias[o]
      this.options[o] = index + 1 === n ? cast(o, val as string, this.config) : true
      this.rawOptions["-" + o] = this.options[o]
      if (alias) {
        this.options[alias] = this.options[o]
      }
    })
  }

  isVariadic(name: string, alias: string): boolean {
    return (
      name in this.options &&
      (this.config.variadic.includes(name) || this.config.variadic.includes(alias))
    )
  }

  isBoolean(name: string, alias: string): boolean {
    return this.config.boolean.includes(name) || this.config.boolean.includes(alias)
  }
}

/**
 * Parse command line arguments
 *
 * @param options Parser options
 * @param argv command line arguments array (a.k.a. "argv")
 */
export function parseArgv(
  options: Partial<ParserOptions> = {},
  argv: string[] = process.argv.slice(2),
): ParserResult {
  const parseOpts: ParserOptions = {
    autoCast: true,
    ddash: false,
    alias: {},
    boolean: [],
    string: [],
    variadic: [],
    ...options,
  }
  parseOpts.alias = { ...parseOpts.alias, ...invert(parseOpts.alias) }

  const tree = new Tree(argv)
  const flagParser = new OptionParser(parseOpts)
  const argParser = new ArgumentParser(parseOpts, argv)
  const visitors = [argParser, flagParser]

  while (tree.current) {
    visitors.some((v) => v.visit(tree))
  }

  return { ...flagParser.toJSON(), ...argParser.toJSON() }
}
