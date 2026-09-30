/**
 * Extends the DHIS2 App Platform's Jest defaults (d2-app-scripts shallow-merges this
 * file over them, so the default moduleNameMapper must be spread in explicitly).
 * Loaded by absolute path because the package's "exports" map hides the config folder.
 */
const path = require('path')

const defaults = require(
    path.join(__dirname, 'node_modules/@dhis2/cli-app-scripts/config/jest.config.js')
)

module.exports = {
    setupFiles: ['<rootDir>/jest.setup.js'],
    // react-leaflet only ships ES modules: let Babel transform it (as the default does for moment).
    transformIgnorePatterns: ['/node_modules/(?!(moment/dist/|react-leaflet/|@react-leaflet/))'],
    moduleNameMapper: {
        ...defaults.moduleNameMapper,
        '^@/(.*)$': '<rootDir>/src/$1',
        // axios ships ESM by default, which Jest 27 cannot parse: use its CommonJS build.
        '^axios$': '<rootDir>/node_modules/axios/dist/node/axios.cjs',
        // Jest 27 ignores "exports" maps: point the plugin host subpath at its CommonJS build.
        '^@dhis2/app-runtime/experimental$':
            '<rootDir>/node_modules/@dhis2/app-runtime/build/cjs/experimental.js',
    },
}
