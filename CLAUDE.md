# rw-dashboard (Data Analytics Lab)

DHIS2 custom app (d2-app-scripts, React 18, TypeScript). Architecture, naming, data-fetching
and UI rules are in `CONTRIBUTING.md`; follow them for all new code.

- Feature-based layout: `src/app` (providers, router, store, layout), `src/pages` (thin routes),
  `src/features/<name>` (public API = `index.ts`), `src/shared`. No React Context for app state.
- `src/components/ui` + `src/lib/utils.ts` are the last shadcn leftovers (used by the charts);
  they are removed in Phase 9.
- Server state: TanStack Query + DHIS2 data engine. Client UI state: Redux Toolkit slices per feature.
- UI: `@dhis2/ui` first; Tailwind for layout only; do not add shadcn/Mantine usage.
- Checks: `yarn typecheck` (must stay at 0 errors / 0 `any`), `yarn lint`, `yarn test`, `yarn build`.
