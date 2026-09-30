# Data Analytics Lab  

Data Analytics Lab is a powerful data visualization tool developed by **HISP Rwanda**. It offers an interactive dashboard experience, enabling users to create dynamic slides with highly customizable visualizations. The application integrates seamlessly with multiple DHIS2 instances and provides an intuitive interface for analyzing and presenting data effectively.  

---

## Features  

### 1. Data Source Management  

Data Analytics Lab allows secure and efficient integration with multiple DHIS2 instances.  

**Requirements**: To add a data source, the following details are required:  
- **Instance Name**  
- **Instance URL**  
- **Access Token**: Generated from the DHIS2 instance by the user, with an expiration date.   
- Expired tokens can be updated anytime with valid ones.  

ATTENTION: Whitelist Configuration:  
- Add the Data Analytics Lab URL to the DHIS2 instance whitelist to avoid CORS (Cross-Origin Resource Sharing) errors.  

Once added, Data Analytics Lab can securely fetch and analyze data from these data sources.  

---

### 2. Visualizer Management  

Create visually appealing and customizable data visualizations with the following features:  

- **Dimensions**: Configure visuals using three key dimensions:  
  1. **Data**  
  2. **Period**  
  3. **Organization Unit**  

- **Visualization Types**: Choose from 14 types, including:  
  - Table  
  - Column, Stacked Column  
  - Bar, Stacked Bar  
  - Line, Area  
  - Pie, Radar, Scatter  
  - Radial, Single Value, Tree Map ,Gauge

- **Customization**: Modify visual attributes, such as:  
  - Color palette  
  - Axis font size  
  - Headings and subheadings  

- **Dynamic Data Source Switching**: Change data sources on the fly while designing visuals.  

---

### 3. Dashboard Management  

Combine multiple visuals to build fully customizable dashboards:  

- **Grid-Based Layout**:  
  - Drag, resize, and arrange visuals flexibly.  

- **Customization Options**:  
  1. Change dashboard background.  
  2. Pin dashboards to the home page for easy access.  
  3. Mark dashboards as favorites for quick retrieval.  

---

### 4. Thematic Maps

Build choropleth maps from any data item: pick data, period and org units (with levels
and groups), choose labels (area, data, period, value) and an automatic or DHIS2 legend,
and switch between a light and an OpenStreetMap basemap. Maps can be added to dashboards.

---

### 5. Weekly Epidemiological Bulletin

Pick a week to generate the eIDSR bulletin: weekly reportable diseases, immediate
reportable events, deaths and community alerts, with texts taken from a dataStore template
(`DHIS2_BULLETIN_STORE` / `DHIS2_BULLETIN_TEMPLATE_KEY`, default `epide-bulletin/epide`).

---

### 6. Presentation Mode  

Transform dashboards into dynamic slide presentations:  

- **Configuration Options**:  
  1. Define the number of slides to display at a time.  
  2. Set the duration.  
  3. Select available tracks.  

- **Interactivity**:  
  - **Pause and Resume Presentations**  
  - **Hover Over Visuals**: View details interactively.  
  - **Fullscreen Mode**: Offers a better viewing experience for presentations.  

---

## What's Next?  

Data Analytics Lab is evolving! Here are the planned features for future releases:  

1. **AI integration**: Integration for advanced analytics and quick insights.  
2. **Dashboard Grouping**: Organize dashboards into folders or groups.     
3. **Live Data Fetching**: Fetch data from non-DHIS2 systems for cross-platform analysis.  
4. **Import existing DHIS2 dashboards**

---

## Key Technologies  

- **React 18 + TypeScript** (strict, `noUncheckedIndexedAccess`) on the **DHIS2 App Platform** (`@dhis2/cli-app-scripts`, Vite).
- **@dhis2/ui** for components and icons; **Tailwind CSS** for layout only.
- **TanStack Query** + the **DHIS2 data engine** for all server state (external instances through the same hooks).
- **Redux Toolkit** for builder state (selection, org units, visualizer, map, dashboard editor).
- **Recharts** (charts), **react-leaflet** (maps), **react-grid-layout** (dashboards).
- **React Hook Form + Zod** for forms; **@dhis2/d2-i18n** for translations (English, French).

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
- Server data is read with `useQuery` over the data engine; writes use `useMutation` and
  invalidate the feature's query keys. No manual `isLoading`/`isError` state.
- No React Context for app state (ESLint enforces it).
- See **CONTRIBUTING.md** for naming, data fetching, i18n and review rules.

---

## Acknowledgments  

We extend our heartfelt gratitude to the following developers who contributed to this project:  

- **Nsengiyumva Christian**: [cristiannsengi@gmail.com] 
- **Roger Ndutiye**: [rogerndutiye@gmail.com] 
- **IRADUKUNDA Derrick**: [iradukundaderrick7@gmail.com] 

---

## Getting Started  

```bash
cp .env.example .env        # dataStore namespaces (DHIS2_* variables)
yarn install
yarn start --proxy https://play.im.dhis2.org/stable-2-43-1   # or your instance
```

Quality gates (also run by the pre-commit hook and CI):

```bash
yarn typecheck   # tsc, must report 0 errors
yarn lint        # ESLint, 0 errors (no any, no untranslated JSX text, no floating promises)
yarn test        # Jest: utils, hooks with a mocked data engine, a smoke test per page
yarn build       # also extracts translations into i18n/en.pot
```

 ## Contact Us
For support or feedback, reach out to us at:
HISP Rwanda
Email: [mouricej@hisprwanda.org]
Website:[www.hisprwanda.org]