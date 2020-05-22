/**
 * @packageDocumentation
 * @internal
 */
import type { TemplateContext, Template } from "../types"

export const header: Template = (ctx: TemplateContext) => {
  const { prog, chalk: c, spaces, eol, eol2 } = ctx
  const version = process.env?.NODE_ENV === "test" ? "" : prog.getVersion()
  return (
    eol +
    spaces +
    (prog.getName() || prog.getBin()) +
    " " +
    (version || "") +
    (prog.getDescription() ? " \u2014 " + c.dim(prog.getDescription()) : "") +
    eol2
  )
}
