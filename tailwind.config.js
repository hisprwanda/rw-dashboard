const path = require('path')

// The DHIS2 palette. Loaded by path: the package "exports" map hides this file, and the
// package entry point needs a DOM, which Tailwind (Node) does not have.
const { colors } = require(
    path.join(__dirname, 'node_modules/@dhis2/ui-constants/build/cjs/colors.js')
)

/**
 * Tailwind is used for layout and spacing only; components come from @dhis2/ui.
 * DHIS2 colors are available as `dhis2-*` (e.g. `bg-dhis2-blue800`).
 * @type {import('tailwindcss').Config}
 */
module.exports = {
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: { dhis2: colors },
        },
    },
    plugins: [],
}
