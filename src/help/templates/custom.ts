/**
 * @packageDocumentation
 * @internal
 */
import type { TemplateContext, Template } from "../types"

export const custom: Template = (ctx: TemplateContext) => {
  const { prog, cmd, eol2, eol3, chalk, colorize, customHelp, indent } = ctx
  const data = customHelp.get(cmd || prog)
  if (data) {
    const txt = data
      .map(({ text, options }) => {
        let str = ""
        if (options.sectionName) {
          str += chalk.bold(options.sectionName) + eol2
        }
        const subtxt = options.colorize ? colorize(text) : text
        str += options.sectionName ? indent(subtxt) : subtxt
        return str + eol3
      })
      .join("")
    return indent(txt) + eol3
  }
  return ""
}
