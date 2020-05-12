#!/usr/bin/env bash

# Rewrite headers
if [[ "$OSTYPE" == "darwin"* ]]; then
  find ./docs/api -type f -name '*.md' | xargs sed -i '' -E 's/# (Module|Interface|Class|Enumeration):/#/g'
else
  find ./docs/api -type f -name '*.md' | xargs sed -i -E 's/# (Module|Interface|Class|Enumeration):/#/g'
fi


echo "---\nsidebarDepth: 2\n---\n\n" | cat - ./docs/api/classes/caporal_program.program.md | tee ./docs/api/classes/caporal_program.program.md > /dev/null
echo "---\nsidebarDepth: 2\n---\n\n" | cat - ./docs/api/classes/caporal_command.command.md | tee ./docs/api/classes/caporal_command.command.md > /dev/null

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' -e '/## References/,$d' ./docs/api/modules/caporal.md
else
  sed -i -e '/## References/,$d' ./docs/api/modules/caporal.md
fi  
