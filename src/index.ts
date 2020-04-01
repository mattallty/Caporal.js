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
 * import { program } from "caporal"
 *
 * program
 *  .command(...)
 *  .action(...)
 * [...]
 * ```
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
 * @packageDocumentation
 * @module caporal
 */
import { Program } from "./program"
import chalk from "chalk"
import { Command } from "./command"

/**
 * @ignore
 */
export const program = new Program()

/**
 * @ignore
 */
export default program

export { Program, Command }

/**
 * @ignore
 */
export {
  /**
   * Validator flags
   */
  CaporalValidator as Validator,
  /**
   * @internal
   */
  CommandCreator,
  /**
   * @internal
   */
  CreateCommandParameters,
} from "./types"

/**
 * @ignore
 */
export { chalk }
