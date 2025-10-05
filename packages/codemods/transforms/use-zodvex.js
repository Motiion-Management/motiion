// Transform: use-zodvex
// Move zodToConvex / zodToConvexFields imports from
// 'convex-helpers/server/zodV4' to '@packages/zodvex'.
// - Keeps other specifiers like `zid` importing from zodV4.
// - If only zodToConvex(*) were imported, rewrites the module path entirely.

const IMPORT_RX =
  /import\s+([^;]+?)\s+from\s+(["'])convex-helpers\/server\/zodV4\2/g

function splitSpecifiers(spec) {
  // Handles: { a, b as c } | a, { b } | * as ns | Default
  const out = { named: [], rest: spec.trim() }
  const m = spec.match(/\{([\s\S]*?)\}/)
  if (!m) return out
  const inside = m[1]
  const named = inside
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  out.named = named
  return out
}

function classify(specs) {
  const move = []
  const keep = []
  for (const s of specs) {
    const base = s.split(/\s+as\s+/i)[0].trim()
    if (base === 'zodToConvex' || base === 'zodToConvexFields') move.push(s)
    else keep.push(s)
  }
  return { move, keep }
}

module.exports = function transform(_file, source) {
  if (!source.includes('convex-helpers/server/zodV4')) return null

  let mutated = false
  const updates = []
  let match
  while ((match = IMPORT_RX.exec(source)) !== null) {
    const full = match[0]
    const spec = match[1]
    const { named } = splitSpecifiers(spec)
    if (named.length === 0) continue

    const { move, keep } = classify(named)
    if (move.length === 0) continue

    mutated = true
    // Build replacement strings
    let replacement = ''
    if (keep.length > 0) {
      // Keep the original import but only with remaining specifiers
      replacement += `import { ${keep.join(', ')} } from 'convex-helpers/server/zodV4'\n`
    }
    // Add new import from zodvex for moved specifiers
    replacement += `import { ${move.join(', ')} } from '@packages/zodvex'`

    updates.push({ full, replacement })
  }

  if (!mutated) return null
  let out = source
  for (const u of updates) {
    out = out.replace(u.full, u.replacement)
  }
  return out
}
