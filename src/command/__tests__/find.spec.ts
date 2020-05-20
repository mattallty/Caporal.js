jest.mock("../import")

import { createCommand } from ".."
import { Program } from "../../program"
import { findCommand } from "../find"
import { importCommand } from "../import"

describe("Command", () => {
  const prog = new Program()
  prog.discover(".")
  const knownCmd = prog.command("my-command", "my command")
  const discoverableCmd = createCommand(prog, "discoverable", "my command")
  const commandCreator = jest.fn(() => discoverableCmd)

  const importCommandMock = importCommand as jest.MockedFunction<typeof importCommand>
  importCommandMock.mockResolvedValue(commandCreator)

  describe("findCommand()", () => {
    it("should find a known command", () => {
      return expect(findCommand(prog, ["my-command"])).resolves.toEqual(knownCmd)
    })
    it("should find a discoverable command", () => {
      return expect(findCommand(prog, ["git init"])).resolves.toEqual(discoverableCmd)
    })
  })
})
