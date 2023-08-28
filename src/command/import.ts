/**
 * @packageDocumentation
 * @internal
 */
import { CommandCreator } from "../types"
import path from "path"

export async function importCommand(file: string): Promise<CommandCreator> {
  const { dir, name } = path.parse(file)
  const filename = path.join(dir, name)
  const mod = await import(filename)
  return mod.default ?? mod
}
