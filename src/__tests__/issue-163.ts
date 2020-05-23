import { parseArgv } from "../parser"

describe("issue #163", () => {
  it("should combine short and long versions of option flag when using array option", () => {
    const results = parseArgv(
      {
        variadic: ["file"],
        alias: {
          f: "file",
        },
      },
      ["-f", "my-value", "--file", "joe", "--file", "1", "-f", "xxx"],
    )
    expect(results.options.f).toEqual(["my-value", "joe", 1, "xxx"])
    expect(results.options.file).toEqual(["my-value", "joe", 1, "xxx"])
  })
})
