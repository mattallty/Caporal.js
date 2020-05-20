# Action

An action is a function executed when the program or one of its commands is run.
Actions can be synchronous functions - or asynchronous by returning a Promise.

## Setting an action

### `.action(( params: ActionParameters ): unknown | Promise<unknown>)`

Actions take the following object as their only parameter:

```ts
interface ActionParameters {
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
```

Checkout the full [ActionParameters interface](/api/interfaces/caporal_types.actionparameters).

If an error is thrown within an action, or if the Promise returned is finally
rejected, Caporal will display the error in the terminal.
By default, only the error message will be displayed. If your program is run using
the `--verbose` global option, the error stack will also be displayed.

## Examples

Here are some actions examples.

### Using `logger`

```ts
// You'll likely want to use those 3 properties
program.action(function ({ args, options, logger }) {
  // make use of the provided logger
  logger.info("My command was called with: ")
  logger.info("args: %j", args)
  logger.info("options: %j", options)
})
```

### Throwing an error

```ts
program.action(function ({ args, options, logger }) {
  if (options.myOption !== "value") {
    // Caporal will automatically print this error
    throw Error("Something bad happened!")
  }
})
```

### Async action

In this example, if the request succeeds, _"Request succeeded!"_ will be displayed.
If the _fetch_ promise is rejected, Caporal will automatically print the error.

```ts
// Async action
program.action(function ({ args, options, logger }) {
  return fetch("https://my.url").then((response) => {
    logger.info("Request succeeded!")
  })
})
```
