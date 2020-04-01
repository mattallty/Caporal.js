#!/usr/bin/env node
const { program } = require("caporal")
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
