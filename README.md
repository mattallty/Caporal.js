<p align="center">
    <img src="https://github.com/mattallty/Caporal.js/raw/master/assets/caporal.png" width="500" height="177">
</p>

[![Travis](https://img.shields.io/travis/mattallty/Caporal.js.svg)](https://travis-ci.org/mattallty/Caporal.js)
[![Codacy grade](https://img.shields.io/codacy/grade/6e5459fd36e341d1bd27414cf6b06e5c.svg)](https://www.codacy.com/app/matthiasetienne/Caporal-js/dashboard)
[![Codacy coverage](https://img.shields.io/codacy/coverage/6e5459fd36e341d1bd27414cf6b06e5c.svg)]()
[![npm](https://img.shields.io/npm/v/caporal.svg)](https://www.npmjs.com/package/caporal)
[![npm](https://img.shields.io/npm/dm/caporal.svg)](https://www.npmjs.com/package/caporal)
[![David](https://img.shields.io/david/mattallty/Caporal.js.svg)](https://david-dm.org/mattallty/Caporal.js)
[![GitHub stars](https://img.shields.io/github/stars/mattallty/Caporal.js.svg?style=social&label=Star)](https://github.com/mattallty/Caporal.js/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mattallty/Caporal.js.svg?style=social&label=Fork)](https://github.com/mattallty/Caporal.js/network)

# Caporal

> A full-featured framework for building command line applications (cli) with node.js,
> including help generation, colored output, verbosity control, custom logger, coercion
> and casting, typos suggestions, and auto-complete for bash/zsh/fish.

## Install

Simply add Caporal as a dependency:
```bash
$ npm install caporal

# Or if you are using yarn (https://yarnpkg.com/lang/en/)
$ yarn add caporal
```
## Glossary

* **Program**: a cli app that you can build using Caporal
* **Command**: a command within your program. A program may have multiple commands.
* **Argument**: a command may have one or more arguments passed after the command.
* **Options**: a command may have one or more options passed after (or before) arguments.

Angled brackets (e.g. `<item>`) indicate required input. Square brackets (e.g. `[env]`) indicate optional input.

## Examples

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  // you specify arguments using .argument()
  // 'app' is required, 'env' is optional
  .command('deploy', 'Deploy an application')
  .argument('<app>', 'App to deploy', /^myapp|their-app$/)
  .argument('[env]', 'Environment to deploy on', /^dev|staging|production$/, 'local')
  // you specify options using .option()
  // if --tail is passed, its value is required
  .option('--tail <lines>', 'Tail <lines> lines of logs after deploy', prog.INT)
  .action(function(args, options, logger) {
    // args and options are objects
    // args = {"app": "myapp", "env": "production"}
    // options = {"tail" : 100}
  });

prog.parse(process.argv);

// ./myprog deploy myapp production --tail 100
```

Or else if you prefer `typescript`
```javascript
#!/usr/bin/env node
import * as prog from 'caporal';
prog
  .version('1.0.0')
  // you specify arguments using .argument()
  // 'app' is required, 'env' is optional
  .command('deploy', 'Deploy an application')
  .argument('<app>', 'App to deploy', /^myapp|their-app$/)
  .argument('[env]', 'Environment to deploy on', /^dev|staging|production$/, 'local')
  // you specify options using .option()
  // if --tail is passed, its value is required
  .option('--tail <lines>', 'Tail <lines> lines of logs after deploy', prog.INT)
  .action(function(args, options, logger) {
    // args and options are objects
    // args = {"app": "myapp", "env": "production"}
    // options = {"tail" : 100}
  });

prog.parse(process.argv);

// ./myprog deploy myapp production --tail 100
```


### Variadic arguments

You can use `...` to indicate variadic arguments. In that case, the resulted value will be an array.
**Note:** Only the last argument of a command can be variadic !

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('deploy', 'Our deploy command')
  // 'app' and 'env' are required
  // and you can pass additional environments
  .argument('<app>', 'App to deploy')
  .argument('<env>', 'Environment')
  .argument('[other-env...]', 'Other environments')
  .action(function(args, options, logger) {
    console.log(args);
    // {
    //   "app": "myapp",
    //   "env": "production",
    //   "otherEnv": ["google", "azure"]
    // }
  });

prog.parse(process.argv);

// ./myprog deploy myapp production aws google azure
```

### Simple program (single command)

For a very simple program with just one command, you can omit the .command() call:

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .description('A simple program that says "biiiip"')
  .action(function(args, options, logger) {
    logger.info("biiiip")
  });

prog.parse(process.argv);
```

### Programmatic Caporal usage

You can pass arguments and options directly to Caporal API.

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('deploy', 'Our deploy command')
  .argument('<app>', 'App to deploy')
  .argument('<env>', 'Environment')
  .option('--how-much <amount>', 'How much app to deploy', prog.INT, 1)
  .action(function(args, options, logger) {
    logger.info(args);
    logger.info(options);
    // {
    //   "app": "myapp",
    //   "env": "production"
    // }
    // {
    //   "howMuch": 2
    // }
  });
prog.exec(['deploy', 'myapp', 'env'], {
  howMuch: 2
});
```

## Logging

Inside your action(), use the logger argument (third one) to log informations.

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('deploy', 'The deploy command')
  .action((args, options, logger) => {
    // Available methods:
    // - logger.debug('message')
    // - logger.info('message') or logger.log('level', 'message')
    // - logger.warn('message')
    // - logger.error('message')
    logger.info("Application deployed !");
  });

prog.parse(process.argv);
```

### Logging levels

The default logging level is 'info'. The predefined options can be used to change the logging level:

* `-v, --verbose`: Set the logging level to 'debug' so debug() logs will be output.
* `--quiet, --silent`: Set the logging level to 'warn' so only warn() and error() logs will be output.

### Custom logger

Caporal uses `winston` for logging. You can provide your own winston-compatible logger using `.logger()` the following way:

```javascript
#!/usr/bin/env node
const prog = require('caporal');
const myLogger = require('/path/to/my/logger.js');
prog
  .version('1.0.0')
  .logger(myLogger)
  .command('foo', 'Foo command description')
  .action((args, options, logger) => {
    logger.info("Foo !!");
  });

prog.parse(process.argv);
```

* `-v, --verbose`: Set the logging level to 'debug' so debug() logs will be output.
* `--quiet, --silent`: Set the logging level to 'warn' so only warn() and error() logs will be output.


## Coercion and casting using validators

You can apply coercion and casting using various *validators*:

 * [Caporal flags](#flag-validator)
 * [Functions](#function-validator)
 * [Array](#array-validator)
 * [RegExp](#regexp-validator)

### Flag validator

* `INT` (or `INTEGER`): Check option looks like an int and cast it with `parseInt()`
* `FLOAT`: Will Check option looks like a float and cast it with `parseFloat()`
* `BOOL` (or `BOOLEAN`): Check for string like `0`, `1`, `true`, `false`, `on`, `off` and cast it
* `LIST` (or `ARRAY`): Transform input to array by splitting it on comma
* `REPEATABLE`: Make the option repeatable, eg `./mycli -f foo -f bar -f joe`

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('order pizza')
  .option('--number <num>', 'Number of pizza', prog.INT, 1)
  .option('--kind <kind>', 'Kind of pizza', /^margherita|hawaiian$/)
  .option('--discount <amount>', 'Discount offer', prog.FLOAT)
  .option('--add-ingredients <ingredients>', 'Ingredients', prog.LIST)
  .action(function(args, options) {
    // options.kind = 'margherita'
    // options.number = 1
    // options.addIngredients = ['pepperoni', 'onion']
    // options.discount = 1.25
  });

prog.parse(process.argv);

// ./myprog order pizza --kind margherita --discount=1.25 --add-ingredients=pepperoni,onion
```

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('concat') // concat files
  .option('-f <file>', 'File to concat', prog.REPEATABLE)
  .action(function(args, options) {

  });

prog.parse(process.argv);

// Usage:
// ./myprog concat -f file1.txt -f file2.txt -f file3.txt
```

### Function validator

Using this method, you can check and cast user input. Make the check fail by throwing an `Error`,
and cast input by returning a new value from your function.


```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('order pizza')
  .option('--kind <kind>', 'Kind of pizza', function(opt) {
    if (['margherita', 'hawaiian'].includes(opt) === false) {
      throw new Error("You can only order margherita or hawaiian pizza!");
    }
    return opt.toUpperCase();
  })
  .action(function(args, options) {
    // options = { "kind" : "MARGHERITA" }
  });

prog.parse(process.argv);

// ./myprog order pizza --kind margherita
```

### Array validator

Using an `Array`, Caporal will check that it contains the argument/option passed.

**Note**: It is not possible to cast user input with this method, only checking it,
so it's basically only interesting for strings, but a major advantage is that this method
will allow autocompletion of arguments and option *values*.

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('order pizza')
  .option('--kind <kind>', 'Kind of pizza', ["margherita", "hawaiian"])
  .action(function(args, options) {

  });

prog.parse(process.argv);

// ./myprog order pizza --kind margherita
```

### RegExp validator

Simply pass a RegExp object to test against it.
**Note**: It is not possible to cast user input with this method, only checking it,
so it's basically only interesting for strings.

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('order pizza')
  .option('--kind <kind>', 'Kind of pizza', /^margherita|hawaiian$/)
  .action(function(args, options) {

  });

prog.parse(process.argv);

// ./myprog order pizza --kind margherita
```

## Colors

By default, Caporal will output colors for help and errors.
This behaviour can be disabled by passing `--no-color`.

## Auto-generated help

Caporal automatically generates help/usage instructions for you.
Help can be displayed using `-h` or `--help` options, or with the default `help` command.

<p align="center">
 <img src="https://github.com/mattallty/Caporal.js/raw/master/assets/colors.png" wdith="600">
</p>

## Custom help

You can add some custom help to the whole program or to specific commands using `.help(text, options?)`. The text, even if multi-line, will be, optionally, automatically indented.

Multiple help sections, with custom names, are supported.

### Custom help for the whole program

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .help('my global help') // here our custom help for the whole program
  .command('order pizza')
  .action(function(args, options) {

  });

prog.parse(process.argv);
```

### Custom help for specific commands

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  // first command
  .command('order')
  .help('my help for the order command') // here our custom help for the `order` command
  .action(function(args, options) {

  })
  // second command
  .command('cancel')
  .help('my help for the cancel command') // here our custom help for the `cancel` command
  .action(function(args, options) {

  })

prog.parse(process.argv);
```

## Typo suggestions

Caporal will automatically make suggestions for option typos.

<p align="center">
 <img src="https://github.com/mattallty/Caporal.js/raw/master/assets/suggest.png" wdith="600">
</p>


## Shell auto-completion

Caporal comes with an auto-completion feature out of the box for `bash`, `zsh`, and `fish`,
thanks to [tabtab](https://github.com/mklabs/node-tabtab).

For this feature to work, you will have to:

- Put your cli app in your `$PATH` (this is the case if your app is installed globally using `npm install -g <myapp>`)
- Setup auto-completion for your shell, like bellow.

#### If you are using bash

```bash
# For bash
source <(myapp completion bash)

# or add it to your .bashrc to make it persist
echo "source <(myapp completion bash)" >> ~/.bashrc \
&& source ~/.bashrc
```

#### If you are using zsh

```bash
# For zsh
source <(myapp completion zsh)

# or add it to your .zshrc to make it persist
echo "source <(myapp completion zsh)" >> ~/.zshrc \
&& source ~/.zshrc
```

#### If you are using fish

```bash
# For fish
source <(myapp completion fish)

# or add it to your config.fish to make it persist
echo "source <(myapp completion fish)" >> ~/.config/fish/config.fish \
&& source ~/.config/fish/config.fish
```

### Basic auto-completion

By default, it will autocomplete *commands* and *option names*.
Also, *options* having an *Array validator* will be autocompleted.

### Auto-completion setup example

```javascript
#!/usr/bin/env node

const prog = require('caporal');

prog
  .version('1.0.0')
  // the "order" command
  .command('order', 'Order a pizza')
  .alias('give-it-to-me')
  // <kind> will be auto-magicaly autocompleted by providing the user with 3 choices
  .argument('<kind>', 'Kind of pizza', ["margherita", "hawaiian", "fredo"])
  .argument('<from-store>', 'Which store to order from')
  // enable auto-completion for <from-store> argument using a sync function returning an array
  .complete(function() {
    return ['store-1', 'store-2', 'store-3', 'store-4', 'store-5'];
  })

  .argument('<account>', 'Which account id to use')
  // enable auto-completion for <account> argument using a Promise
  .complete(function() {
    return Promise.resolve(['account-1', 'account-2']);
  })

  .option('-n, --number <num>', 'Number of pizza', prog.INT, 1)
  .option('-d, --discount <amount>', 'Discount offer', prog.FLOAT)
  .option('-p, --pay-by <mean>', 'Pay by option')
  // enable auto-completion for -p | --pay-by option using a Promise
  .complete(function() {
    return Promise.resolve(['cash', 'credit-card']);
  })

  // -e | --extra will be auto-magicaly autocompleted by providing the user with 3 choices
  .option('-e, --extra <ingredients>', 'Add extra ingredients', ['pepperoni', 'onion', 'cheese'])
  .action(function(args, options, logger) {
    logger.info("Command 'order' called with:");
    logger.info("arguments: %j", args);
    logger.info("options: %j", options);
  })

  // the "return" command
  .command('return', 'Return an order')
  .argument('<order-id>', 'Order id')
  // enable auto-completion for <order-id> argument using a Promise
  .complete(function() {
    return Promise.resolve(['#82792', '#71727', '#526Z52']);
  })
  .argument('<to-store>', 'Store id')
  .option('--ask-change <other-kind-pizza>', 'Ask for other kind of pizza')
  // enable auto-completion for --ask-change option using a Promise
  .complete(function() {
    return Promise.resolve(["margherita", "hawaiian", "fredo"]);
  })
  .option('--say-something <something>', 'Say something to the manager')
  .action(function(args, options, logger) {
    logger.info("Command 'return' called with:");
    logger.info("arguments: %j", args);
    logger.info("options: %j", options);
  });

prog.parse(process.argv);
```

## API

#### `require('caporal')`

Returns a `Program` instance.

### Program API

#### `.version(version) : Program`

Set the version of your program. You may want to use your `package.json` version to fill it:

```javascript
const myProgVersion = require('./package.json').version;
const prog = require('caporal');
prog
  .version(myProgVersion)
// [...]

prog.parse(process.argv);
```

Your program will then automaticaly handle `-V` and `--version` options:

    matt@mb:~$ ./my-program --version
    1.0.0

#### `.help(text, options?) : Program`

Add a program-level help section.

By default the optional `options` parameter is:

```js
{
    indent: true, // If `true` the text will be automatically indented
    name: "MORE INFO" // The name of the section
}
```

#### `.command(name, description) -> Command`

Set up a new command with name and description. Multiple commands can be added to one program.
Returns a {Command}.

```javascript
const prog = require('caporal');
prog
  .version('1.0.0')
  // one command
  .command('walk', 'Make the player walk')
  .action((args, options, logger) => { logger.log("I'm walking !")}) // you must attach an action for your command
  // a second command
  .command('run', 'Make the player run')
  .action((args, options, logger) => { logger.log("I'm running !")})
  // a command may have multiple words
  .command('cook pizza', 'Make the player cook a pizza')
  .argument('<kind>', 'Kind of pizza')
  .action((args, options, logger) => { logger.log("I'm cooking a pizza !")})
// [...]

prog.parse(process.argv);
```

#### `.logger([logger]) -> Program | winston`

Get or set the logger instance. Without argument, it returns the logger instance (*winston* by default).
With the *logger* argument, it sets a new logger.

### Command API

#### `.argument(synopsis, description, [validator, [defaultValue]]) -> Command`

Add an argument to the command. Can be called multiple times to add several arguments.

* **synopsis** (*String*): something like `<my-required-arg>` or `[my-optional-arg]`
* **description** (*String*): argument description
* **validator** (*Caporal Flag | Function | Array | RegExp*): optional validator, see [Coercion and casting ](#coercion-and-casting-using-validators)
* **defaultValue** (*): optional default value

#### `.option(synopsis, description, [validator, [defaultValue, [required]]) -> Command`

Add an option to the command. Can be called multiple times to add several options.

* **synopsis** (*String*): You can pass short or long notation here, or both. See examples.
* **description** (*String*): option description
* **validator** (*Caporal Flag | Function | Array | RegExp*): optional validator, see [Coercion and casting ](#coercion-and-casting-using-validators)
* **defaultValue** (*): optional default value
* **required** (*Bool*): Is the option itself required ? Default to `false`

#### `.help(text, options?) -> Command`

Add a command-level help section.

By default the optional `options` parameter is:

```js
{
    indent: true, // If `true` the text will be automatically indented
    name: "" // The name of the section, by default this line won't be displayed
}
```

#### `.action(action) -> Command`

Define the action, e.g a *Function*, for the current command.

The *action* callback will be called with 3 arguments:
* *args* (Object): Passed arguments
* *options* (Object): Passed options
* *logger* (winston): Winston logger instance

```javascript
// sync action
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('walk', 'Make the player walk')
  .action((args, options, logger) => {
    logger.log("I'm walking !")
  });
```

You can make your actions async by using Promises:

```javascript
// async action
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('walk', 'Make the player walk')
  .action((args, options, logger) => {
    return new Promise(/* ... */);
  });
```

#### `.alias(alias) -> Command`

Define an alias for the current command. A command can only have one alias.

```javascript
const prog = require('caporal');
prog
  .version('1.0.0')
  // one command
  .command('walk', 'Make the player walk')
  .alias('w')
  .action((args, options, logger) => { logger.log("I'm walking !")});

prog.parse(process.argv);

// ./myapp w
// same as
// ./myapp walk
```

#### `.complete(completer) -> Command`

Define an auto-completion handler for the latest argument or option added to the command.

* **completer** (*Function*): The completer function has to return either an `Array` or a `Promise` which resolves to an `Array`.

#### `.visible(visibility?) -> Boolean | Command`

Get or set the visibility value of this command. By default it's `true`, if you set it to `false` it will be omitted from the help message.

```javascript
const prog = require('caporal');
prog
  .version('1.0.0')
  // one command
  .command('walk', 'Make the player walk')
  .visible ( false )

prog.parse(process.argv);
```

## Credits

Caporal is strongly inspired by [commander.js](https://github.com/tj/commander.js) and [Symfony Console](http://symfony.com/doc/current/components/console.html).
Caporal makes use of the following npm packages:
* [colorette](https://www.npmjs.com/package/colorette) for colors
* [cli-table3](https://www.npmjs.com/package/cli-table3) for cli tables
* [fast-levenshtein](https://www.npmjs.com/package/fast-levenshtein) for suggestions
* [tabtab](https://www.npmjs.com/package/tabtab) for auto-completion
* [minimist](https://www.npmjs.com/package/minimist) for argument parsing
* [prettyjson](https://www.npmjs.com/package/prettyjson) to output json
* [winston](https://www.npmjs.com/package/winston) for logging


## License

Copyright © Matthias ETIENNE

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The Software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the Software.
