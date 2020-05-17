/**
 * @packageDocumentation
 * @internal
 */
import { table, getBorderCharacters } from "table"
import filter from "lodash/filter"
import type { TemplateContext } from "./types"
import type { Option, Argument } from "../types"
import type { Command } from "../command"

export function buildTable(data: string[][], options = {}): string {
  return table(data, {
    border: getBorderCharacters(`void`),
    columnDefault: {
      paddingLeft: 0,
      paddingRight: 2,
    },
    columns: {
      0: {
        paddingLeft: 4,
        width: 35,
      },
      1: {
        width: 55,
        wrapWord: true,
        paddingRight: 0,
      },
    },
    drawHorizontalLine: () => {
      return false
    },
    ...options,
  })
}

export function getDefaultValueHint(obj: Argument | Option): string | undefined {
  return obj.default !== undefined &&
    !("boolean" in obj && obj.boolean && obj.default === false)
    ? "default: " + JSON.stringify(obj.default)
    : undefined
}

function getOptionSynopsisHelp(
  opt: Option,
  { eol: crlf, chalk: c }: TemplateContext,
): string {
  return (
    opt.synopsis +
    (opt.required && opt.default === undefined ? crlf + c.dim("required") : "")
  )
}

export function getOptionsTable(
  options: Option[],
  ctx: TemplateContext,
  title = "OPTIONS",
): string {
  options = filter(options, "visible")
  if (!options.length) {
    return ""
  }
  const { chalk: c, eol: crlf, table, spaces } = ctx
  const help = spaces + c.bold(title) + crlf + crlf
  const rows = options.map((opt) => {
    const def = getDefaultValueHint(opt)
    const more = [opt.typeHint, def].filter((d) => d).join(", ")
    const syno = getOptionSynopsisHelp(opt, ctx)
    const desc = opt.description + (more.length ? crlf + c.dim(more) : "")
    return [syno, desc]
  })
  return help + table(rows)
}

export function getArgumentsTable(
  args: Argument[],
  ctx: TemplateContext,
  title = "ARGUMENTS",
): string {
  if (!args.length) {
    return ""
  }
  const { chalk: c, eol, eol2, table, spaces } = ctx
  const help = spaces + c.bold(title) + eol2
  const rows = args.map((a) => {
    const def = getDefaultValueHint(a)
    const more = [a.typeHint, def].filter((d) => d).join(", ")
    const desc = a.description + (more.length ? eol + c.dim(more) : "")
    return [a.synopsis, desc]
  })
  return help + table(rows)
}

export function getCommandsTable(
  commands: Command[],
  ctx: TemplateContext,
  title = "COMMANDS",
): string {
  const { chalk, prog, eol2, table, spaces } = ctx
  const cmdHint = `Type '${prog.getBin()} help <command>' to get some help about a command`
  const help =
    spaces + chalk.bold(title) + ` ${chalk.dim("\u2014")} ` + chalk.dim(cmdHint) + eol2
  const rows = commands
    .filter((c) => c.visible)
    .map((cmd) => {
      return [chalk.keyword("orange")(cmd.name), cmd.description || ""]
    })

  return help + table(rows)
}
