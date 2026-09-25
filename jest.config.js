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
    moduleNameMapper: {
        ...defaults.moduleNameMapper,
        '^@/(.*)$': '<rootDir>/src/$1',
    },
}
