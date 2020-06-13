/**
 * @packageDocumentation
 * @module caporal/option
 */

import {
  Option,
  OptionValueType,
  CreateOptionProgramOpts,
  CreateOptionCommandOpts,
  Action,
  ActionParameters,
  GlobalOptions,
  ParserProcessedResult,
} from "../types"
import { checkValidator, isBoolValidator, getTypeHint } from "../validator/utils"
import { parseOptionSynopsis } from "./utils"
import { logger } from "../logger"
import type { Command } from "../command"
import type { Program } from "../program"
import { getHelp } from "../help"
import { installCompletion, uninstallCompletion } from "../autocomplete"

/**
 * Create an Option object
 *
 * @internal
 * @param synopsis
 * @param description
 * @param options
 */
export function createOption(
  synopsis: string,
  description: string,
  options: CreateOptionProgramOpts | CreateOptionCommandOpts = {},
): Option {
  // eslint-disable-next-line prefer-const
  let { validator, required, hidden } = options

  // force casting
  required = Boolean(required)

  checkValidator(validator)
  const syno = parseOptionSynopsis(synopsis)
  let boolean = syno.valueType === OptionValueType.None || isBoolValidator(validator)
  if (validator && !isBoolValidator(validator)) {
    boolean = false
  }

  const opt: Option = {
    kind: "option",
    default: boolean == true ? Boolean(options.default) : options.default,
    description,
    choices: Array.isArray(validator) ? validator : [],
    ...syno,
    required,
    visible: !hidden,
    boolean,
    validator,
  }

  opt.typeHint = getTypeHint(opt)

  return opt
}

export { showHelp }

/**
 * Display help. Return false to prevent further processing.
 *
 * @internal
 */
const showHelp: Action = async ({ program, command }: ActionParameters) => {
    const help = await getHelp(program, command)
    // eslint-disable-next-line no-console
    console.log(help)
    program.emit("help", help)
    return false
  },
  /**
   * Display program version. Return false to prevent further processing.
   *
   * @internal
   */
  showVersion: Action = ({ program }: ActionParameters) => {
    // eslint-disable-next-line no-console
    console.log(program.getVersion())
    program.emit("version", program.getVersion())
    return false
  },
  /**
   * Disable colors in output
   *
   * @internal
   */
  disableColors: Action = ({ logger }: ActionParameters) => {
    logger.disableColors()
  },
  /**
   * Set verbosity to the maximum
   *
   * @internal
   */
  setVerbose: Action = ({ logger }: ActionParameters) => {
    logger.level = "silly"
  },
  /**
   * Makes the program quiet, eg displaying logs with level >= warning
   */
  setQuiet: Action = ({ logger }: ActionParameters) => {
    logger.level = "warn"
  },
  /**
   * Makes the program totally silent
   */
  setSilent: Action = ({ logger }: ActionParameters) => {
    logger.silent = true
  },
  /**
   * Install completion
   */
  installComp: Action = ({ program }: ActionParameters) => {
    return installCompletion(program)
  },
  /**
   * Uninstall completion
   */
  uninstallComp: Action = ({ program }: ActionParameters) => {
    return uninstallCompletion(program)
  }

/**
 * Global options container
 *
 * @internal
 */
let globalOptions: undefined | GlobalOptions

/**
 * Get the list of registered global flags
 *
 * @internal
 */
export function getGlobalOptions(): GlobalOptions {
  if (globalOptions === undefined) {
    globalOptions = setupGlobalOptions()
  }
  return globalOptions
}

/**
 * Set up the global flags
 *
 * @internal
 */
function setupGlobalOptions(): GlobalOptions {
  const help = createOption("-h, --help", "Display global help or command-related help."),
    verbose = createOption(
      "-v, --verbose",
      "Verbose mode: will also output debug messages.",
    ),
    quiet = createOption(
      "--quiet",
      "Quiet mode - only displays warn and error messages.",
    ),
    silent = createOption(
      "--silent",
      "Silent mode: does not output anything, giving no indication of success or failure other than the exit code.",
    ),
    version = createOption("-V, --version", "Display version."),
    color = createOption("--no-color", "Disable use of colors in output."),
    installCompOpt = createOption(
      "--install-completion",
      "Install completion for your shell.",
      { hidden: true },
    ),
    uninstallCompOpt = createOption(
      "--uninstall-completion",
      "Uninstall completion for your shell.",
      { hidden: true },
    )

  return new Map([
    [help, showHelp],
    [version, showVersion],
    [color, disableColors],
    [verbose, setVerbose],
    [quiet, setQuiet],
    [silent, setSilent],
    [installCompOpt, installComp],
    [uninstallCompOpt, uninstallComp],
  ])
}

export function resetGlobalOptions(): GlobalOptions {
  return (globalOptions = setupGlobalOptions())
}

/**
 * Disable a global option
 *
 * @param name Can be the option short/long name or notation
 */
export function disableGlobalOption(name: string): boolean {
  const opts = getGlobalOptions()
  for (const [opt] of opts) {
    if (opt.allNames.includes(name) || opt.allNotations.includes(name)) {
      return opts.delete(opt)
    }
  }
  return false
}

/**
 * Add a global option to the program.
 * A global option is available at the program level,
 * and associated with one given {@link Action}.
 *
 * @param a {@link Option} instance, for example created using {@link createOption()}
 */
export function addGlobalOption(opt: Option, action?: Action): GlobalOptions {
  return getGlobalOptions().set(opt, action)
}

/**
 * Process global options, if any
 * @internal
 */
export async function processGlobalOptions(
  parsed: ParserProcessedResult,
  program: Program,
  command?: Command,
): Promise<boolean> {
  const { options } = parsed
  const actionsParams = { ...parsed, logger, program, command }
  const promises = Object.entries(options).map(([opt]) => {
    const action = findGlobalOptAction(opt)
    if (action) {
      return action(actionsParams)
    }
  })
  const results = await Promise.all(promises)
  return results.some((r) => r === false)
}

/**
 * Find a global Option action from the option name (short or long)
 *
 * @param name Short or long name
 * @internal
 */
export function findGlobalOptAction(name: string): Action | undefined {
  for (const [opt, action] of getGlobalOptions()) {
    if (opt.allNames.includes(name)) {
      return action
    }
  }
}

/**
 * Find a global Option by it's name (short or long)
 *
 * @param name Short or long name
 * @internal
 */
export function findGlobalOption(name: string): Option | undefined {
  for (const [opt] of getGlobalOptions()) {
    if (opt.allNames.includes(name)) {
      return opt
    }
  }
}

export function isOptionObject(obj: unknown): obj is Option {
  return typeof obj == "object" && obj !== null && (obj as Option).kind == "option"
}
