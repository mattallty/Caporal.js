import { getHelp, tpl, getContext, registerTemplate } from ".."
import { Program } from "../../program"
import { createCommand } from "../../command"
import { findCommand } from "../../command/find"
import strip from "strip-ansi"

describe("help", () => {
  let prog = new Program()

  beforeEach(() => {
    prog = new Program()
    prog.name("test-prog")
    prog.bin("test-prog")
  })

  describe("tpl()", () => {
    it("should compile template with given context", () => {
      const cmd = createCommand(prog, "test", "test command")
      const ctx = getContext(prog, cmd)
      return expect(tpl("header", ctx)).resolves.toMatchSnapshot()
    })

    it("should compile a custom template with given context", async () => {
      const cmd = createCommand(prog, "test", "test command")
      const ctx = getContext(prog, cmd)
      registerTemplate("mine", () => "template-contents")
      expect(await tpl("mine", ctx)).toBe("template-contents")
    })

    it("should fail if template does not exist", () => {
      const cmd = createCommand(prog, "test", "test command")
      const ctx = getContext(prog, cmd)
      return expect(tpl("unknown", ctx)).rejects.toBeInstanceOf(Error)
    })
  })

  describe("getHelp()", () => {
    it("should display help for a basic program", async () => {
      return expect(strip(await getHelp(prog))).toMatchSnapshot()
    })

    it("should display help for a program-command", async () => {
      prog
        .argument("<foo>", "Mandarory foo arg")
        .argument("[other]", "Other args")
        .option("-f, --file <file>", " Output file")

      return expect(strip(await getHelp(prog))).toMatchSnapshot()
    })

    it("should display help for a program having at least one command (with args & options)", async () => {
      prog
        .command("test-command", "Test command")
        .argument("<foo>", "Mandarory foo arg")
        .argument("[other]", "Other args")
        .option("-f, --file <file>", " Output file")
      return expect(strip(await getHelp(prog))).toMatchSnapshot()
    })

    it("should display help for a program having at least one command (with args only)", async () => {
      prog
        .command("test-command", "Test command")
        .argument("<foo>", "Mandarory foo arg")
        .argument("[other]", "Other args")
      return expect(strip(await getHelp(prog))).toMatchSnapshot()
    })

    it("should display help for a program having at least one command (with options only)", async () => {
      prog
        .command("test-command", "Test command")
        .option("-f, --file <file>", " Output file")
      return expect(strip(await getHelp(prog))).toMatchSnapshot()
    })

    it("should handle required options", async () => {
      prog
        .command("test-command", "Test command")
        .option("-f, --file <file>", " Output file", { required: true })
      const cmd = await findCommand(prog, ["test-command"])

      expect(strip(await getHelp(prog, cmd))).toContain("required")
      return expect(strip(await getHelp(prog, cmd))).toMatchSnapshot()
    })

    it("should handle type hints", async () => {
      prog
        .command("test-command", "Test command")
        .argument("<foo>", "Desc", { validator: prog.NUMBER })
        .option("-f, --file <file>", " Output file", {
          required: true,
          validator: prog.NUMBER,
        })
      const cmd = await findCommand(prog, ["test-command"])

      return expect(strip(await getHelp(prog, cmd))).toMatchSnapshot()
    })

    it("should work with a program without a specified name", async () => {
      prog = new Program()
      prog.bin("test-prog")
      prog
        .command("test-command", "Test command")
        .option("-f, --file <file>", " Output file")
      return expect(strip(await getHelp(prog))).toMatchSnapshot()
    })

    it("should work with a program without a version", async () => {
      prog = new Program()
      prog.bin("test-prog")
      prog.version("")
      prog
        .command("test-command", "Test command")
        .option("-f, --file <file>", " Output file")
      expect(strip(await getHelp(prog))).toMatchSnapshot()
    })

    it("should display program description", async () => {
      prog.description("Description test")
      prog
        .command("test-command", "Test command")
        .option("-f, --file <file>", " Output file")
      expect(strip(await getHelp(prog))).toMatchSnapshot()
    })

    it("should display customized program help", async () => {
      prog.description("Description test")
      prog
        .help("My custom help")
        .command("test-command", "Test command")
        .option("-f, --file <file>", " Output file")
      expect(strip(await getHelp(prog))).toMatchSnapshot()
    })

    it("should display customized program help on multiple lines", async () => {
      prog.description("Description test")
      prog
        .command("test-command", "Test command")
        .option("-f, --file <file>", " Output file")
        .help("My custom help\nAnother line\nOne last line")
      expect(strip(await getHelp(prog))).toMatchSnapshot()
    })
  })
})
