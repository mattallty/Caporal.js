/*
Winston `Console transport` uses console._stdout.write()
to log things, which is polluting jest logs, so let's
overwrite that 
*/
Object.defineProperty(global.console, "_stdout", {
  value: {
    write: jest.fn(),
  },
})

// Because we instantiate a lot of `Program` in tests,
// we set a lot of listeners on process
process.setMaxListeners(100)
