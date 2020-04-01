/**
 * @packageDocumentation
 * @internal
 */

import type { Argument } from "../types"
import type { Command } from "../command"

export function findArgument(cmd: Command, name: string): Argument | undefined {
  return cmd.args.find((a) => a.name === name)
}
