---
sidebarDepth: 2
---

# Getting started

Welcome aboard!

**Caporal** A full-featured framework for building awesome command-line applications with Node.js.
This getting started guide will help you learn the basics in a few minutes.

For Caporal **1.x users**, be sure to checkout the [migration guide](./migration.md).

## Install

Simply add `@caporal/core` as a dependency.

```bash
npm install @caporal/core
```

## Glossary

We will refer to the following expressions within this guide:

- **Program**: a cli app built using Caporal
- **Command**: a command within your program. A program can have multiple commands.
- **Action**: each command has an associated action run when executing the command.
- **Argument**: a command can have one or more arguments passed after the command.
- **Options**: Short and long options like `-f` or `--file` can be specified.

## Writing a program

### Hello world

Let's build the simplest program with Caporal: _Hello world_.

<<< @/examples/hello-world.js

This program contains only one **action**. An action is a function executed when the
program, or one of its commands, is run.

### Arguments

Let's get things more personal. by adding an **argument** `name` and making our program
displaying `Hello, ${name}!` when run.

<<< @/examples/hello.js

::: tip Angled brackets vs square brackets
angled brackets (e.g. `<item>`) indicate **required** input while square brackets
(e.g. `[env]`) indicate **optional** input. In the above example the `<name>` argument
is mandatory.
:::

Of course you can add **multiple arguments** just by chaining them:

<<< @/examples/hello-multi-args.js

### Options

Let's add a way to modify the greeting by adding a `--greeting` option to our program.

<<< @/examples/hello-with-option.js

Note that our `--greeting` option has a default value of `Hello`. We specified what we
called a long option, prefixed with a double dash. We can also specify an alternative
short notation like this:

<<< @/examples/hello-with-option-alt.js

[Learn more about Options](/guide/options).

### Commands

So far, our program only manage one possible action. Let's build something a little more
complex to illustrate **commands**.

<<< @/examples/pizza-hit.ts

Now our program contains 2 commands: `order` and `cancel`, which can be called this way:

```bash
# order a margherita with pepperoni on top
./pizza-hit.js order margherita -e pepperoni

# cancel an order
./pizza-hit.js cancel 12345
```

Note that in the previous _Hello world_ examples, even if there was no explicit _Command_
specified, Caporal still created a unnamed _Command_ under the hood (called a
_program-command_), directly attached to the program.
[Learn more about Commands](/guide/commands).

### Help generation

Caporal automatically generates a help command for you so you don't have to!

- `prog --help` and `prog help` will display global help.
- `prog help ${command}` `prog --help ${command}` and will display command-related help.

Checkout the [help section](/guide/help) of this guide to learn how to customize it.

## Publishing your CLI

Publishing your CLI is easy with npm. Simply specify the `bin` property inside your `package.json`:

```json
{
  "bin": {
    "pizza-hit": "src/pizza-hit.js"
  }
}
```

- When installing your package globally, as in `npm install -g my-package`, npm will
  install `src/pizza-hit.js` as a global executable named `pizza-hit`.
- When installing your package locally, as in `npm install my-package`, npm will install
  `src/pizza-hit.js` as an executable named `pizza-hit` inside `node_modules/.bin`.

Learn more about publishing your executable in the [npm documentation](https://docs.npmjs.com/files/package.json#bin).
