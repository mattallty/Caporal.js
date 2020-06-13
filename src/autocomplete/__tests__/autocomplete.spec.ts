import { complete } from ".."
import { program } from "../__fixtures__/prog-autocomplete"
import filter from "lodash/filter"

/**
 * Helper to cimulate auto comp env
 * @param cl Command line
 * @param opts
 * @param env
 */
function makeFakeEnv(
  cl: string,
  opts: Record<string, string> = {},
  env = process.env,
): { env: NodeJS.ProcessEnv; argv: string[] } {
  let cursorPos = cl.indexOf("|")
  if (cursorPos === -1) {
    cursorPos = cl.length
  }
  cl = cl.replace("|", "")
  const argv = filter(cl.split(" "))

  env.COMP_CWORD = String(argv.length)
  env.COMP_LINE = cl
  env.COMP_POINT = cursorPos === -1 ? "0" : String(cursorPos)
  env = { ...env, ...opts }

  return { env, argv: [process.execPath, __filename, "completion", "--", ...argv] }
}

describe("autocomplete", () => {
  describe("complete()", () => {
    it("should auto-complete command name if possible", async () => {
      const argv = "ord|"
      await expect(complete(program, makeFakeEnv(argv))).resolves.toEqual([
        {
          name: "order",
          description: expect.any(String),
        },
      ])
      await expect(complete(program, makeFakeEnv("c|"))).resolves.toEqual([
        {
          name: "cancel",
          description: expect.any(String),
        },
      ])
    })

    it("should not auto-complete command name if none are available", async () => {
      await expect(complete(program, makeFakeEnv("wrong|"))).resolves.toEqual([])
      await expect(complete(program, makeFakeEnv("cancel|"))).resolves.not.toContain(
        expect.objectContaining({
          name: "cancel",
        }),
      )
    })

    it("should auto-complete arguments values from choices", async () => {
      const argv = "order |"
      await expect(complete(program, makeFakeEnv(argv))).resolves.toEqual([
        {
          name: "margherita",
          description: expect.any(String),
        },
        {
          name: "caprese",
          description: expect.any(String),
        },
        {
          name: "quattro fromaggi",
          description: expect.any(String),
        },
        {
          name: "--extra-ingredients",
          description: expect.any(String),
        },
      ])
    })

    it("should auto-complete arguments values from complete()", async () => {
      const argv = "cancel |"
      await expect(complete(program, makeFakeEnv(argv))).resolves.toEqual([
        {
          name: "1234",
          description: expect.any(String),
        },
        {
          name: "5678",
          description: expect.any(String),
        },
        {
          name: "--cash-out",
          description: expect.any(String),
        },
      ])
    })

    it("should auto-complete partial options values from complete()", async () => {
      const argv = "cancel --ca|"
      await expect(complete(program, makeFakeEnv(argv))).resolves.toEqual([
        {
          name: "--cash-out",
          description: expect.any(String),
        },
      ])
    })

    it("should auto-complete partial long options", async () => {
      const argv = "order --ex"
      await expect(complete(program, makeFakeEnv(argv))).resolves.toEqual([
        {
          name: "--extra-ingredients",
          description: expect.any(String),
        },
      ])
    })

    it("should auto-complete a single dash", async () => {
      const argv = "order -"
      await expect(complete(program, makeFakeEnv(argv))).resolves.toEqual([
        {
          name: "--extra-ingredients",
          description: expect.any(String),
        },
      ])
    })
  })
})
