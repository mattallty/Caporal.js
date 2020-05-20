import { scanCommands } from "../scan"
import { Program } from "../../program"
import path from "path"
import { Command } from ".."

describe("scanCommands()", () => {
  const prog = new Program()

  it("should scan commands", async () => {
    const commands = await scanCommands(prog, path.join(__dirname, "../__fixtures__/"))
    commands.forEach((cmd) => {
      expect(cmd).toBeInstanceOf(Command)
    })
  })
})
