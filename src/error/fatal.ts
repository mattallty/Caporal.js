/**
 * @packageDocumentation
 * @internal
 */

import { logger } from "../logger"
import type { BaseError } from "./base"

/**
 * @param err - Error object
 */
export function fatalError(error: BaseError): void {
  if (logger.level == "debug") {
    logger.log({
      level: "error",
      ...error,
      message: error.message + "\n\n" + error.stack,
      stack: error.stack,
      name: error.name,
    })
  } else {
    logger.error(error.message)
  }
  process.exitCode = 1
}
