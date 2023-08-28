import { expect, it, describe, vi } from "vitest"
import { createCommand } from ".."
import { Program } from "../../program"
import { findCommand } from "../find"

const mocks = vi.hoisted(() => {
  return {
    importCommand: vi.fn(),
  }
})

vi.mock("../import", () => ({
  importCommand: mocks.importCommand,
}))

describe("Command", () => {
  const prog = new Program()
  prog.discover(".")
  const knownCmd = prog.command("my-command", "my command")
  const discoverableCmd = createCommand(prog, "discoverable", "my command")
  const commandCreator = vi.fn(() => discoverableCmd)
  mocks.importCommand.mockResolvedValue(commandCreator)

  describe("findCommand()", () => {
    it("should find a known command", () => {
      return expect(findCommand(prog, ["my-command"])).resolves.toEqual(knownCmd)
    })
    it("should find a discoverable command", () => {
      return expect(findCommand(prog, ["git init"])).resolves.toEqual(discoverableCmd)
    })
  })
})
