/**
 * Main Caporal module.
 *
 * ## program
 *
 * This represents your program. You don't have to instanciate the {@link Program} class,
 * it's already done for you.
 *
 * **Usage**
 *
 * ```ts
 * // The Program instance generated for you
 * import program from "@caporal/core"
 *
 * program
 *  .command(...)
 *  .action(...)
 * [...]
 * ```
 *
 *
 * ## parseArgv()
 *
 *  This is the command line parser internaly used by Caporal.
 *
 * ::: tip Advanced usage
 * Usually, **you won't need to use the parser** directly, but if you
 * just want to parse some args without all capabilities brought
 * by Caporal, feel free to play with it.
 * :::
 *
 * **Usage**
 *
 * ```ts
 * import { parseArgv } from "@caporal/core"
 *
 * const {args, options} = parseArgv({
 *  // ... options
 * })
 * ```
 *
 * Checkout `parseArgv()` [documentation here](/api/modules/parser.md).
 *
 *
 * ## chalk
 *
 * `chalk` npm module re-export
 *
 * **Usage**
 *
 * ```ts
 * import { program, chalk } from "caporal"
 *
 * program
 *  .command('pay')
 *  .argument('<amount>', 'Amount to pay', Validator.NUMBER)
 *  .action(({logger, args}) => {
 *    logger.info("You paid $%s", chalk.red(args.amount))
 *  })
 * [...]
 * ```
 *
 *
 * @packageDocumentation
 * @module @caporal/core
 */
import { Program } from "./program"
export { Command } from "./command"
export * from "./types"

/**
 * @ignore
 */
export { default as chalk } from "chalk"
/**
 * @ignore
 */
export { parseArgv, parseLine } from "./parser"

/**
 * @ignore
 */
export const program = new Program()

/**
 * @ignore
 */
export default program

/**
 * @ignore
 */
export { Program }
