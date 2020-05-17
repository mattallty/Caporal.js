/**
 * @packageDocumentation
 * @module caporal/command
 */
import { validateCall } from "./validate-call"
import { logger } from "../logger"
import { createArgument } from "../argument"
import { createOption, processGlobalOptions } from "../option"
import { registerCompletion } from "../autocomplete"
import { Completer } from "../autocomplete/types"
import { getOptsMapping } from "../option/mapping"
import { isStringValidator, isBoolValidator } from "../validator/utils"
import type { Program } from "../program"
import { ActionError, NoActionError, BaseError, ValidationSummaryError } from "../error"
import {
  Action,
  ParserOptions,
  ParserResult,
  Option,
  Argument,
  CreateArgumentOpts,
  Configurator,
  CommandConfig,
  CreateOptionCommandOpts,
} from "../types"
import { CustomizedHelpOpts } from "../help/types"
import { customizeHelp } from "../help"
import { createConfigurator } from "../config"

/**
 * @ignore
 */
export const PROG_CMD = "__self_cmd"

/**
 * @ignore
 */
export const HELP_CMD = "help"

/**
 * Command class
 *
 */
export class Command {
  private program: Program
  private _action?: Action
  private _lastAddedArgOrOpt?: Argument | Option
  private _aliases: string[] = []
  private _name: string
  private _config: Configurator<CommandConfig>
  /**
   * Command description
   *
   * @internal
   */
  readonly description: string
  /**
   * Command options array
   *
   * @internal
   */
  readonly options: Option[] = []
  /**
   * Command arguments array
   *
   * @internal
   */
  readonly args: Argument[] = []

  /**
   *
   * @param program
   * @param name
   * @param description
   * @internal
   */
  constructor(
    program: Program,
    name: string,
    description: string,
    config: Partial<CommandConfig> = {},
  ) {
    this.program = program
    this._name = name
    this.description = description
    this._config = createConfigurator({ visible: true, ...config })
  }

  /**
   * Add one or more aliases so the command can be called by different names.
   *
   * @param aliases Command aliases
   */
  alias(...aliases: string[]): Command {
    this._aliases.push(...aliases)
    return this
  }

  /**
   * Name getter. Will return an empty string in the program-command context
   *
   * @internal
   */
  get name(): string {
    return this.isProgramCommand() ? "" : this._name
  }

  /**
   * Add an argument to the command.
   * Synopsis is a string like `<my-argument>` or `[my-argument]`.
   * Angled brackets (e.g. `<item>`) indicate required input. Square brackets (e.g. `[env]`) indicate optional input.
   *
   * Returns the {@link Command} object to facilitate chaining of methods.
   *
   * @param synopsis Argument synopsis.
   * @param description - Argument description.
   * @param [options] - Optional parameters including validator and default value.
   */
  argument(
    synopsis: string,
    description: string,
    options: CreateArgumentOpts = {},
  ): Command {
    this._lastAddedArgOrOpt = createArgument(synopsis, description, options)
    this.args.push(this._lastAddedArgOrOpt)
    return this
  }

  /**
   * Set the corresponding action to execute for this command
   *
   * @param action Action to execute
   */
  action(action: Action): Command {
    this._action = action
    return this
  }

  /**
   * Allow chaining command() calls. See {@link Program.command}.
   *
   */
  command(
    name: string,
    description: string,
    config: Partial<CommandConfig> = {},
  ): Command {
    return this.program.command(name, description, config)
  }

  /**
   * Makes the command the default one for the program.
   */
  default(): Command {
    this.program.defaultCommand = this
    return this
  }

  /**
   * Checks if the command has the given alias registered.
   *
   * @param alias
   * @internal
   */
  hasAlias(alias: string): boolean {
    return this._aliases.includes(alias)
  }

  /**
   * Get command aliases.
   * @internal
   */
  getAliases(): string[] {
    return this._aliases
  }

  /**
   * @internal
   */
  isProgramCommand(): boolean {
    return this._name === PROG_CMD
  }

  /**
   * @internal
   */
  isHelpCommand(): boolean {
    return this._name === HELP_CMD
  }

  /**
   * Hide the command from help.
   * Shortcut to calling `.configure({ visible: false })`.
   */
  hide(): Command {
    return this.configure({ visible: false })
  }

  /**
   * Add an option to the current command.
   *
   * @param synopsis Option synopsis like '-f, --force', or '-f, --file \<file\>', or '--with-openssl [path]'
   * @param description Option description
   * @param options Additional parameters
   */
  option(
    synopsis: string,
    description: string,
    options: CreateOptionCommandOpts = {},
  ): Command {
    const opt = (this._lastAddedArgOrOpt = createOption(synopsis, description, options))
    this.options.push(opt)
    return this
  }

  /**
   * @internal
   */
  getParserConfig(): Partial<ParserOptions> {
    const defaults: ParserOptions = {
      boolean: [],
      string: [],
      alias: getOptsMapping(this),
      autoCast: this.autoCast,
      variadic: [],
      ddash: false,
    }
    let parserOpts = this.options.reduce((parserOpts, opt) => {
      if (opt.boolean) {
        parserOpts.boolean.push(opt.name)
      }
      if (isStringValidator(opt.validator)) {
        parserOpts.string.push(opt.name)
      }
      if (opt.variadic) {
        parserOpts.variadic.push(opt.name)
      }
      return parserOpts
    }, defaults)

    parserOpts = this.args.reduce((parserOpts, arg, index) => {
      if (!this.isProgramCommand()) {
        index++
      }
      if (isBoolValidator(arg.validator)) {
        parserOpts.boolean.push(index)
      }
      if (isStringValidator(arg.validator)) {
        parserOpts.string.push(index)
      }
      if (arg.variadic) {
        parserOpts.variadic.push(index)
      }
      return parserOpts
    }, parserOpts)

    return parserOpts
  }

  /**
   * Return a reformated synopsis string
   * @internal
   */
  get synopsis(): string {
    const opts = this.options.length
      ? this.options.some((f) => f.required)
        ? "<OPTIONS...>"
        : "[OPTIONS...]"
      : ""
    const name = this._name !== PROG_CMD ? " " + this._name : ""

    return (
      this.program.getBin() +
      name +
      " " +
      this.args.map((a) => a.synopsis).join(" ") +
      " " +
      opts
    ).trim()
  }

  /**
   * Customize command help. Can be called multiple times to add more paragraphs and/or sections.
   *
   * @param text Help contents
   * @param options Display options
   */
  help(text: string, options: Partial<CustomizedHelpOpts> = {}): Command {
    customizeHelp(this, text, options)
    return this
  }

  /**
   * Configure some behavioral properties.
   *
   * @param props properties to set/update
   */
  configure(props: Partial<CommandConfig>): Command {
    this._config.set(props)
    return this
  }

  /**
   * Get a configuration property value.
   *
   * @internal
   * @param key Property key to get value for. See {@link CommandConfig}.
   */
  getConfigProperty<K extends keyof CommandConfig>(key: K): CommandConfig[K] {
    return this._config.get(key)
  }

  /**
   * Get the auto-casting flag.
   *
   * @internal
   */
  get autoCast(): boolean {
    return (
      this.getConfigProperty("autoCast") ?? this.program.getConfigProperty("autoCast")
    )
  }

  /**
   * Auto-complete
   */
  complete(completer: Completer): Command {
    if (!this._lastAddedArgOrOpt) {
      throw new Error(
        "Caporal setup error: you should only call `.complete()` after .argument() or .option().",
      )
    }
    registerCompletion(this._lastAddedArgOrOpt, completer)
    return this
  }

  /**
   * Toggle strict mode.
   * Shortcut to calling: `.configure({ strictArgsCount: strict, strictOptions: strict }).
   * By default, strict settings are not defined for commands, and inherit from the
   * program settings. Calling `.strict(value)` on a command will override the program
   * settings.
   *
   * @param strict boolean enabled flag
   */
  strict(strict = true): Command {
    return this.configure({
      strictArgsCount: strict,
      strictOptions: strict,
    })
  }

  /**
   * Computed strictOptions flag.
   *
   * @internal
   */
  get strictOptions(): boolean {
    return (
      this.getConfigProperty("strictOptions") ??
      this.program.getConfigProperty("strictOptions")
    )
  }
  /**
   * Computed strictArgsCount flag.
   *
   * @internal
   */
  get strictArgsCount(): boolean {
    return (
      this.getConfigProperty("strictArgsCount") ??
      this.program.getConfigProperty("strictArgsCount")
    )
  }

  /**
   * Enable or disable auto casting of arguments & options for the command.
   * This is basically a shortcut to calling `command.configure({ autoCast: enabled })`.
   * By default, auto-casting is inherited from the program configuration.
   * This method allows overriding what's been set on the program level.
   *
   * @param enabled
   */
  cast(enabled: boolean): Command {
    return this.configure({ autoCast: enabled })
  }

  /**
   * Visible flag
   *
   * @internal
   */
  get visible(): boolean {
    return this.getConfigProperty("visible")
  }

  /**
   * Run the action associated with the command
   *
   * @internal
   */
  async run(parsed: Partial<ParserResult>): Promise<unknown> {
    const data: ParserResult = {
      args: [],
      options: {},
      line: "",
      rawOptions: {},
      rawArgv: [],
      ddash: [],
      ...parsed,
    }

    try {
      // Validate args and options, including global options
      const result = await validateCall(this, data)
      const { args, options, ddash, errors } = result

      // Process any global options
      const shouldStop = await processGlobalOptions(result, this.program, this)
      if (shouldStop) {
        return -1
      }

      if (errors.length) {
        throw new ValidationSummaryError(this, errors)
      }

      if (!this._action) {
        throw new NoActionError(this)
      }

      return await this._action({
        args,
        options,
        ddash,
        logger,
        program: this.program,
        command: this,
      })
    } catch (err) {
      const ctor = Object.getPrototypeOf(err).constructor.name
      throw err instanceof BaseError && ctor !== "Error" ? err : new ActionError(err)
    }
  }
}

/**
 * Create a new command
 *
 * @internal
 */
export function createCommand(
  ...args: ConstructorParameters<typeof Command>
): InstanceType<typeof Command> {
  return new Command(...args)
}
