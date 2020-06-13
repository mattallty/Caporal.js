/**
 * @packageDocumentation
 * @internal
 */
import type { TemplateContext, Template } from "../types"
import { getOptionsTable, getCommandsTable } from "../utils"

export const program: Template = async (ctx: TemplateContext) => {
  const { prog, globalOptions, eol, eol3, colorize, tpl } = ctx
  const commands = prog.getCommands()
  const options = Array.from(globalOptions.keys())
  const help =
    (await prog.getSynopsis()) +
    eol3 +
    (await tpl("custom", ctx)) +
    getCommandsTable(commands, ctx) +
    eol +
    getOptionsTable(options, ctx, "GLOBAL OPTIONS")

  return colorize(help)
}
