import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const fromRoot = (relative: string) => fileURLToPath(new URL(relative, import.meta.url))

/**
 * Merged onto the DHIS2 App Platform's Vite config (see d2.config.js).
 */
export default defineConfig({
    resolve: {
        // The platform copies `src/` into `.d2/shell/src/D2App/` and builds that copy,
        // so `@` must point there. Pointing it at the original `src/` would load every
        // module twice (once via `@/…`, once via relative imports).
        alias: [
            { find: '@', replacement: fromRoot('./.d2/shell/src/D2App') },
            // `@dhis2/maps-gl` imports its 1.4 MB Earth Engine worker eagerly; the app draws
            // no Earth Engine layers, so that import gets a small stub.
            {
                find: /^\.\.?\/earthengine\/index\.js$/,
                replacement: fromRoot('./src/shared/stubs/earthEngineWorker.ts'),
            },
        ],
    },
    // Vite's default cache lives in `.d2/shell/node_modules`, a symlink to
    // `node_modules/@dhis2/app-shell/node_modules`, which does not exist when the
    // shell's dependencies are deduplicated (as they should be). Keep the cache in
    // the project's own node_modules instead.
    cacheDir: fromRoot('./node_modules/.vite'),
    css: {
        // Vite's root is the generated `.d2/shell`, and from there it no longer finds the
        // project's `postcss.config.js` (Tailwind) on its own: the CSS was served raw.
        postcss: fromRoot('.'),
    },
})
