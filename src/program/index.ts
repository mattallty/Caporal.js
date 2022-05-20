/**
 * @packageDocumentation
 * @module caporal/program
 */
import { EventEmitter } from "events"
import fs from "fs"
import path from "path"
import kebabCase from "lodash/kebabCase"
import mapKeys from "lodash/mapKeys"
import { createCommand, HELP_CMD, PROG_CMD } from "../command"
import { Command } from "../command"
import { findCommand } from "../command/find"
import { scanCommands } from "../command/scan"
import { createConfigurator } from "../config"
import { fatalError, UnknownOrUnspecifiedCommandError } from "../error"
import { customizeHelp } from "../help"
import { CustomizedHelpOpts } from "../help/types"
import { logger, setLogger } from "../logger"
import {
  addGlobalOption,
  createOption,
  disableGlobalOption,
  processGlobalOptions,
  showHelp,
} from "../option"
import { parseArgv } from "../parser"
import {
  Action,
  Logger,
  Configurator,
  ParserResult,
  ParserTypes,
  ProgramConfig,
  CreateArgumentOpts,
  CreateOptionProgramOpts,
  CommandConfig,
} from "../types"
import { CaporalValidator } from "../types"
import { detectVersion } from "../utils/version"
import flatMap from "lodash/flatMap"

const LOG_LEVEL_ENV_VAR = "CAPORAL_LOG_LEVEL"
// const SUPPORTED_SHELL = ["bash", "zsh", "fish"]

/**
 * Program class
 *
 * @noInheritDoc
 */
export class Program extends EventEmitter {
  private commands: Command[] = []
  private _config: Configurator<ProgramConfig>
  private _version?: string
  private _name?: string
  private _description?: string
  private _programmaticMode = false

  private parserData?: ParserResult
  /**
   * @internal
   */
  public defaultCommand?: Command
  private _progCommand?: Command
  private _bin: string
  private _discoveryPath?: string
  private _discoveredCommands?: Command[]

  /**
   * Number validator. Check that the value looks like a numeric one
   * and cast the provided value to a javascript `Number`.
   */
  readonly NUMBER = CaporalValidator.NUMBER
  /**
   * String validator. Mainly used to make sure the value is a string,
   * and prevent Caporal auto-casting of numerical values and boolean
   * strings like `true` or `false`.
   */
  readonly STRING = CaporalValidator.STRING
  /**
   * Array validator. Convert any provided value to an array. If a string is provided,
   * this validator will try to split it by commas.
   */
  readonly ARRAY = CaporalValidator.ARRAY
  /**
   * Boolean validator. Check that the value looks like a boolean.
   * It accepts values like `true`, `false`, `yes`, `no`, `0`, and `1`
   * and will auto-cast those values to `true` or `false`.
   */
  readonly BOOLEAN = CaporalValidator.BOOLEAN

  /**
   * Program constructor.
   * - Detects the "bin" name from process argv
   * - Detects the version from package.json
   * - Set up the help command
   * @ignore
   */
  constructor() {
    super()
    this._bin = path.basename(process.argv[1])
    this._version = detectVersion()
    this._config = createConfigurator({
      strictArgsCount: true,
      strictOptions: true,
      autoCast: true,
      logLevelEnvVar: LOG_LEVEL_ENV_VAR,
    })
    this.setupHelpCommand()
    this.setupErrorHandlers()
  }

  /**
   * @internal
   */
  private setupErrorHandlers(): void {
    process.once("unhandledRejection", (err) => {
      if (this._programmaticMode) {
        throw err
      } else {
        this.emit("error", err)
      }
    })
    this.on("error", fatalError)
  }

  /**
   * The program-command is the command attached directly to the program,
   * meaning there is no command-keyword used to trigger it.
   * Mainly used for programs executing only one possible action.
   *
   * @internal
   */
  get progCommand(): Command {
    if (this._progCommand === undefined) {
      this._progCommand = createCommand(this, PROG_CMD, "")
    }
    return this._progCommand
  }

  /**
   * Setup the help command
   */
  private setupHelpCommand(): Command {
    return this.command(HELP_CMD, "Get help about a specific command")
      .argument(
        "[command]",
        "Command name to get help for. If the command does not exist, global help will be displayed.",
      )
      .action(async (actionParams) => {
        const { args } = actionParams
        const command = args.command
          ? await findCommand(this, [args.command as string])
          : undefined
        // eslint-disable-next-line no-console
        showHelp({ ...actionParams, command })
        return -1
      })
      .hide()
  }

  /**
   * Customize program help. Can be called multiple times to add more paragraphs and/or sections.
   *
   * @param text Help contents
   * @param options Display options
   */
  help(text: string, options: Partial<CustomizedHelpOpts> = {}): Program {
    customizeHelp(this, text, options)
    return this
  }

  /**
   * Toggle strict mode.
   * Shortcut to calling: `.configure({ strictArgsCount: strict, strictOptions: strict })`.
   * By default, the program is strict, so if you want to disable strict checking,
   * just call `.strict(false)`. This setting can be overridden at the command level.
   *
   * @param strict boolean enabled flag
   */
  strict(strict = true): Program {
    return this.configure({
      strictArgsCount: strict,
      strictOptions: strict,
    })
  }

  /**
   * Configure some behavioral properties.
   *
   * @param props properties to set/update
   */
  configure(props: Partial<ProgramConfig>): Program {
    this._config.set(props)
    return this
  }

  /**
   * Get a configuration property value. {@link ProgramConfig Possible keys}.
   *
   * @param key Property
   * @internal
   */
  getConfigProperty<K extends keyof ProgramConfig>(key: K): ProgramConfig[K] {
    return this._config.get(key)
  }

  /**
   * Return a reformatted synopsis string
   *
   * @internal
   */
  async getSynopsis(): Promise<string> {
    return (
      this.getBin() +
      " " +
      ((await this.hasCommands()) ? "<command> " : "") +
      "[ARGUMENTS...] [OPTIONS...]"
    ).trim()
  }

  /**
   * Return the discovery path, if set
   *
   * @internal
   */
  get discoveryPath(): string | undefined {
    return this._discoveryPath
  }

  /**
   * Return the program version
   *
   * @internal
   */
  getVersion(): string | undefined {
    return this._version
  }

  /**
   * Set the version fo your program.
   * You won't likely use this method as Caporal tries to guess it from your package.json
   */
  version(ver: string): Program {
    this._version = ver
    return this
  }

  /**
   * Set the program name. If not set, the filename minus the extension will be used.
   */
  name(name: string): Program {
    this._name = name
    return this
  }

  /**
   * Return the program name.
   *
   * @internal
   */
  getName(): string | undefined {
    return this._name
  }

  /**
   * Return the program description.
   *
   * @internal
   */
  getDescription(): string | undefined {
    return this._description
  }

  /**
   * Set the program description displayed in help.
   */
  description(desc: string): Program {
    this._description = desc
    return this
  }

  /**
   * Get the bin name (the name of your executable).
   *
   * @internal
   */
  getBin(): string {
    return this._bin
  }

  /**
   * Return the parser data. Will be undefined if called before the program has been run()
   */
  getParserData(): ParserResult | undefined {
    return this.parserData
  }

  /**
   * Sets the executable name. By default, it's auto-detected from the filename of your program.
   *
   * @param name Executable name
   * @example
   * ```ts
   * program.bin('myprog')
   * ```
   */
  bin(name: string): Program {
    this._bin = name
    return this
  }

  /**
   * Set a custom logger for your program.
   * Your logger should implement the {@link Logger} interface.
   */
  logger(logger: Logger): Program {
    setLogger(logger)
    return this
  }

  /**
   * Disable a global option. Will warn if the global option
   * does not exist of has already been disabled.
   *
   * @param name Name, short, or long notation of the option to disable.
   */
  disableGlobalOption(name: string): Program {
    const disabled = disableGlobalOption(name)
    if (!disabled) {
      logger.warn(
        "Cannot disable global option %s. Either the global option does not exist or has already been disabled.",
      )
    }
    return this
  }

  /**
   * Returns the list of all commands registered
   * - By default, Caporal creates one: the "help" command
   * - When calling argument() or action() on the program instance,
   * Caporal also create what is called the "program command", which
   * is a command directly attach to the program, usually used
   * in mono-command programs.
   * @internal
   */
  getCommands(): Command[] {
    return this.commands
  }

  /**
   * Add a command to the program.
   *
   * @param name Command name
   * @param description Command description
   * @example
   * ```ts
   * program.command('order', 'Order some food')
   * ```
   */
  command(
    name: string,
    description: string,
    config: Partial<CommandConfig> = {},
  ): Command {
    const cmd = createCommand(this, name, description, config)
    this.commands.push(cmd)
    return cmd
  }

  /**
   * Check if the program has user-defined commands.
   *
   * @internal
   * @private
   */
  async hasCommands(): Promise<boolean> {
    return (await this.getAllCommands()).length > 1
  }

  /**
   * @internal
   */
  async getAllCommands(): Promise<Command[]> {
    const discoveredCommands = await this.scanCommands()
    return [...this.commands, ...discoveredCommands]
  }

  /**
   * Return the log level override, if any is provided using
   * the right environment variable.
   *
   * @internal
   * @private
   */
  public getLogLevelOverride(): string | undefined {
    return process.env[this.getConfigProperty("logLevelEnvVar")]
  }

  /**
   * Enable or disable auto casting of arguments & options at the program level.
   *
   * @param enabled
   */
  cast(enabled: boolean): Program {
    return this.configure({ autoCast: enabled })
  }

  /**
   * Sets a *unique* action for the *entire* program.
   *
   * @param {Function} action - Action to run
   */
  action(action: Action): Program {
    this.progCommand.action(action)
    return this
  }

  /**
   * Add an argument to the *unique* command of the program.
   */
  argument(
    synopsis: string,
    description: string,
    options: CreateArgumentOpts = {},
  ): Command {
    return this.progCommand.argument(synopsis, description, options)
  }

  /**
   * Add an option to the *unique* command of the program,
   * or add a global option to the program when `options.global`
   * is set to `true`.
   *
   * @param synopsis Option synopsis like '-f, --force', or '-f, --file \<file\>', or '--with-openssl [path]'
   * @param description Option description
   * @param options Additional parameters
   */
  option(
    synopsis: string,
    description: string,
    options: CreateOptionProgramOpts = {},
  ): Program {
    if (options.global) {
      const opt = createOption(synopsis, description, options)
      addGlobalOption(opt, options.action)
    } else {
      this.progCommand.option(synopsis, description, options)
    }
    return this
  }

  /**
   * Discover commands from a specified path.
   *
   * Commands must be organized into files (one command per file) in a file tree like:
   *
   * ```sh
   * └── commands
   *     ├── config
   *     │   ├── set.ts
   *     │   └── unset.ts
   *     ├── create
   *     │   ├── job.ts
   *     │   └── service.ts
   *     ├── create.ts
   *     ├── describe.ts
   *     └── get.ts
   * ```
   *
   * The code above shows a short example of `kubectl` commands and subcommands.
   * In this case, Caporal will generate the following commands:
   *
   * - kubectl get [args...] [options...]
   * - kubectl config set [args...] [options...]
   * - kubectl config unset [args...] [options...]
   * - kubectl create [args...] [options...]
   * - kubectl create job [args...] [options...]
   * - kubectl create service [args...] [options...]
   * - kubectl describe [args...] [options...]
   * - kubectl get [args...] [options...]
   *
   * Notice how the `config` command has a mandatory subcommand associated,
   * hence cannot be called without a subcommand, contrary to the `create` command.
   * This is why there is no `config.ts` in the tree.
   *
   * @param path
   */
  discover(dirPath: string): Program {
    let stat
    try {
      stat = fs.statSync(dirPath)
      // eslint-disable-next-line no-empty
    } catch (e) {}
    if (!stat || !stat.isDirectory()) {
      throw new Error(
        "Caporal setup error: parameter `dirPath` of discover() should be a directory",
      )
    }

    this._discoveryPath = dirPath
    return this
  }

  /**
   * Do a full scan of the discovery path to get all existing commands
   * This should only be used to generate the full list of command,
   * as for help rendering
   *
   * @private
   */
  private async scanCommands(): Promise<Command[]> {
    if (this._discoveryPath === undefined) {
      return []
    }
    if (this._discoveredCommands) {
      return this._discoveredCommands
    }
    this._discoveredCommands = await scanCommands(this, this._discoveryPath)
    return this._discoveredCommands
  }

  /* istanbul ignore next */
  /**
   * Reset all commands
   *
   * @internal
   */
  public reset(): Program {
    this.commands = []
    this._progCommand = undefined
    this.setupHelpCommand()
    return this
  }

  /**
   * Run the program by parsing command line arguments.
   * Caporal will automatically detect command line arguments from `process.argv` values,
   * but it can be overridden by providing the `argv` parameter. It returns a Promise
   * of the value returned by the *Action* triggered.
   *
   * ::: warning Be careful
   * This method returns a `Promise`. You'll usually ignore the returned promise and call run() like this:
   *
   * ```ts
   * [...]
   * program.action(...)
   * program.run()
   * ```
   *
   * If you do add some `.catch()` handler to it, Caporal won't display any potential errors
   * that the promise could reject, and will let you the responsibility to do it.
   * :::
   *
   * @param argv Command line arguments to parse, default to `process.argv.slice(2)`.
   */
  async run(argv?: string[]): Promise<unknown> {
    if (!argv) {
      // used on web playground
      if (process.env.CAPORAL_CMD_LINE) {
        argv = process.env.CAPORAL_CMD_LINE.split(" ").slice(1)
        // defaut value for common usage
      } else {
        argv = process.argv.slice(2)
      }
    }

    /*
      Search for the command from args, then, if a default command exists,
      take it, otherwise take the command attached to the program,
      and lastly the help command/
    */
    const cmd = await this.findCommand(argv)

    // parse command line args
    const result = (this.parserData = parseArgv(cmd?.getParserConfig(), argv))

    /* 
      Run command with parsed args.
    */
    return this._run(result, cmd)
  }

  /**
   * Try to find the executed command from argv
   * If command cannot be found from argv, return the default command if any,
   * then the program-command if any, or finally `undefined`.
   * If argv is empty, and there is no defaultCommand or progCommand
   * use the help command
   *
   * @param argv
   */
  private async findCommand(argv: string[]): ReturnType<typeof findCommand> {
    return (await findCommand(this, argv)) || this.defaultCommand || this._progCommand
  }

  /**
   * Run a command, providing parsed data
   *
   * @param result
   * @param cmd
   * @internal
   */
  private async _run(result: ParserResult, cmd?: Command): Promise<unknown> {
    // Override logger level via ENV if needed
    const loggerLevel = this.getLogLevelOverride()
    if (loggerLevel && Object.keys(logger.levels).includes(loggerLevel)) {
      logger.level = loggerLevel
    }
    // try to run the command
    // try {
    if (!cmd) {
      // we may not have any associated command, but some global options may have been passed
      // process them, if any
      // Process any global options
      const processedResult = { ...result, errors: [], args: {} }
      const shouldStop = await processGlobalOptions(processedResult, this)
      
      if (shouldStop) {
        this.emit("run")
        return -1
      }

      const allCommands = await this.getAllCommands()
      const possibilities = flatMap(allCommands, (c) => [c.name, ...c.getAliases()])

      // todo: use case: "git unknown-command some args" will display "unknown command 'git'"
      // but should display "unknown command 'git unknown-command'"
      throw new UnknownOrUnspecifiedCommandError(this, possibilities, result.rawArgv[0])
    }
    const ret = await cmd.run(result)
    this.emit("run", ret, cmd)
    return ret
  }

  /**
   * Programmatic usage. Execute input command with given arguments & options
   *
   * Not ideal regarding type casting etc.
   *
   * @param args argv array
   * @param options options object
   * @param ddash double dash array
   * @public
   */
  async exec(
    args: string[],
    options: Record<string, ParserTypes> = {},
    ddash: string[] = [],
  ): Promise<unknown> {
    this._programmaticMode = true
    const cmd = await this.findCommand(args)
    options = mapKeys(options, (v, key) => kebabCase(key))
    return this._run(
      {
        args,
        options,
        line: args.join(" "),
        rawOptions: options,
        rawArgv: args,
        ddash,
      },
      cmd,
    )
  }
}
