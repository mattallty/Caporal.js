import { createArgument } from ".."

describe("createArgument()", () => {
  it("should create a basic required arg", () => {
    const arg = createArgument("<my-argument>", "My test argument")
    expect(arg).toMatchObject({
      description: "My test argument",
      choices: [],
      name: "myArgument",
      required: true,
      synopsis: "<my-argument>",
      variadic: false,
    })
  })
  it("should create a basic optional arg", () => {
    const arg = createArgument("[my-argument]", "My test argument")
    expect(arg).toMatchObject({
      description: "My test argument",
      choices: [],
      name: "myArgument",
      required: false,
      synopsis: "[my-argument]",
      variadic: false,
    })
  })

  it("should implicitly create an optional arg if no special character is set", () => {
    const arg = createArgument("my-argument", "My test argument")
    expect(arg).toMatchObject({
      description: "My test argument",
      choices: [],
      name: "myArgument",
      required: false,
      synopsis: "[my-argument]",
      variadic: false,
    })
  })
  it("arg.choices should equal the array validator when provided", () => {
    const arg = createArgument("[my-argument]", "My test argument", {
      validator: ["one", "two"],
    })
    expect(arg).toMatchObject({
      description: "My test argument",
      choices: ["one", "two"],
      name: "myArgument",
      required: false,
      typeHint: 'one of "one","two"',
      synopsis: "[my-argument]",
      validator: ["one", "two"],
      variadic: false,
    })
  })
  it("arg.variadic should be true for an optional variadic argument", () => {
    const arg = createArgument("[my-argument...]", "My test argument", {
      validator: ["one", "two"],
    })
    expect(arg).toMatchObject({
      description: "My test argument",
      choices: ["one", "two"],
      name: "myArgument",
      required: false,
      typeHint: 'one of "one","two"',
      synopsis: "[my-argument...]",
      validator: ["one", "two"],
      variadic: true,
    })
  })
  it("arg.variadic should be true for an required variadic argument", () => {
    const arg = createArgument("<my-argument...>", "My test argument", {
      validator: ["one", "two"],
    })
    expect(arg).toMatchObject({
      description: "My test argument",
      choices: ["one", "two"],
      name: "myArgument",
      required: true,
      typeHint: 'one of "one","two"',
      synopsis: "<my-argument...>",
      validator: ["one", "two"],
      variadic: true,
    })
  })
})
