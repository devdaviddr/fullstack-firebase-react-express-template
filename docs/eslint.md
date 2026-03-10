# ESLint — configuration and usage

This repository uses a single, root ESLint configuration to enforce TypeScript
and React best-practices across both the client and server packages.

See the active config at [.eslintrc.cjs](.eslintrc.cjs) and the ignore
patterns at [.eslintignore](.eslintignore).

## Overview

- Parser: `@typescript-eslint/parser` with `tsconfigRootDir` set to the repo root.
- Plugins: `@typescript-eslint`, `import`, `react`, `react-hooks`.
- Extends: `eslint:recommended`, `plugin:@typescript-eslint/recommended`,
  `plugin:import/recommended`, `plugin:import/typescript`, `plugin:react/recommended`.
- Import resolver is configured for TypeScript projects so path resolution
  works across `packages/*/tsconfig.json`.

## Important rules enforced

- `@typescript-eslint/explicit-module-boundary-types: error`
  - Requires explicit return types on exported functions/exports. This aligns
    with the repo's TypeScript guideline to keep public API types explicit.
- `@typescript-eslint/no-explicit-any: error`
  - Disallows `any` except where explicitly permitted by overrides (config files
    and some test helpers). Prefer `unknown` + type-guards instead.
- `@typescript-eslint/triple-slash-reference: error`
  - Enforces using `import` style typing for tests (Vitest) rather than
    triple-slash references.
- `@typescript-eslint/no-unused-vars` with `_`-prefix ignore
  - Allows intentionally unused args/vars when prefixed with `_`.
- `no-console: ['warn', { allow: ['warn','error'] }]`
  - Console is warned by default but allowed for `warn`/`error`. The server
    override further relaxes this to support logging middleware.
- `import/no-unresolved: error`
  - Ensures imports resolve correctly; some import checks are pragmatically
    disabled in overrides where false-positives occurred.

## Overrides (high level)

- `packages/client/src/**/*.{ts,tsx}`
  - `env`: browser/node. Type-aware linting uses `packages/client/tsconfig.json`.
  - Disables `import/no-named-as-default-member` where it produced false
    positives for certain imports.

- `packages/server/src/**/*.{ts,tsx}`
  - `env`: node. Type-aware linting uses `packages/server/tsconfig.json`.
  - Pragmatic relaxations: allow CommonJS `require` usage in a few places,
    disable some `import/*` checks that produced false positives, and allow
    `console` for structured logging in middleware/services.

- Tests: `**/*.test.ts`, `**/*.test.tsx`, `tests/**`
  - Test environment uses standard ES2021 globals; `import/no-extraneous-dependencies`
    is turned off for test files.

- Config files (`**/*.config.ts`, `**/*vite*.ts`, `**/*vitest*.ts`,
  `**/*tailwind*.ts`)
  - These files are excluded from the strict `no-explicit-any` rule to ease
    interop with tooling configs (the codebase still prefers typed configs
    where practical).

## Files of interest

- Root ESLint config: [.eslintrc.cjs](.eslintrc.cjs)
- Ignore file: [.eslintignore](.eslintignore)
- Root dev dependencies: [package.json](package.json)
- Client lint script: [packages/client/package.json](packages/client/package.json)
- Server lint script: [packages/server/package.json](packages/server/package.json)

## How to run linting locally

Install deps (if not already installed):

```bash
npm install
```

Run the workspace lint scripts (this runs per-package lint commands):

```bash
npm run lint
```

Autofix common issues across the repo:

```bash
npx eslint . --ext .ts,.tsx --fix
```

If you want to lint only a package (faster iteration):

```bash
npm run lint --workspace=packages/client
npm run lint --workspace=packages/server
```

## Notes & recommendations

- You may see a warning from `@typescript-eslint` about TypeScript version
  compatibility (this repo uses a newer TypeScript than the parser's tested
  range). To silence that and ensure deterministic behaviour, either:
  - Align `typescript` with the tested versions for the installed
    `@typescript-eslint/*` packages, or
  - Upgrade `@typescript-eslint/*` to a release that officially supports
    your TypeScript version.

- The config enforces strict rules (no `any`, explicit module boundaries). For
  quick progress, there are scoped overrides for tests and configuration files.
  Prefer fixing code to conform to the strict rules rather than widening
  overrides where possible.

- Some `import/*` rules were temporarily relaxed in server/client overrides
  due to TypeScript resolver mismatches; if you add new path aliases or change
  `tsconfig` layouts, update the `import/resolver` settings in
  `.eslintrc.cjs` so stricter import rules can be re-enabled.

## How to change rules

1. Edit the root configuration at [.eslintrc.cjs](.eslintrc.cjs).
2. Run `npx eslint . --ext .ts,.tsx --fix` to apply automatic fixes.
3. Run `npm run lint` to ensure both packages pass the rules (server runs
   `tsc --noEmit` after linting).
