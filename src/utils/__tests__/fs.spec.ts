import { readdir } from "../fs"
import { expect, it, describe } from "vitest"

describe("readdir()", () => {
  it("should resolve to a file list on success", async () => {
    const files = await readdir(__dirname)
    return expect(files.sort()).toEqual(
      ["fs.spec.ts", "levenshtein.spec.ts", "suggest.spec.ts"].sort(),
    )
  })
  it("should reject if directory does note exist", () => {
    return expect(readdir("/does/not/exist")).rejects.toBeInstanceOf(Error)
  })
})
