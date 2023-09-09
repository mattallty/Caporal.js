/**
 * @packageDocumentation
 * @internal
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { TemplateContext, Template } from "../types"
import { getOptionsTable, getArgumentsTable } from "../utils"
import sortBy from "lodash/sortBy"

export const command: Template = async (ctx: TemplateContext) => {
  const { cmd, globalOptions: globalFlags, eol, eol3, colorize, tpl } = ctx

  const options = sortBy(cmd!.options, "required"),
    globalOptions = Array.from(globalFlags.keys())

  const help =
    cmd!.synopsis +
    eol3 +
    (await tpl("custom", ctx)) +
    getArgumentsTable(cmd!.args, ctx) +
    eol +
    getOptionsTable(options, ctx) +
    eol +
    getOptionsTable(globalOptions, ctx, "GLOBAL OPTIONS")

  return colorize(help)
}
