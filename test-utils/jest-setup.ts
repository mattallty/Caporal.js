// Because we instantiate a lot of `Program` in tests,
// we set a lot of listeners on process
process.setMaxListeners(100)
