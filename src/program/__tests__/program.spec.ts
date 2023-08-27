import { expect, it, describe, beforeEach, vi } from "vitest"

const mocks = vi.hoisted(() => {
  return {
    fatalError: vi.fn(),
  }
})

vi.mock("../../error/fatal", () => ({
  fatalError: mocks.fatalError,
}))

vi.useFakeTimers()

import { program } from "../../index"
import { Program } from ".."
import {
  UnknownOrUnspecifiedCommandError,
  ValidationSummaryError,
  NoActionError,
} from "../../error"
import { Logger } from "../../types"
import { logger } from "../../logger"
import { resetGlobalOptions } from "../../option"

let prog = program

const loggerWarnSpy = vi.spyOn(logger, "warn")

describe("Program", () => {
  beforeEach(() => {
    prog = new Program()
    prog.name("test-prog")
    prog.bin("test-prog")
    vi.clearAllMocks()
    resetGlobalOptions()
  })

  it(".version() should set the version", () => {
    prog.version("beta-2")
    expect(prog.getVersion()).toBe("beta-2")
  })

  it(".description() should set the description", () => {
    prog.description("fake-desc")
    expect(prog.getDescription()).toBe("fake-desc")
  })

  it(".hasCommands() should return false by default", () => {
    return expect(prog.hasCommands()).resolves.toBe(false)
  })

  it(".getSynopsis should return the correct synopsis if program has commands", () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.command("my-command", "my command").action(action)
    return expect(prog.getSynopsis()).resolves.toContain("<command>")
  })

  it(".synospis should return the correct synopsis if program does not have commands", () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.action(action)
    return expect(prog.getSynopsis()).resolves.not.toContain("<command>")
  })

  it(".parse(undefined) should work", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.argument("[first-arg]", "First argument").action(action)
    await expect(prog.run([])).resolves.toBe("ok")
    expect(action).toHaveBeenCalled()
  })

  it("should be able to create a 'program-command' just by calling .argument()", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.argument("<first-arg>", "First argument").action(action)
    await expect(prog.run(["first-arg"])).resolves.toBe("ok")
    expect(action).toHaveBeenCalled()
  })

  it("should be able to create a 'program-command' just by calling .option()", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.option("--foo", "Foo option").action(action)
    await expect(prog.run(["--foo"])).resolves.toBe("ok")
    expect(action).toHaveBeenCalled()
  })

  it(".globalOption() should create a global option without associated action", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.option("--my-global <var>", "my global var", { global: true })
    prog.argument("<first-arg>", "First argument").action(action)

    await expect(prog.run(["first-arg", "--my-global", "secret"])).resolves.toBe("ok")
    expect(action).toHaveBeenCalled()
  })

  it(".globalOption() should create a global option with associated action", async () => {
    const action = vi.fn().mockReturnValue("ok")
    const optAction = vi.fn()
    prog.option("--my-global <var>", "my global var", { global: true, action: optAction })
    prog.argument("<first-arg>", "First argument").action(action)

    await expect(prog.run(["first-arg", "--my-global", "secret"])).resolves.toBe("ok")
    expect(action).toHaveBeenCalled()
    expect(optAction).toHaveBeenCalled()
  })

  it("disableGlobalOption() should disable a global option", async () => {
    const action = vi.fn().mockReturnValue("ok")
    const optAction = vi.fn()
    prog.option("--my-global <var>", "my global var", { global: true, action: optAction })
    prog.argument("<first-arg>", "First argument").action(action)
    prog.strict(false)
    prog.disableGlobalOption("myGlobal")

    // second call should call console.warn
    prog.disableGlobalOption("myGlobal")

    await expect(prog.run(["first-arg", "--my-global", "secret"])).resolves.toBe("ok")
    expect(action).toHaveBeenCalled()
    expect(optAction).not.toHaveBeenCalled()
    expect(loggerWarnSpy).toHaveBeenCalled()
  })

  it(".discover() should set discovery path if it exists", () => {
    prog.discover(".")
    expect(prog.discoveryPath).toBe(".")
  })

  it(".discover() should throw if  provided path does not exist", () => {
    return expect(() => prog.discover("/unknown/path")).toThrowError()
  })

  it(".discover() should throw if provided path is not a directory", () => {
    return expect(() => prog.discover(__filename)).toThrowError()
  })

  it("should be able to call discovered commands", async () => {
    prog.discover(__dirname + "/../../command/__fixtures__")
    await expect(prog.run(["example-cmd"])).resolves.toBe("hey")
  })

  it("should be able to call .argument() multiple times", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.argument("<first-arg>", "First argument").action(action)
    prog.argument("<second-arg>", "Second argument").action(action)
    await expect(prog.run(["first-arg", "sec-arg"])).resolves.toBe("ok")
    expect(action).toHaveBeenCalled()
  })

  it(".run() should work without arguments", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.strict(false)
    prog.action(action)
    await expect(prog.run()).resolves.toBe("ok")
  })

  it(".run() should throw an Error when no action is defined for the program-command", async () => {
    prog.option("-t, --type <pizza-type>", "Pizza type")
    await expect(prog.run([])).rejects.toBeInstanceOf(NoActionError)
  })

  it("should be able to create a 'program-command' just by calling .action()", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.action(action)
    await expect(prog.run([])).resolves.toBe("ok")
    expect(action).toHaveBeenCalled()
  })

  it(".exec() should work as expected", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.argument("<first-arg>", "First argument").action(action)
    await expect(prog.exec(["1"])).resolves.toBe("ok")
    expect(action).toHaveBeenCalledWith(
      expect.objectContaining({
        args: {
          firstArg: "1",
        },
      }),
    )
  })

  it(".cast(true) should enable auto casting", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.argument("<first-arg>", "First argument").action(action)
    prog.cast(true)
    await expect(prog.run(["1"])).resolves.toBe("ok")
    expect(action).toHaveBeenCalledWith(
      expect.objectContaining({
        args: {
          firstArg: 1,
        },
      }),
    )
  })

  it(".cast(false) should disable auto casting", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.argument("<first-arg>", "First argument").action(action)
    prog.cast(false)
    await expect(prog.run(["1"])).resolves.toBe("ok")
    expect(action).toHaveBeenCalledWith(
      expect.objectContaining({
        args: {
          firstArg: "1",
        },
      }),
    )
  })

  it("program should create help command and accept executing 'program help'", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog
      .command("test", "test command")
      .argument("<first-arg>", "First argument")
      .action(action)
    await expect(prog.run(["help"])).resolves.toBe(-1)
    await expect(prog.run(["help", "test"])).resolves.toBe(-1)
    expect(action).not.toHaveBeenCalled()
    expect(mocks.fatalError).not.toHaveBeenCalled()
  })

  it("program should create help command and accept executing 'program help command-name'", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog
      .command("test", "test command")
      .argument("<first-arg>", "First argument")
      .action(action)
    await expect(prog.run(["help", "test"])).resolves.toBe(-1)
    expect(action).not.toHaveBeenCalled()
    expect(mocks.fatalError).not.toHaveBeenCalled()
  })

  it("program should create help command and accept executing 'program help unknown-command'", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog
      .command("test", "test command")
      .argument("<first-arg>", "First argument")
      .action(action)
    await expect(prog.run(["help", "unknown"])).resolves.toBe(-1)
    expect(action).not.toHaveBeenCalled()
    expect(mocks.fatalError).not.toHaveBeenCalled()
  })

  it("'program help' should work for a program without any command", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.bin("test").argument("<first-arg>", "First argument").action(action)
    await expect(prog.run(["help"])).resolves.toBe(-1)
    expect(action).not.toHaveBeenCalled()
    expect(mocks.fatalError).not.toHaveBeenCalled()
  })

  it("'program' should throw for a program without any command but a required arg", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog.bin("test").argument("<first-arg>", "First argument").action(action)
    await expect(prog.run([])).rejects.toBeInstanceOf(ValidationSummaryError)
    expect(action).not.toHaveBeenCalled()
  })

  it("program should fail when trying to run an unknown command", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog
      .command("test", "test command")
      .argument("<first-arg>", "First argument")
      .action(action)
    await expect(prog.run(["unknown-cmd"])).rejects.toBeInstanceOf(
      UnknownOrUnspecifiedCommandError,
    )
  })

  it("program should fail when trying to run an unknown command and suggest some commands", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog
      .command("test", "test command")
      .argument("<first-arg>", "First argument")
      .action(action)
    await expect(prog.run(["rest"])).rejects.toBeInstanceOf(
      UnknownOrUnspecifiedCommandError,
    )
  })

  it("program should fail when trying to run without a specified command", async () => {
    const action = vi.fn().mockReturnValue("ok")
    prog
      .command("test", "test command")
      .argument("<first-arg>", "First argument")
      .action(action)
    await expect(prog.run([])).rejects.toBeInstanceOf(UnknownOrUnspecifiedCommandError)
  })

  it(".setLogLevelEnvVar() should set the log level ENV var", async () => {
    process.env.MY_ENV_VAR = "warn"
    prog.configure({ logLevelEnvVar: "MY_ENV_VAR" })
    const action = vi.fn().mockReturnValue("ok")
    prog
      .command("test", "test command")
      .argument("<first-arg>", "First argument")
      .action(action)
    expect(prog.getLogLevelOverride()).toBe("warn")
    await prog.run(["test", "my-arg"])
    expect(logger.level).toBe("warn")
  })

  it(".logger() should override the default logger", async () => {
    const action = vi.fn().mockImplementation(({ logger }) => {
      logger.log("foo")
      return true
    })
    const logger = { log: vi.fn() }
    prog
      .logger(logger as unknown as Logger)
      .command("test", "test command")
      .argument("<first-arg>", "First argument")
      .action(action)
    await expect(prog.run(["test", "my-arg"])).resolves.toBe(true)
    expect(logger.log).toHaveBeenCalledWith("foo")
  })
})
