jest.mock("../../error/fatal")
jest.useFakeTimers()

import { createCommand, HELP_CMD } from ".."
import { program, Validator } from "../../index"
import { Program } from "../../program"
import { CaporalValidator } from "../../validator/caporal"
import {
  fatalError,
  NoActionError,
  ActionError,
  ValidationSummaryError,
} from "../../error"

const fatalErrorMock = fatalError as jest.MockedFunction<typeof fatalError>

let prog = program

describe("Command", () => {
  beforeEach(() => {
    prog = new Program()
    prog.name("test-prog")
    prog.bin("test-prog")
    fatalErrorMock.mockClear()
  })
  it("createCommand() should create a basic command", () => {
    const cmd = createCommand(prog, "order", "Order something")
    expect(cmd).toMatchObject({
      name: "order",
      args: [],
      options: [],
      description: "Order something",
      visible: true,
    })
  })

  it(".alias() should alias the command", () => {
    const cmd = createCommand(prog, "order", "Order something").alias("give-it-to-me")
    expect(cmd.hasAlias("give-it-to-me")).toBe(true)
  })

  it(".argument() should add an argument to the command", () => {
    const cmd = createCommand(prog, "order", "Order something").argument(
      "<pizza-type>",
      "Pizza type",
    )
    expect(cmd.args).toHaveLength(1)
  })

  it(".action() should set the command action", async () => {
    const action = jest.fn()
    const cmd = createCommand(prog, "order", "Order something").action(action)
    await cmd.run({
      args: [],
      options: {},
      rawOptions: {},
      line: "",
      rawArgv: [],
      ddash: [],
    })
    expect(action).toHaveBeenCalled()
  })

  it(".command() should add another command", () => {
    prog.command("order", "Order something").command("other", "other command")
    // 2 + help command
    expect(prog.getCommands()).toHaveLength(3)
  })

  it(".hide() should hide the command", () => {
    const cmd = prog.command("order", "Order something").hide()
    expect(cmd.visible).toBe(false)
  })

  it(".name should be empty for teh program-command", () => {
    const cmd = prog.argument("<my-arg>", "My argument")
    expect(cmd.name).toEqual("")
  })

  it("get autoCast() should return true by default", () => {
    const cmd = prog.command("order", "Order something")
    expect(cmd.autoCast).toBe(true)
  })

  it("get autoCast() should return false if disabled", () => {
    const cmd = prog.command("order", "Order something")
    cmd.cast(false)
    expect(cmd.autoCast).toBe(false)
  })

  it("get autoCast() should return false is disabled on the program level", () => {
    const cmd = prog.cast(false).command("order", "Order something")
    expect(cmd.autoCast).toBe(false)
  })

  it(".default() should set the command as the program default command", () => {
    const action = jest.fn()
    const cmd = createCommand(prog, "order", "Order something").action(action)
    cmd.default()
    expect(prog.defaultCommand).toEqual(cmd)
  })

  it(".option() should add an option to the command", () => {
    const cmd = prog
      .command("order", "Order something")
      .option("-t, --type <pizza-type>", "Pizza type")

    expect(cmd.options).toHaveLength(1)
  })

  it(".run() should throw an Error when no action is defined for the command", async () => {
    const cmd = prog
      .command("order", "Order something")
      .option("-t, --type <pizza-type>", "Pizza type")
    await expect(cmd.run({ args: [], options: {} })).rejects.toBeInstanceOf(NoActionError)
  })

  it(".run() should throw an ValidationSummaryError when invalid exact arg count is provided", async () => {
    const action = jest.fn()
    const cmd = prog
      .command("order", "Order something")
      .argument("<location>", "Location")
      .option("-t, --type <pizza-type>", "Pizza type")
      .action(action)

    await expect(cmd.run({ args: [], options: {} })).rejects.toBeInstanceOf(
      ValidationSummaryError,
    )
  })

  it(".run() should throw an ValidationSummaryError when invalid arg count (range) is provided", async () => {
    const action = jest.fn()
    const cmd = prog
      .command("order", "Order something")
      .argument("<location>", "Location")
      .argument("[details]", "Details")
      .option("-t, --type <pizza-type>", "Pizza type")
      .action(action)

    await expect(cmd.run({ args: [], options: {} })).rejects.toBeInstanceOf(
      ValidationSummaryError,
    )
  })

  it(".run() should throw an ValidationSummaryError when invalid arg count is provided, even for variadic args", async () => {
    const action = jest.fn()
    const cmd = prog
      .command("order", "Order something")
      .argument("<menu...>", "Menu (one or more)")
      .option("-t, --type <pizza-type>", "Pizza type")
      .action(action)

    await expect(cmd.run({ args: [], options: {} })).rejects.toBeInstanceOf(
      ValidationSummaryError,
    )
  })

  it(".run() should throw an ActionError when action throws an `Error`", async () => {
    const action = jest.fn(() => {
      throw new Error("User Error")
    })
    const cmd = prog.command("order", "Order something").action(action)
    await expect(cmd.run({ args: ["order"] })).rejects.toBeInstanceOf(ActionError)
    expect(action).toHaveBeenCalled()
  })

  it(".run() should throw an ActionError when action throws a message", async () => {
    const action = jest.fn(() => {
      throw "User Error"
    })
    const cmd = prog.command("order", "Order something").action(action)
    await expect(cmd.run({ args: ["order"] })).rejects.toBeInstanceOf(ActionError)
    expect(action).toHaveBeenCalled()
  })

  it(".run() should throw an ActionError when action rejects", async () => {
    const action = jest.fn().mockRejectedValue(new Error("Rejected!"))
    const cmd = prog.command("order", "Order something").action(action)
    await expect(cmd.run({ args: ["order"] })).rejects.toBeInstanceOf(ActionError)
    expect(action).toHaveBeenCalled()
  })

  it("processing a global flag returning false should stop further processing such as running the action, and run should return -1", async () => {
    const action = jest.fn()
    const cmd = prog
      .command("order", "Order something")
      .action(action)
      .option("-t, --type <pizza-type>", "Pizza type")
    await expect(cmd.run({ args: ["order"], options: { help: true } })).resolves.toBe(-1)
    expect(action).not.toHaveBeenCalled()
  })

  it("isHelpCommand() should return true for the help command", async () => {
    const cmd = prog.command(HELP_CMD, "Help command")
    expect(cmd.isHelpCommand()).toBe(true)
  })

  it("isHelpCommand() should return false for non-help command", async () => {
    const cmd = prog.command("some command", "some command")
    expect(cmd.isHelpCommand()).toBe(false)
  })

  it("getAliases() should return registered aliases", async () => {
    const cmd = prog.command("order", "Order something").alias("my-alias", "my-alias2")
    expect(cmd.getAliases()).toEqual(["my-alias", "my-alias2"])
  })

  it("getAliases() should return an empty array when no alias is registered", async () => {
    const cmd = prog.command("order", "Order something")
    expect(cmd.getAliases()).toEqual([])
  })

  it("command should be callable via its alias", async () => {
    const action = jest.fn().mockReturnValue("hey!")
    const cmd = prog.command("order", "Order something").alias("my-alias").action(action)
    await expect(cmd.run({ args: ["my-alias"] })).resolves.toBe("hey!")
    expect(action).toHaveBeenCalled()
  })

  it("command should be callable even if it's the program-command", async () => {
    const action = jest.fn().mockReturnValue("hey!")
    prog.argument("<type>", "Pizza type").action(action)
    await expect(prog.run(["margherita"])).resolves.toBe("hey!")
    expect(action).toHaveBeenCalled()
  })

  it("command should be able to process arguments without validator", async () => {
    const action = jest.fn().mockReturnValue("hey!")
    const cmd = prog
      .command("order", "Order something")
      .argument("<type>", "Pizza type")
      .action(action)
    const args = ["order", "pepperoni"]
    await expect(cmd.run({ args })).resolves.toBe("hey!")
    expect(action).toHaveBeenCalledWith(
      expect.objectContaining({
        args: { type: "pepperoni" },
      }),
    )
  })

  it("command should be able to handle variadic arguments", async () => {
    const action = jest.fn().mockReturnValue("OK!")
    prog
      .command("order", "Order something")
      .argument("<types...>", "Pizza types")
      .action(action)
    const args = ["order", "pepperoni", "regina"]
    await prog.run(args)
    expect(action).toHaveBeenCalledWith(
      expect.objectContaining({
        args: { types: ["pepperoni", "regina"] },
      }),
    )
  })

  it("command should check arguments range (variable)", async () => {
    const action = jest.fn().mockReturnValue("hey!")
    const cmd = prog
      .command("order", "Order something")
      .argument("<type>", "Pizza type")
      .argument("<deliver-to>", "Address")
      .argument("[amount]", "Pizza type")
      .action(action)
    const args = ["order", "pepperoni"]
    await expect(cmd.run({ args })).rejects.toBeInstanceOf(ValidationSummaryError)
    expect(action).not.toHaveBeenCalled()
  })

  describe(".run() should handle the call validation", () => {
    it("with an (optional) argument having a default value", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      const cmd = prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { default: ["margherita", "regina"] })
        .argument("[amount]", " Amount of pizza", {
          validator: CaporalValidator.NUMBER,
          default: 1,
        })
        .action(action)

      await expect(cmd.run({ args: ["order", "margherita"] })).resolves.toBe("got it!")
      expect(action).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { type: "margherita", amount: 1 },
        }),
      )
    })
    it("without an (optional) argument without default value", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      const cmd = prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .argument("[amount]", " Amount of pizza", { validator: CaporalValidator.NUMBER })
        .action(action)
      await expect(cmd.run({ args: ["order", "margherita"] })).resolves.toBe("got it!")
    })

    it("with options without validation", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .option("-a, --amount <number>", "Amount of pizza")
        .action(action)
      await expect(prog.run(["order", "margherita", "--amount", "23"])).resolves.toBe(
        "got it!",
      )
    })

    it("with options with validator and default value ", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .option("-a, --amount <number>", "Amount of pizza", {
          validator: CaporalValidator.NUMBER,
          default: 1,
        })
        .action(action)
      await expect(prog.run(["order", "margherita", "--amount", "23"])).resolves.toBe(
        "got it!",
      )
    })

    it("with required option not provided", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .option("-a, --amount <number>", "Amount of pizza", { required: true })
        .action(action)
      await expect(prog.run(["order", "margherita"])).rejects.toBeInstanceOf(
        ValidationSummaryError,
      )
      expect(action).not.toHaveBeenCalled()
    })

    it("with options not provided but having default value ", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      const cmd = prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .option("-a, --amount <number>", " Amount of pizza", {
          validator: CaporalValidator.NUMBER,
          default: 1,
        })
        .action(action)
      await expect(cmd.run({ args: ["order", "margherita"] })).resolves.toBe("got it!")
    })

    it("with required options not provided and not having default value ", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      const cmd = prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .option("-a, --amount <number>", "Amount of pizza", {
          validator: CaporalValidator.NUMBER,
          required: true,
        })
        .action(action)
      await expect(cmd.run({ args: ["order", "margherita"] })).rejects.toBeInstanceOf(
        ValidationSummaryError,
      )
      expect(action).not.toHaveBeenCalled()
    })

    it("should fail with missing arg ", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .action(action)

      await expect(prog.run(["order"])).rejects.toBeInstanceOf(ValidationSummaryError)
      expect(action).not.toHaveBeenCalled()
    })

    it("should fail when an argument is invalid", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .command("cancel", "cancel an order id")
        .argument("<order-id>", "Order ID", { validator: Validator.NUMBER })
        .action(action)

      await expect(prog.run(["cancel", "not-a-number"])).rejects.toBeInstanceOf(
        ValidationSummaryError,
      )
      expect(action).not.toHaveBeenCalled()
    })

    it("should fail for the program-command when too many args are provided and config.strictArgsCount = true ", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .action(action)
      await expect(prog.run(["margherita", "unknown-arg"])).rejects.toBeInstanceOf(
        ValidationSummaryError,
      )
      jest.runAllImmediates()
      expect(action).not.toHaveBeenCalled()
      expect(fatalErrorMock).not.toHaveBeenCalled()
    })

    it("should fail when too many args are provided and config.strictArgsCount = true ", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .action(action)

      await expect(
        prog.run(["order", "margherita", "unknown-arg"]),
      ).rejects.toBeInstanceOf(ValidationSummaryError)
      jest.runAllImmediates()
      expect(action).not.toHaveBeenCalled()
      expect(fatalErrorMock).not.toHaveBeenCalled()
    })

    it("should fail when too many args are provided (and a range is expected) and config.strictArgsCount = true ", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .argument("[addon]", "Addon")
        .action(action)
      await expect(
        prog.run(["order", "margherita", "my-addon", "unknown-arg"]),
      ).rejects.toBeInstanceOf(ValidationSummaryError)

      jest.runAllImmediates()
      expect(action).not.toHaveBeenCalled()
    })

    it("should not fail when too many args are provided and config.strictArgsCount = false ", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .configure({ strictArgsCount: false })
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .action(action)

      await prog.run(["order", "margherita", "unknown-arg"])
      expect(action).toHaveBeenCalled()
    })

    it("should fail with unknown option ", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .action(action)

      await expect(
        prog.run(["order", "margherita", "--unknown", "foo"]),
      ).rejects.toBeInstanceOf(ValidationSummaryError)

      expect(action).not.toHaveBeenCalled()
    })

    it("should not fail with unknown option when config.strictOptions = false", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .configure({ strictOptions: false })
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .action(action)

      await expect(prog.run(["order", "margherita", "--unknown", "foo"])).resolves.toBe(
        "got it!",
      )
      expect(action).toHaveBeenCalled()
    })

    it("should fail with unknown option and suggest valid options", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .command("order", "Order something")
        .argument("<type>", "Pizza type", { validator: ["margherita", "regina"] })
        .option("--file", "File")
        .action(action)

      await expect(
        prog.run(["order", "margherita", "--fime", "foo"]),
      ).rejects.toBeInstanceOf(ValidationSummaryError)

      expect(action).not.toHaveBeenCalled()
    })

    it("with non required flag not provided and not having default value ", async () => {
      const action = jest.fn().mockReturnValue("got it!")
      prog
        .command("order", "Order something")
        .argument("<type>", " Pizza type", { validator: ["margherita", "regina"] })
        .option("-a, --amount <number>", " Amount of pizza", {
          validator: CaporalValidator.NUMBER,
        })
        .action(action)
      await expect(prog.run(["order", "margherita"])).resolves.toBe("got it!")
    })
  })

  it(".getParserConfig() should return the correct default parser config", () => {
    const cmd = createCommand(prog, "order", "Order something")
    const config = cmd.getParserConfig()
    expect(config).toMatchObject({
      alias: {},
      autoCast: true,
      boolean: [],
      ddash: false,
      string: [],
      variadic: [],
    })
  })

  it(".getParserConfig() should return the correct parser config for args & options", () => {
    const cmd = createCommand(prog, "invite", "Invite people")
      .argument("<guests>", "Number of guests", { validator: CaporalValidator.NUMBER })
      .argument("<location>", "Number of guests", { validator: CaporalValidator.STRING })
      .argument("<send-email>", "Send a confirmation email", {
        validator: CaporalValidator.BOOLEAN,
      })
      .argument("<email-list>", "List of emails, comma-separated", {
        validator: CaporalValidator.ARRAY | CaporalValidator.STRING,
      })
      .argument("<names...>", "Guests names", { validator: CaporalValidator.STRING })
      .option("--send-sms", "Send SMS")
      .option("--save-to", "Save to", { validator: CaporalValidator.STRING }) // TODO: wrong declaration!
      .option("--rsvp <response>", "Ask for RSVP", {
        validator: CaporalValidator.BOOLEAN,
      })
      .option("-m, --max <num>", "max invite", {
        validator: CaporalValidator.NUMBER,
      })
      .option("--override <key:value...>", "override config")
    const config = cmd.getParserConfig()
    expect(config).toMatchObject({
      alias: {},
      autoCast: true,
      boolean: expect.arrayContaining([3, "sendSms", "rsvp"]),
      ddash: false,
      string: expect.arrayContaining([2, "saveTo", 4, 5]),
      variadic: expect.arrayContaining([5, "override"]),
    })
  })

  it(".synopsis should return the correct synopsis when all flags are optional", () => {
    const cmd = createCommand(prog, "invite", "Invite people")
      .argument("<guests>", "Number of guests", { validator: CaporalValidator.NUMBER })
      .argument("<location>", "Number of guests", { validator: CaporalValidator.STRING })
      .argument("<send-email>", "Send a confirmation email", {
        validator: CaporalValidator.BOOLEAN,
      })
      .argument("<email-list>", "List of emails, comma-separated", {
        validator: CaporalValidator.ARRAY | CaporalValidator.STRING,
      })
      .argument("<names...>", "Guests names", { validator: CaporalValidator.STRING })
      .option("--send-sms", "Send SMS")
      .option("--save-to", "Save to", { validator: CaporalValidator.STRING }) // TODO: wrong declaration!
      .option("--rsvp <response>", "Ask for RSVP", {
        validator: CaporalValidator.BOOLEAN,
      })
      .option("-m, --max <num>", "max invite", {
        validator: CaporalValidator.NUMBER,
      })
      .option("--override <key:value...>", "override config")
    expect(cmd.synopsis).toBe(
      "test-prog invite <guests> <location> <send-email> <email-list> <names...> [OPTIONS...]",
    )
  })

  it(".synopsis should return the correct synopsis when some flags are required", () => {
    const cmd = createCommand(prog, "invite", "Invite people")
      .argument("<guests>", "Number of guests", { validator: CaporalValidator.NUMBER })
      .argument("<location>", "Number of guests", { validator: CaporalValidator.STRING })
      .argument("<send-email>", "Send a confirmation email", {
        validator: CaporalValidator.BOOLEAN,
      })
      .argument("<email-list>", "List of emails, comma-separated", {
        validator: CaporalValidator.ARRAY | CaporalValidator.STRING,
      })
      .argument("<names...>", "Guests names", { validator: CaporalValidator.STRING })
      .option("--send-sms", "Send SMS")
      .option("--save-to", "Save to", { validator: CaporalValidator.STRING }) // TODO: wrong declaration!
      .option("--rsvp <response>", "Ask for RSVP", {
        validator: CaporalValidator.BOOLEAN,
        required: true,
      })
      .option("-m, --max <num>", "max invite", {
        validator: CaporalValidator.NUMBER,
      })
      .option("--override <key:value...>", "override config")
    expect(cmd.synopsis).toBe(
      "test-prog invite <guests> <location> <send-email> <email-list> <names...> <OPTIONS...>",
    )
  })

  it(".synopsis should return the correct synopsis when command does not have any flags", () => {
    const cmd = createCommand(prog, "invite", "Invite people")
      .argument("<guests>", "Number of guests", { validator: CaporalValidator.NUMBER })
      .argument("<location>", "Number of guests", { validator: CaporalValidator.STRING })
      .argument("<send-email>", "Send a confirmation email", {
        validator: CaporalValidator.BOOLEAN,
      })
      .argument("<email-list>", "List of emails, comma-separated", {
        validator: CaporalValidator.ARRAY | CaporalValidator.STRING,
      })
      .argument("<names...>", "Guests names", { validator: CaporalValidator.STRING })
    expect(cmd.synopsis).toBe(
      "test-prog invite <guests> <location> <send-email> <email-list> <names...>",
    )
  })

  it(".synopsis should return the correct synopsis for a program-command", () => {
    const cmd = prog.argument("<foo>", "my desc")
    expect(cmd.synopsis).toBe("test-prog <foo>")
  })
})
