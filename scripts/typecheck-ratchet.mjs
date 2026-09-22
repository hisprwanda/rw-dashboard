#!/usr/bin/env node
/**
 * Typecheck ratchet.
 *
 * The legacy code still has type errors that are fixed phase by phase
 * (see CONTRIBUTING.md). This script fails when the error count grows above
 * the recorded baseline, and when it drops it asks you to lower the baseline.
 * Files under src/app, src/features and src/shared must always have 0 errors.
 *
 *   yarn typecheck                     # check against baseline
 *   yarn typecheck:update-baseline     # record a new (lower) baseline
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const BASELINE_FILE = new URL('./typecheck-baseline.json', import.meta.url)
const STRICT_DIRS = ['src/app/', 'src/features/', 'src/shared/']

const result = spawnSync('npx', ['tsc', '--noEmit', '-p', '.'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
})
const lines = `${result.stdout}${result.stderr}`.split('\n')
const errors = lines.filter((l) => /error TS\d+/.test(l))
const strictErrors = errors.filter((l) => STRICT_DIRS.some((d) => l.startsWith(d)))

const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8')).errors
const count = errors.length

if (process.argv.includes('--update')) {
    if (count > baseline) {
        console.error(`Refusing to raise the baseline (${baseline} -> ${count}).`)
        process.exit(1)
    }
    writeFileSync(BASELINE_FILE, `${JSON.stringify({ errors: count }, null, 2)}\n`)
    console.log(`Baseline updated: ${baseline} -> ${count}`)
    process.exit(0)
}

if (strictErrors.length > 0) {
    console.error(strictErrors.join('\n'))
    console.error(`\n✖ ${strictErrors.length} type error(s) in strict folders (${STRICT_DIRS.join(', ')}).`)
    process.exit(1)
}

if (count > baseline) {
    console.error(errors.join('\n'))
    console.error(`\n✖ Type errors increased: ${count} (baseline ${baseline}).`)
    process.exit(1)
}

if (count < baseline) {
    console.log(`✔ ${count} type errors (baseline ${baseline}). Run "yarn typecheck:update-baseline" to lock in the progress.`)
} else {
    console.log(`✔ ${count} type errors (baseline ${baseline}).`)
}
