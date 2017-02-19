#!/usr/bin/env bash
###############################################
#
# Usage
#
#   ./release.sh `patch`/`minor`/`major`/`<version>`
#
# defaults to conventional-recommended-bump
#
###############################################

npm install -g trash conventional-recommended-bump conventional-changelog conventional-github-releaser conventional-commits-detector json

np() {
    travis status --no-interactive &&
    ./node_modules/.bin/trash node_modules &>/dev/null;
    git pull --rebase &&
    npm install &&
    npm test &&
    cp package.json _package.json &&
    preset=`./node_modules/.bin/conventional-commits-detector` &&
    echo $preset &&
    bump=`./node_modules/.bin/conventional-recommended-bump -p angular` &&
    echo ${1:-$bump} &&
    npm --no-git-tag-version version ${1:-$bump} &>/dev/null &&
    ./node_modules/.bin/conventional-changelog -i CHANGELOG.md -s -p ${2:-$preset} &&
    git add CHANGELOG.md &&
    version=`cat package.json | ./node_modules/.bin/json version` &&
    git commit -m"docs(CHANGELOG): $version" &&
    mv -f _package.json package.json &&
    npm version ${1:-$bump} -m "chore(release): %s" &&
    git push --follow-tags &&
    ./node_modules/.bin/conventional-github-releaser -p ${2:-$preset} &&
    npm publish
}

np $@
