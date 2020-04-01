/**
 * @packageDocumentation
 * @internal
 */
import { createLogger as winstonCreateLogger, transports, format } from "winston"
import { inspect } from "util"
import { default as chalk, supportsColor } from "chalk"
import type { Logger } from "../types"
import replace from "lodash/replace"
import { EOL } from "os"

const caporalFormat = format.printf((data) => {
  // console.dir(data)
  const { level, ...meta } = data
  let { message } = data
  let prefix = ""

  const levelStr = getLevelString(level)
  const metaStr = formatMeta(meta)

  if (metaStr !== "") {
    message += `${EOL}${levelStr}: ${metaStr}`
  }

  if (level === "error") {
    const spaces = " ".repeat(meta.paddingLeft || 7)
    prefix = EOL
    message = `${replace(message, new RegExp(EOL, "g"), EOL + spaces)}${EOL}`
  }

  return `${prefix}${levelStr}: ${message}`
})

function formatMeta(meta: Record<string, unknown>): string {
  delete meta.message
  delete meta[(Symbol.for("level") as unknown) as string]
  delete meta[(Symbol.for("message") as unknown) as string]
  delete meta[(Symbol.for("splat") as unknown) as string]
  if (Object.keys(meta).length) {
    return inspect(meta, {
      showHidden: false,
      colors: logger.colorsEnabled,
    })
  }
  return ""
}

function getLevelString(level: string): string {
  if (!logger.colorsEnabled) {
    return level
  }
  let levelStr = level
  switch (level) {
    case "error":
      levelStr = chalk.bold.redBright(level)
      break
    case "warn":
      levelStr = chalk.hex("#FF9900")(level)
      break
    case "info":
      levelStr = chalk.hex("#569cd6")(level)
      break
    case "debug":
    case "silly":
      levelStr = chalk.dim(level)
      break
  }
  return levelStr
}

export let logger: Logger = createDefaultLogger()

export function setLogger(loggerObj: Logger): void {
  logger = loggerObj
}

export function getLogger(): Logger {
  return logger
}

export function createDefaultLogger(): Logger {
  const logger = winstonCreateLogger({
    transports: [
      new transports.Console({
        format: format.combine(format.splat(), caporalFormat),
      }),
    ],
  }) as Logger
  // disableColors() disable on the logger level,
  // while chalk supports the --color/--no-color flag
  // as well as the FORCE_COLOR env var
  logger.disableColors = () => {
    logger.transports[0].format = caporalFormat
    logger.colorsEnabled = false
  }
  logger.colorsEnabled = supportsColor !== false
  return logger
}
