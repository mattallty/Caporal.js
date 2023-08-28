# Validation and casting

Caporal helps you validate user input, e.g. arguments and options, so you don't have to.

There are 2 main solutions for validating those:

1. Using Caporal-provided validators
2. Using User validators (your own validators)

## Caporal validators

Those are simple, yet powerful validators. They can help you validate that user input
has the expected type (string, boolean, numeric) and cast them automatically. Those are
perfect for simple type validations.

### Number validator

Use `program.NUMBER` to check that the value looks like a numeric one and cast it to a
javascript `Number`.

```js
#!/usr/bin/env node
const { program } = require("@caporal/core")

program
  .argument("<year>", "Year of birth", { validator: program.NUMBER })
  .action(({ logger, args }) => {
    // will print something like: "year: 1985 (type: number)"
    logger.info("year: %d (type: %s)", args.year, typeof args.year)
  })

program.run()
```

### String validator

By default, arguments and options values provided by user input are strings, so this validator (`program.STRING`) is mainly used to prevent Caporal from auto-casting numerical values and boolean-like strings like `true` or `false`.

```js
#!/usr/bin/env node
const { program } = require("@caporal/core")

program
  .argument("<postal-code>", "Postal code", { validator: program.STRING })
  .action(({ logger, args }) => {
    // will print something like: "Postal code: 75001 (type: string)"
    logger.info("Postal code: %s (type: %s)", args.postalCode, typeof args.postalCode)
  })

program.run()
```


### Boolean validator

Use `program.BOOLEAN` to check that the value looks like a boolean. 
It accepts values like `true`, `false`, `yes`, `no`, `0`, and `1`, and will auto-cast 
those values to `true` or `false`.

```js
#!/usr/bin/env node
const { program } = require("@caporal/core")

program
  .argument("<answer>", "Your answer", { validator: program.BOOLEAN })
  .action(({ logger, args }) => {
    // will print something like: "Answer: true (type: boolean)"
    // even if "1" is provided as argument
    logger.info("Answer: %s (type: %s)", args.answer, typeof args.answer)
  })

program.run()
```

### Array validator

`program.ARRAY` converts any provided value to an array. If a string is provided, 
it will try to split it by commas. If a scalar value is provided, it will convert it 
to an array containing the value. 
Moreover, this validator **can be combined** with another Caporal validator!

```js
#!/usr/bin/env node

const { program } = require("@caporal/core")

program
  // here we combine the 2 validators, to get back an array of strings
  .argument("<years>", "Favorite years(s)", { validator: program.ARRAY | program.STRING })
  .action(({ logger, args }) => {
    // if "2032,2056" is provided, will print: "years: ["2032","2056"] (is array: true)"
    // if "2032" is provided, will print: "years: ["2032"] (is array: true)"
    // if "yes" is provided, will print: "years: ["yes"] (is array: true)"
    logger.info("years: %j (is array: %s)", args.years, Array.isArray(args.years))
  })

program.run()
```


## User validators

There are 3 types of user validators you can provide

- _Array_: an array of allowed values.
- _Function_: a function in charge of validating and casting user input.
- _RegExp_: a RegExp taht user input should match

### Array validator

This is not to confuse with Caporal Array validator. This one list the only valid values
that should be accepted.

```js
#!/usr/bin/env node

const { program } = require("@caporal/core")

program
  .argument("<city>", "Vote for your favorite City", {
    // just provide an array
    validator: ["Paris", "New-York", "Tokyo"],
  })
  .action(({ logger, args }) => {
    // the program will throw an error
    // if user provided city is not in ["Paris", "New-York", "Tokyo"]
    logger.info("Favorite city: %s", args.city)
  })

program.run()
```

### Function validator

This is the most powerful validator because it offers greater flexibility. With this validator, you can, for example, check in a database to ensure that a specific ID exists. You can simultaneously validate user input and cast the value. Your function must return the validated value, which can either be the same as the input or something else. You can set up asynchronous validation by returning a `Promise`  from your function. If an error occurs within your function, or if the returned `Promise`  is rejected, it will inform Caporal that the validation has failed.

#### Synchronous example

```js
#!/usr/bin/env node

const { program } = require("@caporal/core")

program
  .argument("<year>", "Year of birth", {
    validator: function (value) {
      if (value > new Date().getFullYear()) {
        throw Error("Year cannot be in the future!")
      }
      // cast to Number
      return +value
    },
  })
  .action(({ logger, args }) => {
    // will print something like: "year: 1985 (type: number)"
    logger.info("year: %d (type: %s)", args.year, typeof args.year)
  })

program.run()
```

#### Asynchronous example

```js
#!/usr/bin/env node

const { program } = require("@caporal/core")

program
  .description("Get username from ID")
  .argument("<id>", "User ID", {
    validator: function (id) {
      return fetch(`/api/user/${id}`).then(() => {
        return id
      })
    },
  })
  .action(({ logger, args }) => {
    logger.info("User ID: %s", args.id)
  })

program.run()
```
