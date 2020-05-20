/**
 * @packageDocumentation
 * @internal
 */
import { CommandCreator } from "../types"

export async function importCommand(file: string): Promise<CommandCreator> {
  const mod = await import(file)
  return mod.default
}
