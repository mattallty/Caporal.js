/**
 * @packageDocumentation
 * @internal
 */
import type { TemplateContext, Template } from "../types"

export const custom: Template = (ctx: TemplateContext) => {
  const { prog, cmd, eol3, colorize, customHelp, indent } = ctx
  const data = customHelp.get(cmd || prog)
  if (data) {
    const txt = data
      .map(({ text }) => {
        return text + eol3
      })
      .join("")
    return indent(colorize(txt)) + eol3
  }
  return ""
}
