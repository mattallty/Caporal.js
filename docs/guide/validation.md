# Validation and casting

Caporal helps you validate user input, e.g. arguments and options, so you don't have to.

There are 2 main solutions for validating those:

1. Using Caporal-provided validators
2. Using User validators (your own validators)

## Caporal validators

Those are simple, yet powerful validators. They can help you validate that user input
has the expected type (string, boolean, numeric) and cast them automatically. Those are
perfect for simple type validations.

### Number validator (`program.NUMBER`)

Check that the value looks like a numeric one and cast the provided value to a
javascript `Number`.

<<< @/examples/validate-number.js

### String validator (`program.STRING`)

String validator. By default, arguments and options values provided by user input are
strings, so this validator is mainly used to prevent Caporal from auto-casting numerical
values and boolean-like strings like `true` or `false`.

<<< @/examples/validate-string.js

### Boolean validator (`program.BOOLEAN`)

Check that the value looks like a boolean. It accepts values like `true`, `false`, `yes`,
`no`, `0`, and `1`, and will auto-cast those values to `true` or `false`.

<<< @/examples/validate-boolean.js

### Array validator (`program.ARRAY`)

Convert any provided value to an array. If a string is provided, it will try to split it
by commas. If a scalar value is provided, it will convert it to an array containing the
value. Moreover, this validator **can be combined** with another Caporal validator!

<<< @/examples/validate-array.js

## User validators

There are 3 types of user validators you can provide

- _Array_: an array of allowed values.
- _Function_: a function in charge of validating and casting user input.
- _RegExp_: a RegExp taht user input should match

### Array validator

This is not to confuse with Caporal Array validator. This one list the only valid values
that should be accepted.

<<< @/examples/validate-user-array.js

### Function validator

This is certainly the most powerful validator because it allows you the most flexibility.
With this validator, you could for example check in a database that a specific ID exists.
You can at the same time validate the user input and cast the value. You function must
return the validated value. It can be the same as the input, but it can be something else.
You can setup an asynchronous validation by returning a `Promise` from your function.
Just throw an error inside your function, or make the returned `Promise` rejecting to let
Caporal know that the validation failed.

**Synchronous example**

<<< @/examples/validate-function.js

**Asynchronous example**

<<< @/examples/validate-function-async.js
