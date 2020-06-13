# Developing

## Running & testing

```bash
# Run all tests
npm run test
```

```bash
# Watch mode (also generate code coverage into /coverage/ directory)
npm run test:watch
```

## Run linter (eslint)

The linter will run over `src/**/*.ts` and `examples/**/*.{ts,js}` files.

```bash
npm run lint
```

## Building

- `npm run build` builds the final javascript, typescript declarations, and _typedoc_ documentation into `/dist/`.
- `npm run build:all` builds all of the above, plus the public website.
- `npm run build:typedocs` only build typedoc markdown (then used for generating API pages)

```bash
npm run build
```

## Live stuff

- `npm run build:docs:watch`: this will be live except fro the API section, because it needs
  the typedoc to also run on changes. (Todo: find a way to refresh typedoc-generated) markdown, then
  rerun `build:docs`).

## Committing

Caporal is using [commitizen](https://github.com/commitizen/cz-cli), meaning that when you commit, you'll be prompted to fill out any required commit fields, hence generating [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) compatible commit messages.

Please pay attention to your commit messages as they are used to generate changelog entries.
