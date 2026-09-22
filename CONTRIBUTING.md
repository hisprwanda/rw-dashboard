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
- Always use the `@/` alias (maps to `src/`), never `../../..`.
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
Server data is **never** copied into Redux.

## UI

- `@dhis2/ui` is the component library (Button, Modal, InputField, Transfer,
  DataTable, TabBar, CircularLoader, NoticeBox…). Do not add new shadcn/Radix/Mantine usage.
- Tailwind is used for layout and spacing only.
- Charts: recharts (inside `features/charts`). Maps: react-leaflet. Dashboard grid: react-grid-layout.
- Forms: react-hook-form + zod, rendered with `@dhis2/ui` fields.

## i18n

Every user-facing string goes through `i18n.t()` from `@dhis2/d2-i18n`. Use
interpolation, not concatenation: `i18n.t('Saved {{name}}', { name })`.

## TypeScript

- No `any` (error in `app/`, `features/`, `shared/`; warning in legacy code).
- No `@ts-ignore`. If unavoidable, use `@ts-expect-error` with a reason.
- Type DHIS2 payloads in `shared/types/dhis2.types.ts` or the feature's `types/`.

## Quality gates

```
yarn typecheck   # ratchet: total errors may never go up; app/features/shared must have 0
yarn lint
yarn format
yarn build
```

A Husky pre-commit hook runs lint-staged (prettier + eslint on staged files) and
the typecheck ratchet. CI runs typecheck, lint and build on every PR.
When you fix legacy type errors, run `yarn typecheck:update-baseline` to lock in progress.
