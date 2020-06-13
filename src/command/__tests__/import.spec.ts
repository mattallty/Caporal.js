import { importCommand } from "../import"
import path from "path"

describe("Command", () => {
  describe("importCommand()", () => {
    it("should import a command from a file", async () => {
      const creator = await importCommand(
        path.resolve(__dirname, "../__fixtures__/example-cmd.ts"),
      )
      expect(creator).toBeTruthy()
    })
  })
})
