#!/usr/bin/env node
// file: hello-world.js (make the file executable using `chmod +x hello.js`)

// Caporal provides you with a program instance
const { program } = require("@caporal/core")

// Simplest program ever: this program does only one thing
program.action(({ logger }) => {
  logger.info("Hello, world!")
})

// always run the program at the end
program.run()

/* 
# Now, in your terminal:

$ ./hello-world.js
Hello, world!

*/
