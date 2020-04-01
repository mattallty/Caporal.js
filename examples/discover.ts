#!/usr/bin/env ts-node
import { program } from "caporal"
import path from "path"

program
  .name("kubectl")
  .version("1.0.0")
  .description("Mimics the kubectl CLI")
  .discover(path.join(__dirname, "discover/commands"))

program.run()
