#!/usr/bin/env node
const { program } = require("caporal")

program
  .argument("<answer>", "Your answer", { validator: program.BOOLEAN })
  .action(({ logger, args }) => {
    // will print something like: "Answer: true (type: boolean)"
    // even if "1" is provided as argument
    logger.info("Answer: %s (type: %s)", args.answer, typeof args.answer)
  })

program.run()
