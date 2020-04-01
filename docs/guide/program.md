# Program

A `Program` instance is directly generated for you by Caporal. This is what you get when
requiring Caporal:

```js
const { program } = require("caporal")
```

## Name and description

### `.name(name: string)` and `.description(description: string)`

Define the name and description of your program using [.name()](../api/classes/caporal_program.program.md#name)
and [.description()](../api/classes/caporal_program.program.md#description).
These information are optional but strongly encouraged as they will be displayed in your
program help.

```js
// [...]
program
  .name("My super program")
  .description("A program that does something.")
  .action(/*...*/)
// [...]
```

Note that Caporal will detect **your program version** by reading it from your `package.json`.
If you want to override it, use the [.version()](../api/classes/caporal_program.program.md#version)
method to do it.

## Adding arguments and options

### `.argument(synopsis: string, description: string, options: object)`

### `.option(synopsis: string, description: string, options: object)`

For a simple program, you may want to add arguments and options directly to
the `Program` instance.
Adding arguments & options directly to the program make sense if it only does one thing
(e.g: a program that does **not** have commands).
To do so, use [.argument()](../api/classes/caporal_program.program.md#argument) and
[.option()](../api/classes/caporal_program.program.md#option) like below:

```js
#!/usr/bin/env node
const { program } = require("caporal")
const fs = require("fs")
// This program does only one thing, so there is no declared commands (using `.command()`)
program
  .name("Count lines")
  .argument("<file>", "File name") // add an argument to the program
  .option("--print-size", "print file size") // add an option to the program
  .action(({ logger, args, options }) => {
    const contents = fs.readFileSync(args.file, "utf-8")
    const lines = contents.split(options.eol)
    logger.info("%d lines", lines.length)
    if (options.printSize) {
      const { size } = fs.statSync(args.file)
      logger.info("File size: %d bytes", size)
    }
  })

program.run()
/*
$ ./count.js file.txt --print-size
39 lines
File size: 782 bytes
*/
```

In fact, when you declare arguments and options this way, they aren't really attached to
the program, but on what we call the _program-command_, which is an anonymous,
auto-generated Command called when executing a program that does not contain any declared
command.

To learn how to add arguments and options to your commands,
checkout the [Commands guide](/guide/commands).

### Global options

Those kind of options are set on the program level and available globally, in all commands.
Caporal provides the following global options by default:

| Notation        | Description                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `-h, --help`    | Display global help or command-related help                                                                 |
| `-v, --verbose` | Verbose mode: program will also output debug messages.                                                      |
| `--quiet`       | Quiet mode: only displays warnings and error messages                                                       |
| `--silent`      | Silent mode: does not output anything, giving no indication of success or failure other than the exit code. |
| `-V, --version` | Display version.                                                                                            |
| `--no-color`    | Disable use of colors in output                                                                             |

#### Adding a global option

Use the `global` property of the [.option()](../api/classes/caporal_program.program.md#option)
method to add a global option to your program.

```ts
program.option("--project", "Project ID", {
  global: true,
  action: () => {}, // Optional action executed when the global option is provided
})
```

#### Disabling a global option

#### `.disableGlobalOption(option: string)`

You can totally disable a global option, including those provided by default using
[.disableGlobalOption()](../api/classes/caporal_program.program.md#disableglobaloption):

```ts
// disable the verbose option by providing its long notation
program.disableGlobalOption("--verbose")

// OR by providing its short notation
program.disableGlobalOption("-v")

// OR by providing its name
program.disableGlobalOption("verbose")
```

## Defining an Action

### `.action(action: Function)`

Use [.action()](../api/classes/caporal_program.program.md#action) to set the program
action, e.g. the function that will be executed when running the program. As explained in
the previous paragraph, setting an action on the program level only makes sense for simple,
mono-command programs.

```ts
// [...]
program.action(({ logger }) => {
  logger.info("Hey there!")
})
// [...]
```

Actions can be synchronous, asynchronous, throw errors, and more!
Checkout the [Action guide](action.md) to learn more about actions.

## Adding commands

### Manually

### `.command(name: string, description: string, config?: Object)`

Use [.command()](../api/classes/caporal_program.program.md#command) to add a command to
your program.

<<< @/examples/pizza-hit.ts{6,17}

In the example above, our program contains 2 commands: `order` and `cancel`, which can be
called this way:

```sh
# order a margherita with pepperoni on top
./pizza-hit.js order margherita -e pepperoni

# cancel an order
./pizza-hit.js cancel 12345
```

[.command()](../api/classes/caporal_program.program.md#command) will return the created
command, allowing you to chain [.argument()](../api/classes/caporal_program.program.md#argument)
and [.option()](../api/classes/caporal_program.program.md#option) methods to add arguments
and options to it.

### Auto discovery

::: tip Advanced usage
This feature may be interesting for programs handling a large number of commands,
or for people who would like to split their commands into several files.
:::

### `.discover(path: string)`

Commands can also be loaded dynamically from the filesystem
using [.discover()](../api/classes/caporal_program.program.md#discover).

<<< @/examples/discover.ts{9}

Commands must be organized into files (one command per file) in a file tree like:

```
discover/commands
├── config
│   ├── set.ts
│   └── unset.ts
├── create
│   ├── job.ts
│   └── service.ts
├── create.ts
├── describe.ts
└── get.ts
```

The code above shows a short example of `kubectl` commands and subcommands.
In this particular case, Caporal will generate the following commands:

- kubectl `get`
- kubectl `config set`
- kubectl `config unset`
- kubectl `create`
- kubectl `create job`
- kubectl `create service`
- kubectl `describe`
- kubectl `get`

Notice how the `config` command has a mandatory subcommand associated,
hence cannot be called without a subcommand, contrary to the `create` command.
This is why there is no `config.ts` in the tree.

## Custom Logger

### `.logger(logger: Logger)`

Caporal uses [Winston](https://github.com/winstonjs/winston#readme) for logging.
You can provide your own logger using `.logger()`. Your logger should implement the
[Logger](../api/interfaces/caporal_types.logger.md) interface, which basically extends
Winston's `Logger` interface.
Checkout `src/logger/index.ts` to learn more.

```js{6}
// [...]
const myLogger = require("./my-logger")
program
  .name("my-proggram")
  .description("My super program")
  .logger(myLogger)
  .action(/* ... */)
// [...]
```

## Strict mode

### `.strict(enabled: boolean)`

By default, the program is executed in what we call strict mode, meaning
that arguments & options are checked following these rules:

- No additional arguments are allowed
- No unknown options are allowed

You can disable the strict mode by calling `.strict(false)`:

```ts{5}
// [...]
program
  .name("prog")
  .description("My super program description")
  .strict(false)
  .action(/* ... */)
// [...]
```

Strict mode is inherited by all commands, but can also be overridden by them.

## Auto-casting

### `.cast(enabled: boolean)`

By default, the program automatically cast numeric and boolean values.
To disable this behavior at the program level, use `.cast(false)`.

```ts{5}
// [...]
program
  .name("prog")
  .description("My super program description")
  .cast(false)
  .action(/* ... */)
// [...]
```

Auto-casting mode is inherited by all commands, but can also be overridden by them.

## Customizing help

### `.help(text: string, options: object)`

You can customize the auto-generated help of your program using
[.help()](../api/classes/caporal_program.program.md#help).
Checkout the [help section](/guide/help) of this guide to learn how.

## Running the program

### `.run(args?: string[])`

You'll usually run the program using

Caporal will automatically detect command line arguments from `process.argv` values,
but it can be overridden by providing the `argv` parameter.
It returns a Promise of the value returned by the Action triggered.

::: warning Be careful
This method returns a `Promise`. You'll usually ignore the returned promise and call
run() like this:

```ts{7}
[...]
program
  .name("prog")
  .description("My super program description")
  .action(/* ... */)

program.run()
```

If you do add some `.catch()` handler to it, Caporal won't display any potential errors
that the promise could reject, and will let you the responsibility to do it.
:::

### Programmatic usage

If you ever want to execute you program outside the terminal, from within another app
for example, you can use the programmatic API to do so, using the
[.exec()](../api/classes/caporal_program.program.md#exec) method.

```ts{4}
import { program } from "/path/to/your/program"

program
  .exec(args, {my: "options"})
  .then(actionResult => {
    // do something with your action result
  })
  .catch(err) {
    console.error(err)
  }
```
