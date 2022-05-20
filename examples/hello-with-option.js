#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const program = require("@caporal/core")
program
  .argument("<name>", "Name to greet")
  .option("--greating <word>", "Greating to use", {
    default: "Hello",
  })
  .action(({ logger, args, options }) => {
    logger.info("%s, %s!", options.greating, args.name)
  })

program.run()

/*
$ ./hello.js Matt --greeting Hi
Hi, Matt!

$ ./hello.js Matt
Hello, Matt!
*/
