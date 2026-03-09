---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript Guidelines

- Enable and respect `strict` mode — no implicit `any`, no non-null assertions (`!`) unless the null/undefined case is provably impossible.
- Use `unknown` + type-guard (`instanceof`, `typeof`, Zod `.safeParse`) instead of casting to `any`.
- Prefer interfaces for object shapes that will be extended; use `type` aliases for unions, intersections, and mapped types.
- All async functions must be fully `await`-ed — never fire-and-forget unless a deliberate side-effect comment explains why.
- Public functions and exported types must have JSDoc `/** */` comments on the `why`, not just `what`.
- Avoid re-exporting everything with barrel `index.ts` files; import directly from the source file to keep tree-shaking effective.
- Use `satisfies` or explicit return types on exported functions so callers get precise inference.

## Client (`packages/client/src`)

- Components: named export for utilities/hooks; **default export only** for page/route-level components.
- Hooks (`useXxx`): one concern per hook; keep side-effects (`useEffect`) inside the hook, not in the component.
- Never call `getIdToken()` at component render time — call it inside a React Query `queryFn` only (see `api/hooks.ts → useMe`).
- Tailwind: use utility classes directly; avoid `@apply` in CSS unless reusing a multi-class pattern 3+ times.

## Server (`packages/server/src`)

- Every async Express handler must end in `try/catch` → `next(err)` or be wrapped in an async error-forwarding helper.
- Import config exclusively from `config.ts`; never read `process.env` directly in feature code.
- Validate all incoming request bodies with `zod` before touching `req.body`.
- Layer boundary: `controllers` import from `services`; `services` import from `repositories`; cross-layer imports are forbidden.
