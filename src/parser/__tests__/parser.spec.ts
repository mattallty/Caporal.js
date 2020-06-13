import { parseLine, parseArgv } from ".."

describe("Parser", () => {
  it("parseArgv() should work without options", () => {
    const result = parseArgv()
    expect(Array.isArray(result.args)).toBe(true)
  })

  describe("Options", () => {
    it("should parse simple options", () => {
      const line = "-o opt-value --long-opt=long-opt-value"
      const result = parseLine(line)
      expect(result).toHaveProperty("options")
      expect(result.options.o).toEqual("opt-value")
      expect(result.options.longOpt).toEqual("long-opt-value")
    })

    it("should handle concatenated options like '-xyz value' when z is not a boolean", () => {
      const line = "-o opt-value -abcd -efg option-value"
      const result = parseLine(line)
      expect(result.options).toEqual({
        o: "opt-value",
        a: true,
        b: true,
        c: true,
        d: true,
        e: true,
        f: true,
        g: "option-value",
      })
      expect(result.args).toEqual([])
    })

    it("should handle concatenated options like '-xyz=value' when z is not a boolean", () => {
      const line = "-o opt-value -abcd -efg=option-value"
      const result = parseLine(line)
      expect(result.options).toEqual({
        o: "opt-value",
        a: true,
        b: true,
        c: true,
        d: true,
        e: true,
        f: true,
        g: "option-value",
      })
      expect(result.args).toEqual([])
    })

    it("should handle concatenated options like '-xyz not-a-value' if z is a boolean", () => {
      const line = "-o opt-value -abcd -efg option-value"
      const result = parseLine(line, {
        boolean: ["g"],
        alias: { f: "file", directory: "d" },
      })
      expect(result.options).toEqual({
        o: "opt-value",
        a: true,
        b: true,
        c: true,
        d: true,
        directory: true,
        e: true,
        f: true,
        file: true,
        g: true,
      })
      expect(result.args).toEqual(["option-value"])
    })

    it("should handle concatenated options like '-xyz not-a-value' with autocast", () => {
      const line = "-o opt-value my-arg1 -abcd 12345 -efg true my-arg2"
      const result = parseLine(line, {
        alias: { f: "file", directory: "d" },
      })
      expect(result.options).toEqual({
        o: "opt-value",
        a: true,
        b: true,
        c: true,
        d: 12345,
        directory: 12345,
        e: true,
        f: true,
        file: true,
        g: true,
      })
      expect(result.args).toEqual(["my-arg1", "my-arg2"])
    })

    it("should handle 'boolean' option", () => {
      const line =
        "--my-opt true --my-bool 1 --my-false=0 --another=yes --not-now=no -y=yes --not-forced=yes"
      const result = parseLine(line, {
        boolean: ["myOpt", "myBool", "myFalse", "another", "notNow", "y"],
      })
      expect(result.options).toEqual({
        myOpt: true,
        myBool: true,
        myFalse: false,
        another: true,
        notNow: false,
        y: true,
        notForced: "yes",
      })
    })

    it("should handle 'string' option", () => {
      const line = "--my-opt true --my-string 1 --joe"
      const result = parseLine(line, {
        string: ["myString", "joe"],
      })
      expect(result.options).toEqual({
        myOpt: true,
        joe: "true",
        myString: "1",
      })
    })

    it("should not cast options when 'autoCast' is disabled", () => {
      const line = "--my-int 1 --checked=true --done"
      const result = parseLine(line, {
        autoCast: false,
      })
      expect(result.options).toEqual({
        myInt: "1",
        checked: "true",
        done: true,
      })
    })

    it("should automatically cast options", () => {
      const line =
        "--my-opt true --int 23456 --float=3.14159265 --on=on --no-mushrooms --no-vegetables=false --no-bread=true"
      const result = parseLine(line)
      expect(result.options).toEqual({
        myOpt: true,
        int: 23456,
        float: 3.14159265,
        on: "on",
        bread: false,
        mushrooms: false,
        vegetables: true,
      })
    })

    it("should return dashedOptions", () => {
      const line = "--my-opt true --int 23456 --float=3.14159265 --on=on -t type"
      const result = parseLine(line, { alias: { float: "mynummm" } })
      expect(result.rawOptions).toEqual({
        "--my-opt": true,
        "--int": 23456,
        "--float": 3.14159265,
        "--on": "on",
        "-t": "type",
      })
    })

    describe("should handle aliases", () => {
      test("with simple options", () => {
        const line = "--my-opt true --int 23456 --float=3.14159265 --on=on -t=my-type"
        const result = parseLine(line, {
          alias: {
            int: "i",
            float: "f",
            t: "type",
          },
        })
        expect(result.options).toEqual({
          myOpt: true,
          int: 23456,
          i: 23456,
          float: 3.14159265,
          f: 3.14159265,
          on: "on",
          t: "my-type",
          type: "my-type",
        })
      })

      test("with repeatable options", () => {
        const line =
          "--my-opt true --int 23456 --float=3.14159265 --on=on -t=my-type -t my-type2 -t hey-type-3 --type type4"
        const result = parseLine(line, {
          alias: {
            int: "i",
            float: "f",
            t: "type",
          },
          variadic: ["t"],
        })
        expect(result.options).toEqual({
          myOpt: true,
          int: 23456,
          i: 23456,
          float: 3.14159265,
          f: 3.14159265,
          on: "on",
          t: ["my-type", "my-type2", "hey-type-3", "type4"],
          type: ["my-type", "my-type2", "hey-type-3", "type4"],
        })
      })

      test("with repeated options but not marked as repeatable", () => {
        const line =
          "--my-opt true --int 23456 --float=3.14159265 --on=on -t=my-type -t my-type2 -t hey-type-3 --type type4"
        const result = parseLine(line, {
          alias: {
            int: "i",
            float: "f",
            t: "type",
          },
        })
        expect(result.options).toEqual({
          myOpt: true,
          int: 23456,
          i: 23456,
          float: 3.14159265,
          f: 3.14159265,
          on: "on",
          t: "type4",
          type: "type4",
        })
      })
    })

    describe("should handle double-dash", () => {
      it("by default", () => {
        const line = "arg1 arg 2 --my-opt val --my-bool -- -f hello world true"
        const result = parseLine(line)
        expect(result.options).toEqual({
          myBool: true,
          myOpt: "val",
        })
        expect(result.args).toEqual(["arg1", "arg", 2, "-f", "hello", "world", true])
      })

      it("by populating ddash array when ddash:true", () => {
        const line = "arg1 arg 2 --my-opt val --my-bool -- -f hello world true"
        const result = parseLine(line, { ddash: true })
        expect(result.options).toEqual({
          myBool: true,
          myOpt: "val",
        })
        expect(result.args).toEqual(["arg1", "arg", 2])
        expect(result.ddash).toEqual(["-f", "hello", "world", true])
      })

      it("when autocast is disabled", () => {
        const line = "arg1 arg 2 --my-opt val --my-bool -- -f hello world true"
        const result = parseLine(line, { autoCast: false })
        expect(result.options).toEqual({
          myBool: true,
          myOpt: "val",
        })
        expect(result.args).toEqual(["arg1", "arg", "2", "-f", "hello", "world", "true"])
      })
    })
  })

  describe("Arguments", () => {
    it("should parse simple args", () => {
      const line = "first double--dashed strange-- andtother-one simple"
      const argv = line.split(" ")
      const result = parseLine(line)
      expect(result.args).toEqual(argv)
    })

    it("should return rawArgv", () => {
      const line = "first double--dashed strange-- andtother-one simple"
      const argv = line.split(" ")
      const result = parseLine(line)
      expect(result.rawArgv).toEqual(argv)
    })

    it("should not cast arguments when 'autoCast' is disabled", () => {
      const line = "1 true off on yes no -1 0 3.14"
      const result = parseLine(line, {
        autoCast: false,
      })
      expect(result.args).toEqual(line.split(" "))
    })

    it("should not cast arguments when 'autoCast' is disabled even with variadic arguments", () => {
      const line = "1 true off on yes no -1 0 3.14"
      const result = parseLine(line, {
        autoCast: false,
        variadic: [2],
      })
      expect(result.args).toEqual([
        "1",
        "true",
        ["off", "on", "yes", "no", "-1", "0", "3.14"],
      ])
    })
    it("should cast arguments when 'autoCast' is enabled even with variadic arguments", () => {
      const line = "1 true off on yes no -1 0 3.14"
      const result = parseLine(line, {
        variadic: [2],
      })
      expect(result.args).toEqual([1, true, ["off", "on", "yes", "no", -1, 0, 3.14]])
    })

    it("should handle variadic arguments at position 0", () => {
      const line = "1 true off on yes no -1 0 3.14"
      const result = parseLine(line, {
        variadic: [0],
        autoCast: false,
      })
      expect(result.args).toEqual([line.split(" ")])
    })

    it("should handle variadic arguments at position > 0", () => {
      const line = "1 true off on yes no -1 0 3.14"
      const result = parseLine(line, {
        variadic: [2],
        autoCast: false,
      })
      expect(result.args).toEqual([
        "1",
        "true",
        ["off", "on", "yes", "no", "-1", "0", "3.14"],
      ])
    })

    it("should handle mix of variadic arguments and double-dash at position > 0", () => {
      const line = "1 true off on yes -- no -1 --foo 0 3.14"
      const result = parseLine(line, {
        variadic: [2],
        autoCast: false,
      })
      expect(result.args).toEqual([
        "1",
        "true",
        ["off", "on", "yes", "no", "-1", "--foo", "0", "3.14"],
      ])
    })

    it("should handle mix of variadic arguments and double-dash at position 0 with options after variadic arg", () => {
      const line = "1 true off on --foo=bar yes -- no -1 0 3.14"
      const result = parseLine(line, {
        variadic: [0],
        autoCast: false,
      })
      expect(result.options).toEqual({ foo: "bar" })
      expect(result.args).toEqual([
        ["1", "true", "off", "on", "yes", "no", "-1", "0", "3.14"],
      ])
    })

    it("should handle mix of variadic arguments and double-dash at position > 0 with options after variadic arg", () => {
      const line = "1 true off on --foo=bar yes -- no -1 0 3.14"
      const result = parseLine(line, {
        variadic: [2],
        autoCast: false,
      })
      expect(result.args).toEqual([
        "1",
        "true",
        ["off", "on", "yes", "no", "-1", "0", "3.14"],
      ])
    })

    it("should automaticaly cast arguments", () => {
      const line = "true false on off yes no 12345 3.14"
      const result = parseLine(line)
      expect(result.args).toEqual([true, false, "on", "off", "yes", "no", 12345, 3.14])
    })
  })
})
