#!/usr/bin/env node
/*
  Simple codemod runner for convex-helpers migrations.
  Usage:
    convex-helpers-codemods <transform> [paths...] [--dry] [--verbose] [--extensions ts,tsx,js,jsx]
*/

const fs = require('fs')
const path = require('path')

const DEFAULT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']
const DEFAULT_IGNORES = [
  'node_modules',
  '.git',
  '.next',
  'out',
  'dist',
  'build',
  '.turbo',
  'coverage',
  'ios',
  'android'
]

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--') continue // ignore arg separator inserted by package managers
    if (a === '--dry') args.dry = true
    else if (a === '--verbose') args.verbose = true
    else if (a === '--extensions') {
      const next = argv[++i]
      if (!next) throw new Error('--extensions requires a value')
      args.extensions = next
        .split(',')
        .map((s) => (s.startsWith('.') ? s : '.' + s))
    } else if (a === '--ignore') {
      const next = argv[++i]
      if (!next) throw new Error('--ignore requires a value')
      args.ignore = next.split(',')
    } else {
      args._.push(a)
    }
  }
  if (args._.length === 0) {
    printHelp()
    process.exit(1)
  }
  args.transform = args._[0]
  args.targets = args._.slice(1)
  if (args.targets.length === 0) args.targets = ['.']
  args.extensions = args.extensions || DEFAULT_EXTENSIONS
  args.ignore = args.ignore || DEFAULT_IGNORES
  return args
}

function printHelp() {
  const transformsDir = path.resolve(__dirname, '..', 'transforms')
  const available = fs.existsSync(transformsDir)
    ? fs
        .readdirSync(transformsDir)
        .filter((f) => f.endsWith('.js'))
        .map((f) => path.basename(f, '.js'))
    : []
  console.log(`Usage: convex-helpers-codemods <transform> [paths...] [--dry] [--verbose] [--extensions ts,tsx,js,jsx]

Transforms:
  ${available.length ? available.join('\n  ') : '(none found)'}
`)
}

function listFiles(target, { extensions, ignore }) {
  const results = []
  const stat = fs.statSync(target)
  if (stat.isFile()) {
    if (extensions.includes(path.extname(target))) results.push(target)
    return results
  }
  // directory
  const base = path.basename(target)
  if (ignore.includes(base)) return results
  for (const entry of fs.readdirSync(target)) {
    const full = path.join(target, entry)
    const relParts = full.split(path.sep)
    if (relParts.some((p) => ignore.includes(p))) continue
    const st = fs.statSync(full)
    if (st.isDirectory()) {
      // skip convex/_generated specifically
      if (entry === '_generated' && relParts.some((p) => p === 'convex'))
        continue
      results.push(...listFiles(full, { extensions, ignore }))
    } else if (st.isFile()) {
      if (extensions.includes(path.extname(full))) results.push(full)
    }
  }
  return results
}

function loadTransform(name) {
  const here = path.resolve(__dirname, '..')
  const asFile = path.join(here, 'transforms', `${name}.js`)
  if (fs.existsSync(asFile)) return require(asFile)
  console.error(`Transform not found: ${name}`)
  printHelp()
  process.exit(1)
}

function run() {
  const args = parseArgs(process.argv)
  const transformModule = loadTransform(args.transform)
  const transform =
    transformModule &&
    (transformModule.default || transformModule.transform || transformModule)
  if (typeof transform !== 'function') {
    console.error('Transform must export a function as default or `transform`.')
    process.exit(1)
  }

  const allFiles = args.targets.flatMap((t) =>
    listFiles(path.resolve(process.cwd(), t), args)
  )
  if (args.verbose) console.log(`Found ${allFiles.length} file(s) to check.`)

  let changed = 0
  let scanned = 0
  for (const file of allFiles) {
    scanned++
    const src = fs.readFileSync(file, 'utf8')
    const out = transform(file, src)
    if (typeof out === 'string' && out !== src) {
      changed++
      if (args.dry) {
        if (args.verbose)
          console.log(
            `[dry] Would update: ${path.relative(process.cwd(), file)}`
          )
      } else {
        fs.writeFileSync(file, out, 'utf8')
        if (args.verbose)
          console.log(`Updated: ${path.relative(process.cwd(), file)}`)
      }
    }
  }

  console.log(
    `Scanned ${scanned} file(s). ${args.dry ? 'Would update' : 'Updated'} ${changed} file(s).`
  )
}

run()
