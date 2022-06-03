/**
 * List of Caporal type aliases.
 *
 * @packageDocumentation
 * @module caporal/types
 */
//
import { Logger as WinstonLogger } from "winston"
import { Program } from "./program"
import { Command } from "./command"
import { BaseError } from "./error"

/**
 * The Caporal logger interface. It extends the [Winston](https://github.com/winstonjs/winston) Logger interface
 * and adds the following properties & methods.
 * @noInheritDoc
 */
export interface Logger extends WinstonLogger {
  /**
   * Allow to force disabling colors.
   */
  disableColors(): void
  /**
   * Tells Caporal if colors are enabled or not.
   */
  colorsEnabled: boolean
}

export type GlobalOptions = Map<Option, Action | undefined>

/**
 * Caporal-provided validator flags.
 */
export enum CaporalValidator {
  /**
   * Number validator. Check that the value looks like a numeric one
   * and cast the provided value to a javascript `Number`.
   */
  NUMBER = 1,
  /**
   * Boolean validator. Check that the value looks like a boolean.
   * It accepts values like `true`, `false`, `yes`, `no`, `0`, and `1`
   * and will auto-cast those values to `true` or `false`.
   */
  BOOLEAN = 2,
  /**
   * String validator. Mainly used to make sure the value is a string,
   * and prevent Caporal auto-casting of numerics values and boolean
   * strings like `true` or `false`.
   */
  STRING = 4,
  /**
   * Array validator. Convert any provided value to an array. If a string is provided,
   * this validator will try to split it by commas.
   */
  ARRAY = 8,
}

type FunctionValidatorArgument = ParsedArgument | ParsedOption

export interface FunctionValidator<T> {
  (value: T): Promisable<T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Validator<T extends FunctionValidatorArgument = any> =
  | RegExp
  | FunctionValidator<T>
  | CaporalValidator
  | ParserTypes[]

/**
 * @internal
 */
export interface ValidatorWrapper {
  validate(
    value: ParsedArgument | ParsedOption,
  ): ParserTypes | ParserTypes[] | Promise<ParserTypes>
  getChoices(): ParserTypes[]
}

export interface OptionSynopsis {
  name: string
  notation: string
  shortName?: string
  shortNotation?: string
  longName?: string
  longNotation?: string
  allNames: string[]
  allNotations: string[]
  synopsis: string
  valueRequired: boolean
  valueType?: OptionValueType
  variadic: boolean
}

/**
 * Option possible value.
 *
 */
export enum OptionValueType {
  /**
   * Value is optional.
   */
  Optional,
  /**
   * Value is required.
   */
  Required,
  /**
   * Option does not have any possible value
   */
  None,
}

/**
 * Option properties
 */
export interface CreateOptionCommandOpts {
  /**
   * Optional validator
   */
  validator?: Validator
  /**
   * Default value for the Option
   */
  default?: ParsedOption
  /**
   * Set the Option as itself required
   */
  required?: boolean
  /**
   * Hide the option from help
   */
  hidden?: boolean
}

/**
 * Option properties
 */
export interface CreateOptionProgramOpts extends CreateOptionCommandOpts {
  /**
   * Set to `true` for a global option.
   */
  global?: boolean
  /**
   * Action to call when a global-option is passed.
   * Only available for global options, e.g. when `global` is set to `true`.
   */
  action?: Action
}

export interface CreateArgumentOpts {
  /**
   * Argument validator.
   */
  validator?: Validator
  /**
   * Argument default value.
   */
  default?: ParsedArgument
}

export interface ArgumentSynopsis {
  /**
   * Argument name.
   */
  readonly name: string
  /**
   * Boolean indicating if the argument is required.
   */
  readonly required: boolean
  /**
   * Synopsis string.
   */
  readonly synopsis: string
  /**
   * Boolean indicating if the argument is valiadic,
   * e.g. can be repeated to contain an array of values.
   */
  readonly variadic: boolean
}

export interface Argument extends ArgumentSynopsis {
  readonly default?: ParsedArgument
  readonly description: string
  readonly choices: ParsedArgument[]
  readonly validator?: Validator
  typeHint?: string
  kind: "argument"
}

export interface Option extends OptionSynopsis {
  readonly boolean: boolean
  readonly default?: ParsedOption
  readonly description: string
  readonly choices: ParsedOption[]
  readonly validator?: Validator
  readonly required: boolean
  readonly visible: boolean
  typeHint?: string
  kind: "option"
}

/**
 * A type that could be wrapped in a Promise, or not
 */
export type Promisable<T> = T | Promise<T>

/**
 * Parameters object passed to an {@link Action} function
 */
export interface ActionParameters {
  /**
   * Parsed command line arguments
   */
  args: ParsedArgumentsObject
  /**
   * If the `dash` (double dash) config property is enabled,
   * this *array* will contain all arguments present
   * after '--'.
   */
  ddash: ParsedArguments
  /**
   * Parsed command line options
   */
  options: ParsedOptions
  /**
   * Program instance
   */
  program: Program
  /**
   * Contextual command, if any
   */
  command?: Command
  /**
   * Logger instance
   */
  logger: Logger
}

/**
 * An action is a function that will be executed upon a command call.
 */
export interface Action {
  (params: ActionParameters): unknown
}

export interface ErrorMetadata {
  [meta: string]: unknown
}

export type ParserTypes = string | number | boolean

/**
 * Available options for the Caporal internal parser.
 * Arguments must be referenced by their position (0-based) and options by their
 * name (short or long)
 * in {@link ParserOptions.boolean boolean}, {@link ParserOptions.string string}
 * and {@link ParserOptions.variadic variadic} parser options.
 *
 */
export interface ParserOptions {
  /**
   * List of {@link Argument Arguments} and {@link Options Options} to be casted
   * as *booleans*.
   * Arguments must be referenced by their position (0-based) and options by their
   * name (short or long).
   *
   * **Example**
   *
   * ```ts
   * import { parseArgv } from "caporal/parser"
   *
   * parseArgv({
   *  boolean: [2, 'sendEmail']
   * })
   *
   * // ./my-cli-app first-arg second-arg 3rd-arg --sendEmail=1
   * // -> "3rd-arg" will be casted to boolean as well as "--sendEmail"
   * ```
   */
  boolean: (string | number)[]
  /**
   * List of {@link Argument Arguments} and {@link Options Options} to be casted
   * as *strings*.
   * Arguments must be referenced by their position (0-based) and options by their
   * name (short or long).
   *
   * **Example**
   *
   * ```ts
   * import { parseArgv } from "caporal/parser"
   *
   * parseArgv({
   *  string: [1]
   * })
   *
   * // ./my-cli-app first-arg 2
   * // -> second arg "2" will be casted to string instead of number
   * ```
   */
  string: (string | number)[]
  /**
   * List of variadic {@link Argument Arguments} and {@link Options Options}, meaning
   * that there value is an `Array`.
   *
   * Arguments must be referenced by their position (0-based) and options by their
   * name (short or long).
   *
   * **Example**
   *
   * ```ts
   * import { parseArgv } from "caporal/parser"
   *
   * parseArgv({
   *  variadic: [1]
   * })
   *
   * // ./pizza order margherita regina --add sausages --add basil
   * {
   *   args: ['order', ['margherita', 'regina']]
   *   options: {
   *     add: ['sausages', 'basil']
   *   }
   * }
   * ```
   */
  variadic: (string | number)[]
  /**
   * Double-dash (--) handling mode. If `true`, the parser will populate the
   * {@link ParserResult.ddash} property, otherwise, arguments will be added
   * to {@link ParserResult.args}.
   */
  ddash: boolean
  /**
   * Option aliases map.
   */
  alias: Record<string, string>
  /**
   * Enable or disable autocasting of arguments and options. Default to `true`.
   */
  autoCast: boolean
}

export type ParsedArgument = ParserTypes | ParserTypes[]
export type ParsedArguments = ParsedArgument[]
export interface ParsedArgumentsObject {
  [arg: string]: ParsedArgument
}

export type ParsedOption = ParserTypes | ParserTypes[]
export interface ParsedOptions {
  [opt: string]: ParsedOption
}
/**
 * @internal
 */
export interface ArgumentsRange {
  min: number
  max: number
}

export interface ParserResult {
  args: ParsedArguments
  options: ParsedOptions
  rawOptions: ParsedOptions
  line: string
  rawArgv: string[]
  ddash: ParsedArguments
}

export interface ParserProcessedResult extends Omit<ParserResult, "args"> {
  args: ParsedArgumentsObject
  errors: BaseError[]
}

export interface CreateCommandParameters {
  program: Program
  createCommand(description?: string): Command
}
export interface CommandCreator {
  (options: CreateCommandParameters): Command
}

/**
 * Available configuration properties for the program.
 */
export interface ProgramConfig {
  /**
   * Strict checking of arguments count. If enabled, any additional argument willl trigger an error.
   * Default to `true`.
   */
  strictArgsCount: boolean
  /**
   * Strict checking of options provided. If enabled, any unknown option will trigger
   * an error.
   * Default to `true`.
   */
  strictOptions: boolean
  /**
   * Auto-casting of arguments and options.
   * Default to `true`.
   */
  autoCast: boolean
  /**
   * Environment variable to check for log level override.
   * Default to "CAPORAL_LOG_LEVEL".
   */
  logLevelEnvVar: string
}
export interface CommandConfig {
  /**
   * Strict checking of arguments count. If enabled, any additional argument willl
   * trigger an error.
   */
  strictArgsCount?: boolean
  /**
   * Strict checking of options provided. If enabled, any unknown option will trigger
   * an error.
   */
  strictOptions?: boolean
  /**
   * Auto-casting of arguments and options.
   */
  autoCast?: boolean
  /**
   * Visibility of the command in help.
   */
  visible: boolean
}

export interface Configurator<T extends Record<string, unknown>> {
  get<K extends keyof T>(key: K): T[K]
  getAll(): T
  set(props: Partial<T>): T
  reset(): T
}
