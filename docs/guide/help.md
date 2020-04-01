# Help

Caporal automatically generates help/usage instructions for you. Help can be displayed
using `-h` or `--help` options, or with the default `help` command.

You can add some custom help to the whole program or to specific commands using
`.help(text, options)`.

The text, even if multi-line, will be automatically indented. Multiple help sections with
custom names are supported.

## Customizing help for the whole program

### `program.help(text: string, options?: CustomizedHelpOpts)`

Options properties [available here](../api/interfaces/caporal_types.customizedhelpopts.md).

```js
#!/usr/bin/env node
const program = require("caporal")
program
  .version("1.0.0")
  // our custom help for the whole program
  .help("my global help")
  .command("order pizza")
  .action(function (args, options) {})

program.run()
```

## Custom help for specific commands

### `command.help(text: string, options?: CustomizedHelpOpts)`

Options properties [available here](../api/interfaces/caporal_types.customizedhelpopts.md).

```js
#!/usr/bin/env node
const program = require("caporal")
program
  .version("1.0.0")
  // first command
  .command("order")
  // our custom help for the `order` command
  .help("my help for the order command")
  .action(function (args, options) {})
  // second command
  .command("cancel")
  // our custom help for the `cancel` command
  .help("my help for the cancel command")
  .action(function (args, options) {})

program.run()
```
