# Caporal

> A full-featured framework for building command line applications (cli) with node.js,
> including help generation, colored output, verbosity control, custom logger, coercion
> and casting, typos suggestions, and auto-complete for bash/zsh/fish.
 

## Command Syntax

A command can have *arguments* and *options*.
Angled brackets (e.g. `<item>`) indicate required input. Square brackets (e.g. `[env]`) indicate optional input.

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  // you specify arguments in .command()
  // 'app' is required, 'env' is optional
  .command('deploy <app> [env]', 'Deploy an application') 
  // you specify options using .option()
   // if --tail is passed, its value is required
  .option('--tail <lines>', 'Tail <lines> lines of logs after deploy') 
  .action(function(args, options, logger) {

  });

// ./myprog deploy myapp production --restart
```

### Variadic arguments
```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  // you specify arguments in .command()
  // 'app' and 'env' are required, and you can pass additional environments through not required
  .command('deploy <app> <env> [other-env...]', 'Deploy an application to one or more environments') 
  .action(function(args, options, logger) {
    // args = {app: 'myapp', env: 'production', otherEnv: ['google', 'azure']}
  });

// ./myprog deploy myapp production aws google azure
```

## Logging

Inside your action(), use the logger argument (third one) to log informations.

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('deploy <app> [env]', 'Deploy an application') 
  .option('--restart', 'Make the application restart after deploy') 
  .action((args, options, logger) => {
    // Available methods: 
    // - logger.debug()
    // - logger.log() or logger.info()
    // - logger.warn()
    // - logger.error()
    logger.log("Application deployed !");
  });
```

### Logging levels

The default logging level is 'info'. The predifined options can be used to change the logging level:

* `-v, --verbose`: Set the logging level to 'debug' so debug() logs will be output.
* `--quiet, --silent`: Set the logging level to 'warn' so only warn() and error() logs will be output. 

## Coercion and casting

### Using Caporal constants

* `INT` (or `INTEGER`): Check option looks like an int and cast it with parseInt()  
* `FLOAT`: Will Check option looks like a float and cast it with parseFloat()
* `BOOL` (or `BOOLEAN`): Check for string like 0, 1, true, false, and cast it
* `LIST` (or `ARRAY`): Transform input to array by spliting it on comma  
* `REPEATABLE`: Make the option repeatable, eg `./mycli -f foo -f bar -f joe`
* `REQUIRED`: Make the option required in the command line

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('order pizza')
  .option('--number <num>', 'Number of pizza', prog.INT, 1)
  .option('--kind <kind>', 'Kind of pizza', /^margherita|hawaiian$/)
  .option('--discount <amount>', 'Discount offer', prog.FLOAT)
  .option('--add-ingredients <ingredients>', prog.LIST)
  .action(function(args, options) {
    // options.kind = 'margherita'
    // options.number = 1
    // options.addIngredients = ['pepperoni', 'onion']
    // options.discount = 1.25
  });

// ./myprog order pizza --kind margherita --discount=1.25 --add-ingredients=pepperoni,onion
```

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('concat') // concat files
  .option('-f <file>', 'File to concat', prog.REPEATABLE | prog.REQUIRED)
  .action(function(args, options) {

  });

// ./myprog order pizza --kind margherita --discount=1.25 --add-ingredients=pepperoni,onion
```

### Using a function

Using this method, you can check and cast user input. Make the check fail by throwing an error,
and cast input by returning a new value from your function. 


```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('order pizza')
  .option('--kind <kind>', 'Kind of pizza', function(opt) {
    if (['margherita', 'hawaiian'].includes(opt) === false) {
      throw new Error("You can only order margherita or hawaiian pizza!")
    }
    return opt;
  })
  .action(function(args, options) {
    
  });

// ./myprog order pizza --kind margherita
```

### Using RegExp

Simply pass a RegExp object in the third argument to test against it.
**Note**: It is not possible to cast user input with this method, only check it, 
so it's basicaly only interesting for strings.

```javascript
#!/usr/bin/env node
const prog = require('caporal');
prog
  .version('1.0.0')
  .command('order pizza') // concat files
  .option('--kind <kind>', 'Kind of pizza', /^margherita|hawaiian$/)
  .action(function(args, options) {
    
  });

// ./myprog order pizza --kind margherita
```

## Typo suggestions

Caporal will automaticaly make suggestions for option typos.

## Credits

Strongly inspired by commander.js and Symfony console.
