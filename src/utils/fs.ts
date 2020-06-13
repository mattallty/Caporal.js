/**
 * @packageDocumentation
 * @internal
 */
import glob from "glob"
import fs from "fs"

export function readdir(dirPath: string, extensions = "js,ts"): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dirPath)) {
      return reject(new Error(`'${dirPath}' does not exist!`))
    }
    glob(`**/*.{${extensions}}`, { cwd: dirPath }, function (
      err: Error | null,
      files: string[],
    ) {
      /* istanbul ignore if */
      if (err) {
        return reject(err)
      }
      resolve(files)
    })
  })
}
