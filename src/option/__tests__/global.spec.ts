/* eslint-disable no-console */
import { program } from "../../index"
import { Program } from "../../program"
import { logger } from "../../logger"
import { Action } from "../../types"
import { disableGlobalOption, findGlobalOption, resetGlobalOptions } from ".."

let prog = program

describe("option / global", () => {
  const logSpy = jest.spyOn(console, "log")
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const logStdoutSpy = jest.spyOn(console._stdout, "write") // winston use this
  const loggerInfoSpy = jest.spyOn(logger, "info")

  beforeEach(() => {
    prog = new Program()
    prog.name("test-prog")
    prog.bin("test-prog")
    prog.version("xyz")
    logSpy.mockClear()
    logStdoutSpy.mockClear()
    logger.level = "info"
    logger.colorsEnabled = true
    resetGlobalOptions()
  })

  afterAll(() => {
    logger.colorsEnabled = true
  })

  test("-V should show program version and exit", async () => {
    await prog.run(["-V"])
    expect(logSpy).toHaveBeenLastCalledWith("xyz")
  })

  test("--version should show program version and exit", async () => {
    await prog.run(["--version"])
    expect(logSpy).toHaveBeenLastCalledWith("xyz")
  })

  test("--no-color should disable colors in output", async () => {
    const action: Action = function ({ logger }) {
      logger.info("Hey!")
    }
    prog.argument("[first-arg]", "First argument").action(action)
    await prog.run(["--no-color", "foo"])
    expect(loggerInfoSpy).toHaveBeenLastCalledWith("Hey!")
  })

  test("--color false should disable colors in output", async () => {
    const action: Action = function ({ logger }) {
      logger.info("Joe!")
    }
    prog.argument("[first-arg]", "First argument").action(action)
    await prog.run(["--color", "false", "foo"])
    expect(loggerInfoSpy).toHaveBeenLastCalledWith("Joe!")
  })

  test("-v should enable verbosity", async () => {
    const action: Action = function ({ logger }) {
      logger.info("my-info")
      logger.debug("my-debug")
    }
    prog.argument("[first-arg]", "First argument").action(action)

    await prog.run(["foo"])
    expect(logStdoutSpy).toHaveBeenLastCalledWith(expect.stringContaining("my-info"))

    await prog.run(["foo", "-v"])
    expect(logStdoutSpy).toHaveBeenLastCalledWith(expect.stringContaining("my-debug"))
  })

  test("--verbose should enable verbosity", async () => {
    const action: Action = function ({ logger }) {
      logger.info("my-info")
      logger.debug("my-debug")
    }
    prog.argument("[first-arg]", "First argument").action(action)

    await prog.run(["foo"])
    expect(logStdoutSpy).toHaveBeenLastCalledWith(expect.stringContaining("my-info"))

    await prog.run(["foo", "--verbose"])
    expect(logStdoutSpy).toHaveBeenLastCalledWith(expect.stringContaining("my-debug"))
  })

  test("--quiet should make the program only output warnings and errors", async () => {
    const action: Action = function ({ logger }) {
      logger.info("my-info")
      logger.debug("my-debug")
      logger.warn("my-warn")
      logger.error("my-error")
    }
    prog.argument("[first-arg]", "First argument").action(action)

    await prog.run(["foo", "--quiet"])
    expect(logStdoutSpy).not.toHaveBeenCalledWith(expect.stringContaining("my-info"))
    expect(logStdoutSpy).not.toHaveBeenCalledWith(expect.stringContaining("my-debug"))
    expect(logStdoutSpy).toHaveBeenCalledWith(expect.stringContaining("my-warn"))
    expect(logStdoutSpy).toHaveBeenCalledWith(expect.stringContaining("my-error"))
  })

  test("--silent should output nothing", async () => {
    const action: Action = function ({ logger }) {
      logger.info("my-info")
      logger.debug("my-debug")
      logger.warn("my-warn")
      logger.error("my-error")
    }
    prog.argument("[first-arg]", "First argument").action(action)

    await prog.run(["foo", "--silent"])
    expect(logStdoutSpy).not.toHaveBeenCalled()
  })

  test("disableGlobalOption() should disable a global option by name or notation", async () => {
    // by notation
    expect(findGlobalOption("version")).toBeTruthy()
    const result = disableGlobalOption("-V")
    expect(result).toBe(true)
    expect(findGlobalOption("version")).toBeUndefined()

    // by name
    expect(findGlobalOption("help")).toBeTruthy()
    const result2 = disableGlobalOption("help")
    expect(result2).toBe(true)
    expect(findGlobalOption("help")).toBeUndefined()
  })

  test("disableGlobalOption() should return false for an unknown global option", async () => {
    // by notation
    const result = disableGlobalOption("--unknown")
    expect(result).toBe(false)

    // by name
    const result2 = disableGlobalOption("unknown")
    expect(result2).toBe(false)
  })
})
