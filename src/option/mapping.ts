/**
 * @packageDocumentation
 * @internal
 */

import type { Command } from "../command"
import map from "lodash/map"
import zipObject from "lodash/zipObject"
import invert from "lodash/invert"
import pickBy from "lodash/pickBy"

export function getOptsMapping(cmd: Command): Record<string, string> {
  const names = map(cmd.options, "name")
  const aliases = map(cmd.options, (o) => o.shortName || o.longName)
  const result = zipObject(names, aliases)
  return pickBy({ ...result, ...invert(result) }) as Record<string, string>
}
