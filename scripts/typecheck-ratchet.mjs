#!/usr/bin/env node
/**
 * Type-safety ratchet.
 *
 * Tracks legacy type debt and fails when it grows:
 *   - `tsc` errors, in total AND per file (a file may never gain errors, even if
 *     others were fixed in the same change)
 *   - `any` usages (explicit `any` type annotations, `as any`, `any[]`, generics…)
 * Always fatal, whatever the baseline: errors that crash at runtime (undefined names,
 * missing modules/exports, use before declaration).
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

// Error codes that are (almost) always a runtime crash, never "just typing debt".
const FATAL_CODES = new Set([
    'TS2304', // Cannot find name
    'TS2552', // Cannot find name. Did you mean…
    'TS18004', // No value exists in scope for the shorthand property
    'TS2448', // Block-scoped variable used before its declaration
    'TS2454', // Variable is used before being assigned
    'TS2305', // Module has no exported member
    'TS2307', // Cannot find module
    'TS2614', // Module has no exported member (did you mean default import)
    'TS2724', // Module has no exported member named…
])
const codeOf = (line) => line.match(/error (TS\d+)/)?.[1]
const fileOf = (line) => line.slice(0, line.indexOf('('))
const countByFile = (lines) =>
    lines.reduce((acc, line) => {
        const file = fileOf(line)
        acc[file] = (acc[file] ?? 0) + 1
        return acc
    }, {})

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
const current = {
    errors: tscErrors.length,
    any: anyUsages.length,
    files: Object.fromEntries(Object.entries(countByFile(tscErrors)).sort()),
}

if (process.argv.includes('--update')) {
    const grew = Object.entries(current.files).some(([f, n]) => n > (baseline.files?.[f] ?? 0))
    if (current.errors > baseline.errors || current.any > baseline.any || (baseline.files && grew)) {
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
const fatal = tscErrors.filter((l) => FATAL_CODES.has(codeOf(l)))
if (fatal.length) {
    console.error(fatal.join('\n'))
    console.error(`\n✖ ${fatal.length} error(s) that crash at runtime (undefined names, missing imports…).`)
    failed = true
}
const grownFiles = Object.entries(current.files).filter(
    ([file, count]) => count > (baseline.files?.[file] ?? 0)
)
if (grownFiles.length) {
    for (const [file] of grownFiles) {
        console.error(tscErrors.filter((l) => fileOf(l) === file).join('\n'))
    }
    console.error(
        `\n✖ New type errors in: ${grownFiles
            .map(([f, n]) => `${f} (${baseline.files?.[f] ?? 0} -> ${n})`)
            .join(', ')}`
    )
    failed = true
}
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
