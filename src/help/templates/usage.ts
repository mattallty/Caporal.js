/**
 * @packageDocumentation
 * @internal
 */
import type { TemplateContext, Template } from "../types"

export const usage: Template = async (ctx: TemplateContext) => {
  const { tpl, prog, chalk: c, spaces, eol } = ctx
  let { cmd } = ctx

  // if help is asked without a `cmd` and that no command exists
  // within the program, override `cmd` with the program-command
  if (!cmd && !(await prog.hasCommands())) {
    ctx.cmd = cmd = prog.progCommand
  }

  // usage
  const usage = `${spaces + c.bold("USAGE")} ${cmd?.name ? "— " + c.dim(cmd.name) : ""}
  ${eol + spaces + spaces + c.dim("\u25B8")} `

  const next = cmd ? await tpl("command", ctx) : await tpl("program", ctx)

  return usage + next
}
