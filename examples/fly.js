#!/usr/bin/env node
"use strict";

const prog = require('..');

prog
  .version('1.0.0')
  .description('A simple command line utility to fly')

  .argument('<from>', 'From city')
  .argument('<to>', 'To city')
  .option('-c, --class <class>', 'Fly class', /^economic|business$/, 'economic')
  .action((args, opts, logger) => {
    console.log(args, opts, logger)
  });

prog.parse(process.argv);
