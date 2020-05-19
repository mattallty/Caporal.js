#!/usr/bin/env bash

# Rewrite headers
if [[ "$OSTYPE" == "darwin"* ]]; then
  find ./docs/api -type f -name '*.md' | xargs sed -i '' -E 's/# (Module|Interface|Class|Enumeration):/#/g'
else
  find ./docs/api -type f -name '*.md' | xargs sed -i -E 's/# (Module|Interface|Class|Enumeration):/#/g'
fi


ex ./docs/api/classes/caporal_program.program.md  <<EOF
1 insert
---
sidebarDepth: 2
---

.
xit
EOF

ex ./docs/api/classes/caporal_command.command.md  <<EOF
1 insert
---
sidebarDepth: 2
---

.
xit
EOF

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' -e '/## References/,$d' ./docs/api/modules/_caporal_core.md
else
  sed -i -e '/## References/,$d' ./docs/api/modules/_caporal_core.md
fi  
