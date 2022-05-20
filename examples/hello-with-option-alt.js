#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { program } = require("@caporal/core")
program
  .argument("<name>", "Name to greet")
  // we will be able to use either `-g` or `--greeting` in the command line
  .option("-g, --greating <word>", "Greating to use", {
    default: "Hello",
  })
  .action(({ logger, args, options }) =>
    logger.info("%s, %s!", options.greating, args.name),
  )

program.run()

/*
$ ./hello.js Matt -g Hi
Hi, Matt!
*/
