# Data Analytics Lab

Data Analytics Lab is a DHIS2 app developed by **HISP Rwanda** for analysing and presenting
health data. Inside one app you can build charts, tables and maps, combine them into
dashboards, present those dashboards as slide shows, and publish periodic bulletins.

It reads data from the DHIS2 instance it is installed on **and from other DHIS2 instances**,
and a single chart can even combine data items from several instances.

The chart builder follows the official DHIS2 Data Visualizer: the same chart types, layout
rules and options, drawn by the same DHIS2 chart engine. What you build here looks the same
as it does in DHIS2.

---

## At a glance

| Area | What you can do |
|---|---|
| **Data sources** | Connect other DHIS2 instances with a personal access token, and switch between them while you build. |
| **Visualizer** | Build every Data Visualizer chart type, plus two extra types, from one or several instances. |
| **Maps** | Build thematic (choropleth) maps with DHIS2 or automatic legends. |
| **Dashboards** | Arrange your visuals, your maps and live DHIS2 favorites on a grid. Share, pin, favorite and export them. |
| **Presentation mode** | Play a dashboard as a full-screen slide show with background music. |
| **Bulletins** | Design bulletin templates and publish issues for any period, in several languages. |
| **Languages** | The interface is in English and French, with Kinyarwanda in progress. |

---

## 1. Data sources

Data Analytics Lab always reads the instance it is installed on. You can also add **external
DHIS2 instances**:

- To add one, enter an **instance name**, its **URL** and a **personal access token**
  generated on that instance.
- An expired token can be replaced at any time.
- Data sources are saved in the dataStore of the instance the app runs on.
- Every builder (visualizer, maps, bulletins) has a data source picker, so you can switch
  instance while you work.

> **CORS:** the app calls external instances directly from the browser. On each external
> instance, add the address of Data Analytics Lab to the CORS allowlist (*System settings →
> Access → CORS allowlist*). Without it, requests to that instance are blocked.

---

## 2. Visualizer

The visualizer looks and works like the official DHIS2 Data Visualizer.

### Building a visual

- **Dimensions panel** on the left:
  - *Data*: indicators, data elements, data sets, program indicators… with type and group
    filters and search.
  - *Period*: relative and fixed periods.
  - *Organisation unit*: tree, levels, groups, or the user's own org units.
  - *Other dimensions*: categories, category option group sets and org unit group sets.
- **Layout**: drag dimensions between *Columns*, *Rows* and *Filter*. Each chart type keeps
  only the layouts DHIS2 allows (for example a pie chart has a single series).
- **Update** runs the analytics. The chart takes all the space the panels leave.

### Chart types

The type picker shows every type with its icon and a short description of what it is for.

- **DHIS2 types**, drawn by the official DHIS2 chart engine and pivot table:
  - Pivot table
  - Column, stacked column
  - Bar, stacked bar
  - Line, area, stacked area
  - Pie, radar, gauge
  - Year over year (line), year over year (column): compare the same months or quarters
    across several years.
  - Single value
  - Scatter
  - Outlier table: lists unusual values using the z-score or modified z-score method. It
    needs DHIS2 2.41 or newer.
- **Additional types**, drawn by this app: **Radial** and **Tree map**.

### Options

**Options** (next to **Title**) is the single place for settings:

- **DHIS2 types** have the Data Visualizer options:
  - **Data**: show values, cumulative values, 100% stacked, hide empty categories, sort order.
  - **Axes**: range, steps, title, target line, base line, trend lines.
  - **Legend**: hide the key, or color values with a DHIS2 **legend set**.
  - **Style**: the DHIS2 color sets.
  - **Pivot tables**: totals and subtotals, hiding empty rows and columns, percentages, display
    density, font size, org unit hierarchy and fixed headers.
  - **Outlier tables**: method, threshold, maximum results and sorting.
- **Radial and Tree map** have series colors (with an accessible default palette), label color
  and size, and background.

### Data from several instances

Add **data from other sources** to a visual. The extra data items come from another
instance but use the visual's periods and organisation units, and appear in the same chart.

- Organisation units are matched by UID, so it works best between instances that share their
  hierarchy.
- If one instance cannot be reached, the visual still shows the data of the others, with a
  warning naming the missing instance.

### Saving and sharing

- Visuals are saved, then reopened and edited later.
- **Export** a visual as PNG, JPEG, PDF or PowerPoint, or **download its data** as CSV.

---

## 3. Maps

- Build **thematic (choropleth) maps** from any data item.
- Pick the data, a period and organisation units (with levels and groups).
- Choose the labels to show (area name, data, period, value).
- Color the areas with an automatic legend or a DHIS2 legend set.
- Use a light basemap or OpenStreetMap.
- Maps are saved and can be added to dashboards.

---

## 4. Dashboards

Combine your work on a grid:

- **Drag and resize** items freely.
- **Items you can add:**
  - your own visuals and maps;
  - **live DHIS2 visualizations and maps** made in the Data Visualizer and Maps apps, from
    this instance or an external one. Only a link is saved, so changes made in DHIS2 appear
    on the dashboard.
- **How DHIS2 items are drawn:**
  - on this instance, by DHIS2's own plugins, as in the official Dashboard app;
  - on external instances, the favorite itself goes to the same DHIS2 chart engine and pivot
    table, so it looks as in DHIS2. This includes its colors, axes, legend and totals.
  - single-layer thematic maps are drawn by the app. Other map layers (events, facilities,
    Earth Engine) show a link to open the map in DHIS2.
- **Organise:**
  - mark a dashboard as **official**, which pins it on the home page;
  - add dashboards to your **favorites**;
  - browse *My dashboards* and *Shared with me*, as cards or as a list.
- **Share** dashboards with users and user groups, using DHIS2 sharing.
- **Background color**, **full screen** and **export to PowerPoint**.

---

## 5. Presentation mode

Play any dashboard as a slide show:

- Choose how many items each slide shows and how long each slide stays.
- Add **background music** from the tracks uploaded in *Settings → Presentation music* (MP3).
- **Play, pause**, move to the previous or next slide, and switch to **full screen**.
- Hover over a chart to see its values while presenting.

---

## 6. Bulletins

Design periodic bulletins (weekly, monthly…) for any DHIS2 instance, with no
country-specific configuration in the code.

- **Templates** are saved in the dataStore and shared like dashboards. A template has:
  - a data source: the current instance or an external one;
  - a period type, organisation units and content languages;
  - an ordered list of sections.
- **Sections:**
  - cover (logos, subtitle) and free text;
  - indicator trends;
  - tracker cases and deaths, classified by rules;
  - event signals;
  - reporting completeness, with colored thresholds;
  - an outbreak table and notes.
  - Every title and text can be written in each content language.
- **Issues:** open a period, fill in the notes and the outbreak rows, save a draft or publish,
  then print or save as PDF.
- **Import and export:**
  - templates are JSON files;
  - `docs/bulletin-presets/rwanda-eidsr.json` is the Rwanda eIDSR bulletin, as an example;
  - *Import old bulletin texts* brings over the texts of the previous bulletin app.

---

## What's next?

1. **AI-assisted analysis**: quick insights and summaries of dashboards.
2. **Dashboard folders**: organise dashboards into groups.
3. **Non-DHIS2 data sources**: read data from other systems for cross-platform analysis.
4. **Import existing DHIS2 dashboards** as a whole.

---

## Getting started

Requirements: Node.js and Yarn 1. To use every chart type, a DHIS2 instance on 2.40 or later
is needed, and the outlier table needs 2.41 or later.

```bash
cp .env.example .env        # dataStore namespaces (DHIS2_* variables)
yarn install
yarn start --proxy https://play.im.dhis2.org/stable-2-43-1   # or your instance
```

`yarn build` creates the app bundle in `build/bundle/`. Install it on DHIS2 through the
*App Management* app.

Quality gates (also run by the pre-commit hook and CI):

```bash
yarn typecheck   # tsc, must report 0 errors
yarn lint        # ESLint, 0 errors (no any, no untranslated JSX text, no floating promises)
yarn i18n:check  # i18n/en.pot up to date and French complete
yarn test        # Jest: utils, hooks with a mocked data engine, a smoke test per page
yarn build       # also extracts translations into i18n/en.pot
```

---

## Key technologies

- **React 18 + TypeScript** (strict, `noUncheckedIndexedAccess`) on the **DHIS2 App
  Platform** (`@dhis2/cli-app-scripts`, Vite).
- **@dhis2/analytics**: the official DHIS2 chart engine (Highcharts), pivot table and layout
  rules.
- **@dhis2/ui** for components and icons; **Tailwind CSS** for layout only.
- **TanStack Query** with the **DHIS2 data engine** for all server data. External instances go
  through the same hooks.
- **Redux Toolkit** for builder state (selection, org units, visualizer, map, dashboard editor).
- **Recharts** for the additional chart types, **react-leaflet** for maps, and
  **react-grid-layout** for dashboards.
- **React Hook Form + Zod** for forms; **@dhis2/d2-i18n** for translations (English, French;
  Kinyarwanda draft).

---

## Architecture

```
src/
  app/        providers, router (lazy routes), Redux store, layout
  pages/      thin route pages: read the URL, render one feature component
  features/   one folder per feature, public API in index.ts
    <feature>/components | hooks | services | store | schemas | types | utils | constants
  shared/     API clients (engine + external instances), shared components, hooks, types
```

- A page imports features only through their barrel (`@/features/maps`).
- Server data is read with `useQuery` over the data engine. Writes use `useMutation` and
  invalidate the feature's query keys. There is no manual `isLoading`/`isError` state.
- No React Context for app state (ESLint enforces it).
- See **CONTRIBUTING.md** for naming, data fetching, i18n and review rules.

---

## Acknowledgments

We extend our heartfelt gratitude to the following developers who contributed to this project:

- **Mulisa Jules Maurice**: [mouricej@hisprwanda.org]
- **NSENGIYUMVA Christian**: [cristiannsengi@gmail.com]
- **IRADUKUNDA Derrick**: [iradukundaderrick7@gmail.com]

---

## Contact us

For support or feedback, reach out to us at:

**HISP Rwanda**
Email: [mouricej@hisprwanda.org]
Website: [www.hisprwanda.org]
