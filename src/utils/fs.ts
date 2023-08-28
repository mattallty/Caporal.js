/**
 * @packageDocumentation
 * @internal
 */
import { glob } from "glob"
import fs from "fs"

export function readdir(dirPath: string, extensions = "js,ts"): Promise<string[]> {
  if (!fs.existsSync(dirPath)) {
    return Promise.reject(new Error(`'${dirPath}' does not exist!`))
  }
  return glob(`**/*.{${extensions}}`, { cwd: dirPath })
}
