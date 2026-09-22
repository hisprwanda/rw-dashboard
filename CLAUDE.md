# rw-dashboard (Data Analytics Lab)

DHIS2 custom app (d2-app-scripts, React 18, TypeScript). Architecture, naming, data-fetching
and UI rules are in `CONTRIBUTING.md`; follow them for all new code.

- The app is mid-migration from a type-based layout (`src/context`, `src/services`, `src/lib`,
  `src/pages/**`) to a feature-based one (`src/app`, `src/pages` thin routes, `src/features`, `src/shared`).
- Server state: TanStack Query + DHIS2 data engine. Client UI state: Redux Toolkit slices per feature.
- UI: `@dhis2/ui` first; Tailwind for layout only; do not add shadcn/Mantine usage.
- Checks: `yarn typecheck` (error-count ratchet), `yarn lint`, `yarn build`.
