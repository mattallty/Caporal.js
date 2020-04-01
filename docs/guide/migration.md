# Migrating from 1.x

**Caporal v2** is a major rewrite that includes breaking changes.
This guide should help you transition to v2 in a painless way.

Also, if you're using _Visual Studio Code_, it should show you the wrong
method calls, thanks to typescript declarations (even if your app
is written in javascript).

## Breaking changes

### `.option()` signature change

All optional properties are now part of a third parameter object.

```diff
- .option(synopsis, description, [validator, [defaultValue, [required]])
+ .option(synopsis, description, { validator, default, required })
```

### `.argument()` signature change

All optional properties are now part of a third parameter object.

```diff
- .argument(synopsis, description, [validator, [defaultValue]])
+ .argument(synopsis, description, { validator, default })
```

### `program.parse()` signature change

`program.parse()` has been renamed to `program.run()`.
If you used to pass `process.argv` as the `argv` parameter , please
now pass `process.argv.slice(2)`.

```diff
- program.parse(process.argv)
+ program.run(process.argv.slice(2))
```

### `command.alias()` signature change

Command can now have mutiple aliases. Hence `command.alias()` now supports
multiple arguments.

```diff
command.alias("myalias") // still valid
+ command.alias("myalias", "another", "a-last-one") // now supporting multiple aliases
```

### `command.visible()` removing

`command.visible(false)` has been renamed to `command.hide()`.

```diff
- command.visible(false)
+ command.hide()
```

### Caporal Validators

Formerly called Caporal flags.

- `program.INTEGER`, `program.INT` and `program.FLOAT` have been merged and renamed
  to `program.NUMERIC`.
- `program.BOOL` alias has been removed. Please use `program.BOOLEAN`.
- `program.LIST` alias has been removed. Please use `program.ARRAY`.
- `program.REPEATABLE` has been removed. Please use the synopsis variadic notation
  `...` to specify an argument or an option as repeatable.
- `program.REQUIRED` has been removed. Please use the `required` property of third
  parameter object in `.argument()` and `.option()` to specify an argument or an option
  as required.

## New features

- [Commands auto-discovery](program.md#auto-discovery)
- [Strict mode](program.md#strict-mode)
- [Adding and removing global options using](program.md#global-options)
