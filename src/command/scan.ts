/**
 * @packageDocumentation
 * @internal
 */
import path from "path"
import zipObject from "lodash/zipObject"
import map from "lodash/map"
import { readdir } from "../utils/fs"
import { importCommand } from "./import"
import { createCommand } from "."
import type { Command } from "."
import type { Program } from "../program"

export async function scanCommands(
  program: Program,
  dirPath: string,
): Promise<Command[]> {
  const files = await readdir(dirPath)
  const imp = await Promise.all(files.map((f) => importCommand(path.join(dirPath, f))))
  const data = zipObject(files, imp)
  return map(data, (cmdBuilder, filename) => {
    const { dir, name } = path.parse(filename)
    const cmd = dir.split("/").concat(name).join(" ")
    const options = {
      createCommand: createCommand.bind(null, program, cmd),
      program,
    }
    return cmdBuilder(options)
  })
}
