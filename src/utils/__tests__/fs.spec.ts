import { readdir } from "../fs"

describe("readdir()", () => {
  it("should resolve to a file list on success", () => {
    return expect(readdir(__dirname)).resolves.toEqual([
      "fs.spec.ts",
      "levenshtein.spec.ts",
      "suggest.spec.ts",
    ])
  })
  it("should reject if directory does note exist", () => {
    return expect(readdir("/does/not/exist")).rejects.toBeInstanceOf(Error)
  })
})
