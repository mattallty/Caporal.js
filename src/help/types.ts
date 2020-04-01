/**
 * @packageDocumentation
 * @module caporal/types
 */
import { Command } from "../command"
import { Program } from "../program"
import chalk from "chalk"
import { colorize } from "../utils/colorize"
import { buildTable } from "./utils"
import type { GlobalOptions } from "../types"

export interface CustomizedHelpOpts {
  /**
   * Name of the section to be added in help.
   */
  sectionName: string
  /**
   * Enable or disable the automatic coloration of text.
   */
  colorize: boolean
}
export interface CustomizedHelp {
  /**
   * Various display options.
   */
  options: CustomizedHelpOpts
  /**
   * Help text. Padding of the text is automatically handled for you.
   */
  text: string
}

export type CustomizedHelpMap = Map<Command | Program, CustomizedHelp[]>

export interface Template {
  (ctx: TemplateContext): Promise<string> | string
}

export interface TemplateFunction {
  (name: string, ctx: TemplateContext): Promise<string> | string
}

export interface TemplateContext {
  prog: Program
  cmd?: Command
  customHelp: CustomizedHelpMap
  globalOptions: GlobalOptions
  chalk: typeof chalk
  colorize: typeof colorize
  tpl: TemplateFunction
  table: typeof buildTable
  indent: (str: string) => string
  eol: string
  eol2: string
  eol3: string
  spaces: string
}
