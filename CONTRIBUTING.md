# Contributing: architecture & conventions

This app is being migrated to a feature-based architecture. The full phased plan
lives in the PR history / project board. The rules below apply to **all new code**.
Legacy code (`src/context`, `src/services`, `src/lib`, `src/hooks`, `src/types`,
old `src/pages/**` components) is migrated feature by feature and then deleted.

## Folder structure

```
src/
  app/            App shell only: providers, router, Redux store, layout
  pages/          THIN route pages mirroring the URL tree
  features/       All business logic and UI, one folder per domain
    <feature>/
      components/   PascalCase.tsx, one component per file
      hooks/        useXxx.ts (query/mutation hooks + UI hooks), queryKeys.ts
      services/     xxxService.ts: pure engine/axios calls, no React
      store/        xxxSlice.ts (Redux Toolkit), only if the feature has client state
      schemas/      zod schemas + z.infer types
      types/        xxx.types.ts
      utils/        pure functions (+ xxx.test.ts next to them)
      constants/
      index.ts      PUBLIC API: the only file other code may import from
  shared/         Cross-feature building blocks (api/, components/, hooks/, types/, utils/)
```

### Pages
A page does routing work only: read params, render **one** feature entry component.
No queries, no Redux, no business logic, ~40 lines max.

```tsx
export default function VisualizerBuilderPage() {
    const { id } = useParams<{ id?: string }>()
    return <VisualizerBuilder visualId={id} />
}
```

### Imports
- Always use the `@/` alias (maps to `src/`), never `../../..`. It is configured for
  TypeScript in `tsconfig.json` and for the build in `viteConfigExtensions.mts`.
- Outside a feature, import only from its barrel: `@/features/visualizers`,
  never `@/features/visualizers/components/X`. ESLint enforces this.

## Naming

| Kind | Convention | Example |
|---|---|---|
| Folders | kebab-case | `data-sources/` |
| Components | PascalCase `.tsx` | `DataSourceForm.tsx` |
| Hooks | camelCase `use*.ts` | `useDataSources.ts` |
| Services / utils / slices | camelCase `.ts` | `dataSourceService.ts`, `visualizerSlice.ts` |
| Types | `*.types.ts` | `dataSource.types.ts` |
| Type names | PascalCase | `DataSource`, `VisualSettings` |

`.tsx` only for files that contain JSX. Named exports everywhere, except the
default export of lazy-loaded route pages.

## Data fetching (server state)

**Never** write `useState` for `loading` / `error` / `data`. All server state goes
through TanStack Query:

- **Service** (`services/`): plain async functions that take a client and return typed data.
  - Current instance → the DHIS2 data engine (`useDataEngine()` → `engine.query` / `engine.mutate`).
  - External instance → `getInstanceClient(instance)` from `@/shared/api`.
- **Query keys** (`hooks/queryKeys.ts`): one typed factory per feature:
  ```ts
  export const dataSourceKeys = {
      all: ['dataSources'] as const,
      lists: () => [...dataSourceKeys.all, 'list'] as const,
      list: (filters: DataSourceFilters) => [...dataSourceKeys.lists(), filters] as const,
      details: () => [...dataSourceKeys.all, 'detail'] as const,
      detail: (id: string) => [...dataSourceKeys.details(), id] as const,
  }
  ```
- **Query option factories** (shared by `useQuery` and `queryClient.fetchQuery`) are named
  `xxxQueryOptions` (`analyticsQueryOptions`), so they never collide with state names.
- **Hooks**: one hook per concern (`useDataSources`, `useDataSource(id)`,
  `useSaveDataSource`, `useDeleteDataSource`). Mutations invalidate the relevant
  keys in `onSuccess` and report feedback with `useAlert` from `@dhis2/app-runtime`.
- Use the built-in DHIS2 hooks for platform concerns: `useConfig`, `useAlert`,
  `useDataEngine`, `useTimeZoneConversion`.

## Client state

UI state that must be shared across components (builder selections, settings,
layout) lives in a Redux Toolkit slice inside the owning feature
(`features/<x>/store/xxxSlice.ts`). Use the typed `useAppSelector` /
`useAppDispatch` from `@/app/store`. Local component state stays in `useState`.
`@/app/store` exports hooks and types only; the store instance (`@/app/store/store`) is
imported by `AppProviders` alone, otherwise feature barrels and the store import each other.
Server data is **never** copied into Redux.

**No React Context API** for app state. Do not call `createContext`/`useContext`
(ESLint error in `app/`, `features/`, `shared/`). The legacy `AuthContext` is being
removed. Library providers (Redux, TanStack Query, DHIS2) are the only contexts.

## UI

- `@dhis2/ui` is the component library (Button, Modal, InputField, Transfer,
  DataTable, TabBar, CircularLoader, NoticeBox…). Do not add new shadcn/Radix/Mantine usage.
- Tailwind is used for layout and spacing only.
- Charts: recharts (inside `features/charts`). Maps: react-leaflet. Dashboard grid: react-grid-layout.
- Forms: react-hook-form + zod, rendered with `@dhis2/ui` fields.

## i18n

Every user-facing string goes through `i18n.t()` from `@dhis2/d2-i18n`. Use
interpolation, not concatenation: `i18n.t('Saved {{name}}', { name })`.
Always `import i18n from '@dhis2/d2-i18n'`. Never import `src/locales` (generated):
it is imported once in `src/App.tsx` to register the translations.

## Environment

Build-time variables must be prefixed `DHIS2_` (the platform drops anything else).
Copy `.env.example` to `.env`. Read them only through `env` from
`@/shared/constants/env`, never `process.env` directly.

## Feedback & shared UI

- Success/error messages: `useNotify()` from `@/shared/hooks` (DHIS2 AlertBar).
- Loading / error / empty: `LoadingState`, `ErrorState`, `EmptyState` from `@/shared/components`.
- Lists: `DataTable` from `@/shared/components` (search, sort, pagination built in).
- Confirmations: `ConfirmModal`.

## TypeScript

- **No `any`, anywhere.** Not as an annotation, not `as any`, not `any[]`. Use a real
  type, a generic, or `unknown` + narrowing. It is an ESLint error in `app/`,
  `features/`, `shared/`, and the `yarn typecheck` ratchet fails the commit if the total
  `any` count in legacy code goes up.
- **All existing type errors get fixed.** Every phase lowers the `tsc` error count and
  the `any` count; files you create or migrate must have 0 of both. Target: 0 / 0.
- No `@ts-ignore` / `@ts-nocheck`. If truly unavoidable, `@ts-expect-error` with a reason.
- Type DHIS2 payloads in `shared/types/dhis2.types.ts` or the feature's `types/`.

## Dependencies

`@dhis2/app-runtime` and `@dhis2/ui` must resolve to a **single copy**, the same version
the platform's `@dhis2/app-shell` uses. Two copies means two React contexts, and the
platform header crashes with "No QueryClient set". After upgrading any `@dhis2/*` package:

```
npx yarn-deduplicate --scopes @dhis2 @dhis2-ui @tanstack && yarn
rm -rf node_modules/.vite   # drop Vite's cached pre-bundled deps
```

## Quality gates

```
yarn typecheck   # ratchet: tsc errors and `any` count may never go up; app/features/shared must have 0
yarn lint
yarn test        # jest via d2-app-scripts; put *.test.ts next to the code
yarn format
yarn build
```

A Husky pre-commit hook runs lint-staged (prettier + eslint on staged files) and
the typecheck ratchet. CI runs typecheck, lint and build on every PR.
When you fix legacy type errors or remove `any`, run `yarn typecheck:update-baseline` to lock in progress.
