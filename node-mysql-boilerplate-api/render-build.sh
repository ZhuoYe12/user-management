\#!/usr/bin/env bash\n# Make script exit when a command fails\nset -e\n\necho \\\Current
directory:
\C:\Users\Administrator\OneDrive\Documents\Project\user-management-system1\node-mysql-boilerplate-api\\\\necho \\\Directory
contents:
\\\\\n\ncd angular-signup-verification-boilerplate\n\necho \\\Node
version:
\v22.14.0\\\\necho \\\NPM
version:
\10.9.2\\\\n\nnpm install\n\necho \\\Looking
for
ng
executable
in
./node_modules/.bin/
...\\\\nls -la ./node_modules/.bin/ || echo \\\./node_modules/.bin/
not
found
or
empty\\\\n\n./node_modules/.bin/ng build angular-signup-verification-boilerplate --configuration production\
