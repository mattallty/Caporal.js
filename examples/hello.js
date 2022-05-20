#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { program } = require("@caporal/core")

program
  .argument("<name>", "Name to greet")
  .action(({ logger, args }) => {
    logger.info("Hello, %s!", args.name)
  })

program.run()

/*
$ ./hello.js Matt
Hello, Matt!
*/
