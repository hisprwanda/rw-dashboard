#!/usr/bin/env node
/**
 * Type-safety ratchet.
 *
 * Tracks two numbers for the whole codebase and fails when either goes UP:
 *   - `tsc` errors
 *   - `any` usages (explicit `any` type annotations, `as any`, `any[]`, generics…)
 * Files under src/app, src/features and src/shared must always have 0 of both.
 *
 * The goal (Phase 11) is 0 / 0, after which this script is replaced by plain `tsc --noEmit`.
 *
 *   yarn typecheck                     # check against baseline
 *   yarn typecheck:update-baseline     # record new (lower) numbers
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

const BASELINE_FILE = new URL('./typecheck-baseline.json', import.meta.url)
const STRICT_DIRS = ['src/app/', 'src/features/', 'src/shared/']
const isStrict = (file) => STRICT_DIRS.some((d) => file.startsWith(d))

// --- tsc errors -------------------------------------------------------------
const result = spawnSync('npx', ['tsc', '--noEmit', '-p', '.'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
})
const tscErrors = `${result.stdout}${result.stderr}`
    .split('\n')
    .filter((l) => /error TS\d+/.test(l))

// --- any usages -------------------------------------------------------------
const walk = (dir) =>
    readdirSync(dir).flatMap((name) => {
        const p = join(dir, name)
        if (name === 'locales') return []
        return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(name) ? [p] : []
    })

const anyUsages = []
for (const file of walk('src')) {
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
    const visit = (node) => {
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
            const { line } = source.getLineAndCharacterOfPosition(node.getStart())
            anyUsages.push(`${file}:${line + 1}`)
        }
        ts.forEachChild(node, visit)
    }
    visit(source)
}

// --- compare ----------------------------------------------------------------
const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'))
const current = { errors: tscErrors.length, any: anyUsages.length }

if (process.argv.includes('--update')) {
    if (current.errors > baseline.errors || current.any > baseline.any) {
        console.error(
            `Refusing to raise the baseline (errors ${baseline.errors} -> ${current.errors}, any ${baseline.any} -> ${current.any}).`
        )
        process.exit(1)
    }
    writeFileSync(BASELINE_FILE, `${JSON.stringify(current, null, 2)}\n`)
    console.log(
        `Baseline updated: errors ${baseline.errors} -> ${current.errors}, any ${baseline.any} -> ${current.any}`
    )
    process.exit(0)
}

let failed = false
const strictErrors = tscErrors.filter(isStrict)
const strictAny = anyUsages.filter(isStrict)
if (strictErrors.length || strictAny.length) {
    console.error([...strictErrors, ...strictAny.map((l) => `${l}  any is not allowed`)].join('\n'))
    console.error(`\n✖ ${STRICT_DIRS.join(', ')} must have 0 type errors and 0 any.`)
    failed = true
}
if (current.errors > baseline.errors) {
    console.error(tscErrors.join('\n'))
    console.error(`\n✖ Type errors increased: ${current.errors} (baseline ${baseline.errors}).`)
    failed = true
}
if (current.any > baseline.any) {
    console.error(`\n✖ New "any" added: ${current.any} usages (baseline ${baseline.any}). Use a real type or unknown.`)
    failed = true
}
if (failed) process.exit(1)

const improved = current.errors < baseline.errors || current.any < baseline.any
console.log(
    `✔ ${current.errors} type errors (baseline ${baseline.errors}), ${current.any} any (baseline ${baseline.any}).` +
        (improved ? ' Run "yarn typecheck:update-baseline" to lock in the progress.' : '')
)
