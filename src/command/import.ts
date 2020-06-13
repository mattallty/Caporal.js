/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable @typescript-eslint/camelcase */
/**
 * @packageDocumentation
 * @internal
 */
import { CommandCreator } from "../types"
import path from "path"

const requireFunc =
  // @ts-ignore
  typeof __webpack_require__ === "function" ? __non_webpack_require__ : require

export async function importCommand(file: string): Promise<CommandCreator> {
  const { dir, name } = path.parse(file)
  const filename = path.join(dir, name)
  const mod = requireFunc(filename)
  return mod.default ?? mod
}
