#!/usr/bin/env node
const program = require("@caporal/core")
program
  .argument("<name>", "Name to greet")
  .option("--greeting <word>", "Greeting to use", {
    default: "Hello",
  })
  .action(({ logger, args, options }) => {
    logger.info("%s, %s!", options.greeting, args.name)
  })

program.run()

/*
$ ./hello.js Matt --greeting Hi
Hi, Matt!

$ ./hello.js Matt
Hello, Matt!
*/
