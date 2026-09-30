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
`store.ts` imports the slice files directly (the only allowed deep import): a feature barrel
also re-exports components, which would pull recharts/leaflet into the main bundle. For the
same reason a slice needing another feature's defaults imports its light
`@/features/<name>/constants` entry, never the barrel.
Server data is **never** copied into Redux.

**No React Context API** for app state. Do not call `createContext`/`useContext`
(ESLint error everywhere in `src/`). Library providers (Redux, TanStack Query, DHIS2) are
the only contexts.

## UI

- `@dhis2/ui` is the component library (Button, Modal, InputField, Transfer,
  DataTable, TabBar, CircularLoader, NoticeBox…) and the icon set. `lucide-react` is the only
  fallback for icons DHIS2 lacks. shadcn/Radix/Mantine were removed: do not add them back.
- Tailwind is used for layout and spacing only; DHIS2 colors are available as `dhis2-*`
  (from `@dhis2/ui-constants`, e.g. `bg-dhis2-blue800`).
- Charts: recharts (inside `features/charts`). Maps: react-leaflet. Dashboard grid: react-grid-layout.
- Forms: react-hook-form + zod, rendered with `@dhis2/ui` fields.

## i18n

Every user-facing string goes through `i18n.t()` from `@dhis2/d2-i18n`. Use
interpolation, not concatenation: `i18n.t('Saved {{name}}', { name })`.

- Call `i18n.t()` at render time with a literal key. Module-level constants are evaluated
  before the locale is loaded, and `i18n.t(variable)` is invisible to the extractor: use a
  label function instead (see `periodTypeLabel`, `dataItemTypeLabel`, `chartTypeLabel`).
- No `:` in keys (the extractor reads it as a namespace separator): write
  `Export failed. {{message}}`, not `Export failed: {{message}}`.
- Counts use real plural forms, with the counted value named `count`:
  `i18n.t('{{count}} report', { count, defaultValue: '{{count}} report', defaultValue_plural: '{{count}} reports' })`.
  A sentence counts one thing; embed other counts as their own plural strings
  (`{{count}} case of {{name}} reported by {{facilities}}`, with `facilities` from
  `facilityCount(n)`).
- Dates, numbers and percentages go through `@/shared/utils/format` (`formatDate`,
  `formatDateTime`, `formatNumber`, `formatPercent`, `formatLanguageName`). They follow the
  user's interface language, never the browser's. No bare `toLocaleString()` or
  `toFixed()` in UI code.
- Period names come from `@dhis2/multi-calendar-dates` with the user's locale
  (`useUserLocale()`) and the system calendar (`useSystemCalendar()`).
- Metadata is requested with `displayName` (`displayName~rename(name)` when the code
  expects `name`), so the server translates it. Analytics requests pass the user's
  `displayProperty` (`useDisplayProperty()`: names or short names).
- User-written content that must exist in several languages (bulletin titles, texts, column
  labels) is a `LocalizedText` (`{ en: '…', fr: '…' }`) read with `pickText`, which falls
  back to the other content languages. This is the only place the app translates data.
- ESLint (`i18next/no-literal-string`, `jsx-only`) rejects untranslated JSX text and
  literals, and untranslated `label`, `title`, `placeholder`, `aria-label`, `helpText`…
  attributes. Another rule rejects `:` in keys.
- `yarn i18n:extract` regenerates `i18n/en.pot` (`yarn build` does too); add the
  translations to `i18n/fr.po` in the same change. `yarn i18n:check` (run by CI) fails when
  `en.pot` is stale or a string has no French translation.

### Adding a language

1. Copy `i18n/en.pot` to `i18n/<code>.po` (e.g. `rw.po`), set `Language` and
   `Plural-Forms` in its header.
2. List only translated strings: an entry with an empty `msgstr` shows an empty text,
   while a missing entry falls back to English.
3. Once it is complete and reviewed, add the code to `COMPLETE` in
   `scripts/check-i18n.mjs` so CI keeps it complete. `rw.po` is a draft waiting for a
   native speaker's review.

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
  type, a generic, or `unknown` + narrowing. It is an ESLint error in all of `src/`.
- **Zero type errors.** `tsc` runs in strict mode with `noUncheckedIndexedAccess`: an
  indexed read (`list[0]`, `record[key]`) may be `undefined`, so handle it.
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
yarn typecheck   # tsc --noEmit: must report 0 errors
yarn lint
yarn i18n:check  # en.pot up to date, French complete
yarn test        # jest via d2-app-scripts; put *.test.ts next to the code
yarn format
yarn build
```

A Husky pre-commit hook runs lint-staged (prettier + eslint on staged files) and
`yarn typecheck`. CI runs typecheck, lint, the i18n check, tests and build on every PR.
