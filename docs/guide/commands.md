# Commands

## Creating a command

### `.command(name: string, description?: string)`

When developing a very simple program, Caporal will implicitly create a Command for you.

```js
program
  .argument(/* ... */)
  // your action is in fact attached to the program command.
  .action(/* ... */)
```

When writing complex programs, you'll likely want to manage multiple commands.
Use the `.command()` method to specify them:

```js{3,7}
program
  // a first command
  .command("my-command", "Optional command description used in help")
  .argument(/* ... */)
  .action(/* ... */)
  // a second command
  .command("sec-command", "...")
  .option(/* ... */)
  .action(/* ... */)
```

## Aliasing

### `.alias(...aliases: string[])`

You can create one or multiple aliases for your command using `.alias()`:

```js{3}
program
  .command("install", "My command named `install`")
  .alias("i", "setup")
  .action(/* ... */)
```

This command can be called as `my-program install`, `my-program i`, and `my-program setup`.

## Default command

### `.default()`

Use `.default()` to make your command the default one of your program.

```js{4}
program
  // the install command is the default command for the program
  .command("install", "My command named `install`")
  .default()
  .action(/* ... */)
  // a second command
  .command("uninstall", "My command named `uninstall`")
  .action(/* ... */)
```

Running `my-program` without specifying the command will execute
the default `install` command.

## Adding arguments

### `.argument(synopsis, description, [opts])`

| Parameter        | Type        | Description                                                                                       |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `synopsis`       | `string`    | Argument synopsis. Specify `<my-arg>` for a mandatory argument or `[my-arg]` for an optional one. |
| `description`    | `string`    | Argument description displayed in help.                                                           |
| `opts`           |             | Other optional properties                                                                         |
| `opts.validator` | `Validator` | A [Validator](/guide/validation) in charge of validating the value provided by the user.          |
| `opts.default`   | `any`       | A default value when not provided                                                                 |

#### Argument synopsis

An argument synopsis consists of one word, the argument name, enclosed by angled brackets
or square brackets. Angled brackets (e.g. \<item\>) indicate a required argument while
square brackets (e.g. [env]) indicate an optional argument.

### Variadic arguments

You can specify arguments as being variadic (e.g. repeatable) by suffixing their name
by `...`.

```js{4}
program
  // the install command is the default command for the program
  .command("install", "My command named `install`")
  .argument("<package...>", "Package(s) to install")
  .action(({ logger, args }) => {
    // args.package is an array
    logger.info("Installing %d package(s)", args.package.length)
  })
```

## Adding options

### `.option(synopsis, description, [opts])`

| Parameter        | Type        | Description                                                   |
| ---------------- | ----------- | ------------------------------------------------------------- |
| `synopsis`       | `string`    | Option [synopsis](/guide/options.md#synopsis).                |
| `description`    | `string`    | Option description that will be displayed in help.            |
| `opts`           | `object`    | Other optional properties                                     |
| `opts.validator` | `Validator` | [Validator](/guide/validators) to be used.                    |
| `opts.default`   | `any`       | Default value.                                                |
| `opts.required`  | `boolean`   | Specify if the option itself is required. Default to `false`. |

#### Option synopsis

An option synopsis consists of short and/or long notations plus a potential expected value
placeholder. let's take some examples:

- `-f <file>` means that the short option `-f` has a mandatory value associated.
- `-f [file]` means that the short option `-f` has an optional value.
- `-v` (without a value placeholder) means the option is a boolean. If `-v` is provided in
  the command line, its value will be `true`.
- `-f, --file <file>` means the option can be provided either by its short notation `-f`
  or by its long notation `--file`. You don't have to repeat the placeholder twice in that
  case.
- `-f <files...>` means a variadic option (using `...`), e.g. the option can be repeated.
  The resulting value for this option will be an array.

## Help

### Customizing help

#### `.help(contents: string, opts)`

`.help()` lets you customize the command help.
Learn more in the [help section](/guide/help) of this guide.

### Hiding from help

#### `.hide()`

Hide your command from help.

```js{6}
program
  .command("install", "My command named `install`")
  .action(/* ... */)
  // This command won't appear in help
  .command("uninstall", "My command named `uninstall`")
  .hide()
```

In the example above, running `my-program help` will only list the `install` command.

## Casting values

### `.cast(enable: boolean)`

By default, Caporal auto-cast arguments and options values like numbers and booleans.
You can disable this behavior for a specific command using `.cast(false)`.

```js{5}
program
  .command("install", "My command named `install`")
  .action(/* ... */)
  .command("uninstall", "My command named `uninstall`")
  .cast(false)
```

## Strict mode

### `.strict(enable: boolean)`

By default, strict settings are not defined for commands, and inherit from the
[program settings](program.md#strict-mode). Calling `.strict(value)` on a command will
override the program settings.
