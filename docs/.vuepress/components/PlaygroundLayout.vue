<script>
import Navbar from "@theme/components/Navbar.vue"
import "xterm/css/xterm.css"
import caporalDts from "raw-loader!../public/assets/js/@caporal/caporal.d.ts"
import winstonDts from "raw-loader!../../../node_modules/winston/index.d.ts"
import chalkDts from "raw-loader!../../../node_modules/chalk/index.d.ts"
import { format } from "util"

const declarations = {
  "@caporal/core": caporalDts,
  winston: winstonDts,
  chalk: chalkDts,
}

export default {
  name: "playground",
  components: {
    Navbar,
  },
  mounted() {
    // load dynamicaly the monaco editor
    // see: https://v1.vuepress.vuejs.org/guide/using-vue.html#browser-api-access-restrictions
    import("vue-monaco").then((module) => {
      this.monacoComponent = module.default
    })
    document.querySelector("body").style.overflow = "hidden"
  },
  beforeDestroy() {
    document.querySelector("body").style.overflow = "auto"
  },
  data() {
    return {
      code: "",
      monaco: null,
      term: null,
      echo: null,
      transpiledJs: "",
      dirty: true,
      monacoComponent: null,
      options: {
        //Monaco Editor Options
        fontSize: 14,
        model: null,
        value: null,
        contextmenu: false,
        minimap: {
          enabled: false,
        },
        scrollBeyondLastLine: false,
      },
    }
  },

  methods: {
    async compileCode() {
      if (this.dirty) {
        const editor = this.$refs.editor.getEditor()
        const model = editor.getModel()
        const worker = await this.monaco.languages.typescript.getTypeScriptWorker()
        const client = await worker(model.uri)
        const { outputFiles } = await client.getEmitOutput(model.uri.toString())
        this.transpiledJs = outputFiles[0].text
        this.dirty = false
      }
    },
    async executeCommand(input) {
      // process.env.FORCE_COLOR = "2"
      process.env.CAPORAL_CMD_LINE = input.trim()

      await this.compileCode()

      // clear the state
      caporal.program.reset()

      if (process.env.CAPORAL_CMD_LINE === "") {
        return this.term.prompt()
      }

      if (!process.env.CAPORAL_CMD_LINE.startsWith("play")) {
        const { chalk } = caporal
        this.term.println(
          `This is not a real terminal. You can only use the ${chalk.green(
            "play",
          )} program.`,
        )
        this.term.println("Type " + chalk.green("play --help") + " for more info.")
        setImmediate(() => {
          this.term.prompt()
        })
        return
      }

      try {
        eval(this.transpiledJs)
      } catch (e) {
        console.error(e)
      }
    },
    codeDidChange() {
      this.dirty = true
    },
    setupCappral() {
      const writeToTerm = (...args) => {
        this.term.write(format(...args))
        this.term.write("\n")
      }
      caporal.program.logger({
        log: writeToTerm,
        http: writeToTerm,
        silly: writeToTerm,
        debug: writeToTerm,
        info: writeToTerm,
        warn: writeToTerm,
        error: writeToTerm,
      })
      caporal.program.on("help", (help) => {
        this.term.write(help)
      })
      caporal.program.on("run", () => {
        setImmediate(this.term.prompt)
      })
      caporal.program.on("error", () => {
        setImmediate(this.term.prompt)
      })
    },
    setupTerminal() {
      Promise.all([import("xterm"), import("xterm-addon-fit")]).then(
        ([{ Terminal }, { FitAddon }]) => {
          const term = (this.term = new Terminal({
            fontFamily:
              "'Source Code Pro', 'Ubuntu Mono', courier-new, courier, monospace",
            fontSize: 14,
            lineHeight: 1.1,
            convertEol: true,
            cursorBlink: true,
            macOptionIsMeta: true,
            theme: {
              background: "#1e1e1e",
            },
          }))

          const fitAddon = new FitAddon()
          term.loadAddon(fitAddon)
          term.open(document.getElementById("terminal-container"))
          fitAddon.fit()
          term.focus()

          this.echo = new LocalEchoController(term)

          term.print = this.echo.print.bind(this.echo)
          term.println = this.echo.println.bind(this.echo)
          term.prompt = () => {
            this.echo
              .read("~$ ")
              .then(this.executeCommand)
              .catch((error) => console.error(`Error reading: ${error}`, error))
          }

          this.setupCappral()

          term.println("Welcome in the Caporal Playground! Type 'play --help' for help")
          term.prompt()
        },
      )
    },
    editorWillMount(monaco) {
      this.monaco = monaco

      // validation settings
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      })

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        lib: ["ES2019"],
        allowJs: true,
        esModuleInterop: false,
        allowSyntheticDefaultImports: true,
        target: monaco.languages.typescript.ScriptTarget.ES2016,
        allowNonTsExtensions: true,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      })

      for (let dep in declarations) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          declarations[dep],
          `file:///node_modules/${dep}/index.d.ts`,
        )
      }
    },
    editorDidMount(stdEditor) {
      const id = Date.now()
      const monacoModel = this.monaco.editor.createModel(
        `/*
  Welcome to the Caporal Playground!
  Use the Caporal API to write your program and test it directly in the terminal below.
  The 'program' instance has already its 'name' and 'description' predefined,
  and its executable name is set to 'play'.
*/

import { program } from "@caporal/core"

program
  .command('order', 'Order command')
  .argument('<pizza-type>', 'Pizza type')
  .action(({ logger, args }) => {
    logger.info("Ordering pizza %s", args.pizzaType)
  })

  program.run()
`,
        "typescript",
        this.monaco.Uri.parse("file:///main-" + id + ".ts"),
      )
      stdEditor.setModel(monacoModel)
      stdEditor.layout()

      this.compileCode()
      this.setupTerminal()
    },
  },
}
</script>

<template>
  <div class="theme-container">
    <Navbar />
    <div class="caporal_playground_container">
      <div class="editor-container">
        <component
          ref="editor"
          v-if="monacoComponent"
          :is="monacoComponent"
          v-model="code"
          value
          theme="vs"
          language="typescript"
          :options="options"
          @change="codeDidChange"
          @editorDidMount="editorDidMount"
          @editorWillMount="editorWillMount"
        ></component>
      </div>
      <div id="terminal-container"></div>
    </div>
  </div>
</template>

<style lang="stylus">
@import '../styles/palette.styl';

.caporal_playground_container {
  margin-top: $navbarHeight;
  display: flex;
  min-height: 'calc(100vh - %s)' % $navbarHeight;
  height: 'calc(100vh - %s)' % $navbarHeight;
  flex-direction: column;
}

.caporal_playground_container > div {
  height: 50vh;
}

#terminal-container {
  background: #1e1e1e;
}

.terminal {
  padding: 10px;
}

.editor-container > div {
  height: 'calc(50vh - %s)' % $navbarHeight;
}

.monaco-editor {
  min-height: 300px !important;
  padding-top: 5px;
}
</style>
