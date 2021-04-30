#!/usr/bin/env node
const { program } = require("@caporal/core")
program
  .argument("<name>", "Name to greet")
  // we will be able to use either `-g` or `--greeting` in the command line
  .option("-g, --greeting <word>", "Greeting to use", {
    default: "Hello",
  })
  .action(({ logger, args, options }) =>
    logger.info("%s, %s!", options.greeting, args.name),
  )

program.run()

/*
$ ./hello.js Matt -g Hi
Hi, Matt!
*/
