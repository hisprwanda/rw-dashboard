# rw-dashboard (Data Analytics Lab)

DHIS2 custom app (d2-app-scripts, React 18, TypeScript). Architecture, naming, data-fetching
and UI rules are in `CONTRIBUTING.md`; follow them for all new code.

-   Feature-based layout: `src/app` (providers, router, store, layout), `src/pages` (thin routes),
    `src/features/<name>` (public API = `index.ts`), `src/shared`. No React Context for app state.
-   Server state: TanStack Query + DHIS2 data engine. Client UI state: Redux Toolkit slices per feature.
-   UI: `@dhis2/ui` (components and icons; lucide only for icons DHIS2 lacks); Tailwind for
    layout only (DHIS2 palette as `dhis2-*`). Charts: recharts inside `features/charts`.
-   Checks: `yarn typecheck` (must stay at 0 errors / 0 `any`), `yarn lint`, `yarn test`, `yarn build`.

## Git commits

-   After completing each change (every file edit, fix, or feature step), create a git commit right away. Don't batch unrelated changes together.
-   Write clear, conventional commit messages (e.g. `feat: add patient search filter`, `fix: handle null visit date`).
-   Commits must be made under my own git identity (the user.name and user.email already configured in git). Never override the author or committer.
-   NEVER add a `Co-Authored-By: Claude` trailer, "Generated with Claude Code" line, or any other mention of Claude, Anthropic, or AI in commit messages, PR descriptions, or code comments.
-   Don't push unless I ask.

### Long tasks

-   For long or multi-step tasks, commit at each logical checkpoint instead of waiting until the end. A checkpoint is a finished sub-step: a working function, a migration, a component, a passing test, a completed refactor of one module.
-   Rule of thumb: if the work so far would be painful to lose or redo, commit it now.
-   Only commit code that runs or builds. If something is half-done, finish the smallest working piece first. If you must commit unfinished work, prefix the message with `wip:`.
-   Keep each commit to one purpose, so the history reads as a sequence of small steps and any one can be reverted on its own.
-   Before starting a big task, check `git status`. If there are uncommitted changes of mine, commit or stash them first so they don't get mixed into the task's commits.
-   Same author rules apply: my git identity only, no Claude co-author or attribution lines.
