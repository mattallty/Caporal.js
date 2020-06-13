import { importCommand } from "../import"

describe("Command", () => {
  describe("importCommand()", () => {
    it("should import a command from a file", async () => {
      const creator = await importCommand("./__fixtures__/example-cmd.ts")
      expect(creator).toBeTruthy()
    })
  })
})
