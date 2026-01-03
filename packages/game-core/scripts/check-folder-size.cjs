#!/usr/bin/env node
/**
 * check-folder-size.cjs
 *
 * CommonJS variant for projects using "type": "module" in package.json.
 */
const fs = require('fs')
const path = require('path')

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { root: 'src', limit: 10, verbose: false }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--root' && args[i + 1]) {
      opts.root = args[++i]
    } else if (a === '--limit' && args[i + 1]) {
      opts.limit = Number(args[++i])
    } else if (a === '--verbose') {
      opts.verbose = true
    } else if (a === '--help' || a === '-h') {
      console.log('Usage: node check-folder-size.cjs --root <dir> --limit <N> [--verbose]')
      process.exit(0)
    }
  }
  return opts
}

function isHidden(name) {
  return name === '.DS_Store' || name.startsWith('.')
}

function checkDir(dir, limit, root) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !isHidden(e.name))
  } catch (err) {
    console.error(`Failed to read dir ${dir}: ${err.message}`)
    return []
  }
  const count = entries.length
  const rel = path.relative(root, dir) || '.'
  const report = []
  if (count > limit) {
    report.push({ dir: rel, count, entries: entries.map((e) => e.name) })
  }
  for (const e of entries) {
    if (e.isDirectory()) report.push(...checkDir(path.join(dir, e.name), limit, root))
  }
  return report
}

function main() {
  const opts = parseArgs()
  const rootPath = path.resolve(process.cwd(), opts.root)
  if (!fs.existsSync(rootPath) || !fs.statSync(rootPath).isDirectory()) {
    console.error(`Root folder not found or not a directory: ${rootPath}`)
    process.exit(2)
  }
  const reports = checkDir(rootPath, opts.limit, rootPath)
  if (reports.length === 0) {
    console.log(`OK: no folder under '${opts.root}' has more than ${opts.limit} direct children.`)
    process.exit(0)
  }
  console.log(`Found ${reports.length} folder(s) exceeding limit ${opts.limit}:`)
  for (const r of reports) {
    console.log(`- ${r.dir} -> ${r.count} items`)
    if (opts.verbose) for (const n of r.entries) console.log(`   - ${n}`)
  }
  process.exit(1)
}

if (require.main === module) main()
