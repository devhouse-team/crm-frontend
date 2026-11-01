import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const APP_DIR = join(ROOT, 'app')
const reportOnly = process.argv.includes('--report')

const RULES = [
  {
    id: 'emoji-or-arrow',
    label: 'Emoji / pictographs / decorative arrows (→ ↗)',
    regex: /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}\u2600-\u27BF\u2B00-\u2BFF\u2192\u2197]/gu
  },
  {
    id: 'arbitrary-px-text',
    label: 'Arbitrary pixel text sizes (text-[Npx])',
    regex: /\btext-\[\d+px\]/g
  },
  {
    id: 'hardcoded-palette',
    label: 'Hardcoded Tailwind palette classes',
    regex: /\b(?:text|bg|border|ring|from|to|via|divide)-(?:emerald|indigo|violet|purple|sky|amber|rose|red|green|blue|teal|cyan|fuchsia|pink|orange|yellow|lime)-\d{2,3}(?:\/\d+)?\b/g
  },
  {
    id: 'spec-reference',
    label: 'Spec references in product UI (ТЗ §)',
    regex: /ТЗ\s*§\s*[0-9А-Яа-я]*/g
  }
]

function stripCommentsPreserveLines(content) {
  return content
    .replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '))
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/(^|\s)\/\/.*$/gm, m => ' '.repeat(m.length))
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      walk(full, acc)
    } else if (/\.(vue|ts|js|css)$/.test(entry)) {
      acc.push(full)
    }
  }
  return acc
}

const files = walk(APP_DIR)
const totalsByRule = Object.fromEntries(RULES.map(r => [r.id, 0]))
const findings = []

for (const file of files) {
  const rel = relative(ROOT, file)
  const cleaned = stripCommentsPreserveLines(readFileSync(file, 'utf8'))
  const lines = cleaned.split('\n')
  lines.forEach((line, idx) => {
    for (const rule of RULES) {
      const matches = [...line.matchAll(rule.regex)]
      if (matches.length > 0) {
        totalsByRule[rule.id] += matches.length
        findings.push({
          file: rel,
          line: idx + 1,
          rule: rule.id,
          samples: matches.map(m => m[0]).join(', ')
        })
      }
    }
  })
}

const grandTotal = Object.values(totalsByRule).reduce((a, b) => a + b, 0)

console.log('UI Slop Audit (app/)')
console.log('────────────────────────────────────────────────────────')
for (const rule of RULES) {
  const count = totalsByRule[rule.id]
  console.log(`  ${String(count).padStart(4, ' ')}  ${rule.label}`)
}
console.log('────────────────────────────────────────────────────────')
console.log(`  ${String(grandTotal).padStart(4, ' ')}  Total hits`)

if (findings.length > 0 && process.argv.includes('--verbose')) {
  console.log('\nDetails:')
  for (const f of findings.slice(0, 80)) {
    console.log(`  ${f.file}:${f.line} [${f.rule}] ${f.samples}`)
  }
  if (findings.length > 80) {
    console.log(`  ... and ${findings.length - 80} more lines`)
  }
}

if (grandTotal > 0 && !reportOnly) {
  process.exit(1)
}
