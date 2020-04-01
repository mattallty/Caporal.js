/**
 * A process mock for the web
 *
 * @packageDocumentation
 * @internal
 */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-console */
export const version = process.version
export const argv = ["node", "play.ts"]
export const execArgv = []
export const exitCode = 0
export const on = () => {}
export const once = () => {}
export const exit = function (code = 0) {
  if (code > 0) {
    return console.error(
      `[playground process exiting with code ${code} - usually a fatal error]`,
    )
  }
  console.debug(`[process exiting with code ${code}]`)
}
