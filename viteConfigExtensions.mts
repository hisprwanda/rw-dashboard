import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

/**
 * Merged onto the DHIS2 App Platform's Vite config (see d2.config.js).
 *
 * The platform copies `src/` into `.d2/shell/src/D2App/` and builds that copy,
 * so the `@` alias must point there. Pointing it at the original `src/` would
 * load every module twice (once via `@/…`, once via relative imports).
 */
const appSource = fileURLToPath(new URL('./.d2/shell/src/D2App', import.meta.url))

export default defineConfig({
    resolve: {
        alias: { '@': appSource },
    },
})
