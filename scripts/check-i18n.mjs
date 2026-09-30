#!/usr/bin/env node
/**
 * Translation checks (run by `yarn i18n:check` and CI):
 *
 * 1. `i18n/en.pot` matches the source: `d2-app-scripts i18n extract` must not change it.
 * 2. Every complete language has a translation for every string of `en.pot`
 *    (all plural forms). Draft languages only report their coverage.
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

/** Languages that must be fully translated. Others are drafts waiting for review. */
const COMPLETE = ['fr']
const I18N_DIR = 'i18n'
const POT = path.join(I18N_DIR, 'en.pot')

/** Reads a gettext file into entries keyed by `msgctxt\u0004msgid`. */
const parsePo = (text) => {
    const entries = new Map()
    let entry = {}
    let field = null
    const unquote = (value) => JSON.parse(value)
    const flush = () => {
        if (entry.msgid !== undefined && entry.msgid !== '') {
            const key = `${entry.msgctxt ?? ''}\u0004${entry.msgid}`
            entries.set(key, entry)
        }
        entry = {}
        field = null
    }
    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim()
        if (!line) {
            flush()
            continue
        }
        if (line.startsWith('#')) continue
        const match = line.match(/^(msgctxt|msgid_plural|msgid|msgstr(?:\[\d+\])?)\s+(".*")$/)
        if (match) {
            // A new entry without a blank line before it.
            if (match[1] === 'msgid' && entry.msgid !== undefined) flush()
            field = match[1]
            entry[field] = unquote(match[2])
        } else if (field && line.startsWith('"')) {
            entry[field] += unquote(line)
        }
    }
    flush()
    return entries
}

const translations = (entry) =>
    Object.keys(entry)
        .filter((key) => key.startsWith('msgstr'))
        .map((key) => entry[key])

const read = (file) => readFileSync(file, 'utf8')
let failed = false

// 1. en.pot is up to date.
const before = read(POT)
execFileSync('npx', ['d2-app-scripts', 'i18n', 'extract'], { stdio: 'ignore' })
const after = read(POT)
const withoutDates = (text) => text.replace(/^"(POT-Creation|PO-Revision)-Date:.*$/gm, '')
if (withoutDates(before) !== withoutDates(after)) {
    console.error(
        `✖ ${POT} is out of date: run \`yarn i18n:extract\` and commit it (and the .po updates).`
    )
    failed = true
} else {
    console.log(`✔ ${POT} is up to date`)
}

// 2. Coverage of every language.
const source = parsePo(after)
for (const file of readdirSync(I18N_DIR).filter((name) => name.endsWith('.po')).sort()) {
    const language = path.basename(file, '.po')
    const target = parsePo(read(path.join(I18N_DIR, file)))
    const missing = [...source.keys()].filter((key) => {
        const entry = target.get(key)
        return !entry || translations(entry).some((value) => !value)
    })
    const done = source.size - missing.length
    const summary = `${language}: ${done}/${source.size} translated`
    if (!missing.length) {
        console.log(`✔ ${summary}`)
    } else if (COMPLETE.includes(language)) {
        console.error(`✖ ${summary}. Missing:`)
        missing.slice(0, 50).forEach((key) => console.error(`   - ${key.split('\u0004')[1]}`))
        failed = true
    } else {
        console.log(`• ${summary} (draft)`)
    }
}

process.exit(failed ? 1 : 0)
