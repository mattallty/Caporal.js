/**
 * @packageDocumentation
 * @internal
 */
import fg from "fast-glob"
import fs from "fs"
import path from "path"

export function readdir(dirPath: string, extensions = "js,ts"): string[] {
  const cleanPath = path.resolve(dirPath)

  if (!fs.existsSync(cleanPath)) {
    console.warn("dir not exists", cleanPath)
    throw new Error(`'${cleanPath}' does not exist!`)
  }

  return fg.sync(`**/*.{${extensions}}`, { cwd: cleanPath })
}
