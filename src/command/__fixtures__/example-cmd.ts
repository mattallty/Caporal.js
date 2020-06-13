/**
 * @packageDocumentation
 * @ignore
 */
/* istanbul ignore file */
import type { Command } from "../"
import type { CreateCommandParameters } from "../../types"

export default function ({ createCommand }: CreateCommandParameters): Command {
  return createCommand("My command").action(({ logger }) => {
    logger.info("Output of my command")
    return "hey"
  })
}
