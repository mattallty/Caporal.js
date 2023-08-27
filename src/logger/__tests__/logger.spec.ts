/* eslint-disable no-console */
import { program } from "../../index"
import { Program } from "../../program"
import { logger } from ".."
import c from "chalk"
import stripAnsi from "strip-ansi"
import { expect, it, describe, beforeEach, vi } from "vitest"
import { EOL } from "os"

describe("logger", () => {
  // @ts-expect-error TS says _stdout does note exist on console but it does
  const logStdoutSpy = vi.spyOn(console._stdout, "write") // winston use this
  let prog = program

  beforeEach(() => {
    prog = new Program()
    prog.name("test-prog")
    prog.bin("test-prog")
    prog.version("xyz")
    logStdoutSpy.mockClear()
    logger.level = "info"
  })

  it("logger should handle metadata", () => {
    logger.info("foo", { blabla: "joe" })
    expect(stripAnsi(logStdoutSpy.mock.calls[0][0] as unknown as string)).toBe(
      `info: foo${EOL}info: { blabla: 'joe' }${EOL}`,
    )
  })

  it("level string should be colorized by default", () => {
    logger.info("my-info")
    expect(logStdoutSpy).toHaveBeenLastCalledWith(
      `${c.hex("#569cd6")("info")}: my-info${EOL}`,
    )
    logger.warn("my-warn")
    expect(logStdoutSpy).toHaveBeenLastCalledWith(
      `${c.hex("#FF9900")("warn")}: my-warn${EOL}`,
    )
    logger.error("my-error")
    expect(logStdoutSpy).toHaveBeenLastCalledWith(
      `${EOL}${c.bold.redBright("error")}: my-error${EOL}${EOL}`,
    )
    // set level to "debug" for the next test
    logger.level = "debug"
    logger.debug("my-debug")
    expect(logStdoutSpy).toHaveBeenLastCalledWith(`${c.dim("debug")}: my-debug${EOL}`)

    // set level to "silly" for the next test
    logger.level = "silly"
    logger.silly("my-silly")
    expect(logStdoutSpy).toHaveBeenLastCalledWith(`${c.dim("silly")}: my-silly${EOL}`)

    logger.http("foo")
    expect(logStdoutSpy).toHaveBeenLastCalledWith(`http: foo${EOL}`)
  })

  it("logger.disableColors() should disable colors", () => {
    logger.disableColors()
    logger.info("my-info")
    expect(logStdoutSpy).toHaveBeenLastCalledWith(`info: my-info${EOL}`)
    // revert back
    logger.colorsEnabled = true
  })
})
