/**
 * @packageDocumentation
 * @internal
 */
import type { Program } from "../program"
import type { Command } from "."
import { importCommand } from "./import"
import { createCommand } from "."
import path from "path"

export async function findCommand(
  program: Program,
  argv: string[],
): Promise<Command | undefined> {
  const commands = program.getCommands()
  const findRegisteredCommand = (search: string): Command | undefined =>
    commands.find((c) => c.name === search || c.hasAlias(search))

  let foundCommand
  let i
  for (i = 0; i < argv.length; i++) {
    const cmd = argv.slice(0, i + 1).join(" ")
    // break as soon as possible
    if (argv[i].startsWith("-")) {
      break
    }
    const potentialCmd =
      findRegisteredCommand(cmd) || (await discoverCommand(program, cmd))
    foundCommand = potentialCmd || foundCommand
  }

  return foundCommand
}

/**
 * Search for a command in discovery path
 */
async function discoverCommand(
  program: Program,
  cmd: string,
): Promise<Command | undefined> {
  if (program.discoveryPath === undefined) {
    return
  }
  const filename = cmd.split(" ").join("/")
  try {
    const fullPath = path.join(program.discoveryPath, filename)
    const cmdBuilder = await importCommand(fullPath)
    const options = {
      createCommand: createCommand.bind(null, program, cmd),
      program,
    }
    return cmdBuilder(options)
    // eslint-disable-next-line no-empty
  } catch (e) {}
}
