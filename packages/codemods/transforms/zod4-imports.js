// Transform: zod4-imports
// Rewrites imports from 'convex-helpers/server/zod' to 'convex-helpers/server/zodV4'

const path = require('path')

const TARGET = 'convex-helpers/server/zod'
const REPLACEMENT = 'convex-helpers/server/zodV4'
const RX = /(['"])convex-helpers\/server\/zod\1/g

function shouldProcess(filePath) {
  const ext = path.extname(filePath)
  return ['.ts', '.tsx', '.js', '.jsx'].includes(ext)
}

function transform(_filePath, source) {
  if (!shouldProcess(_filePath)) return null
  if (!source.includes(TARGET)) return null

  // Only replace on lines that are likely import contexts to avoid noisy changes
  const lines = source.split(/\r?\n/)
  let mutated = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.includes(TARGET)) continue
    if (!/(?:\bimport\b|\brequire\b|\bfrom\b)/.test(line)) continue
    const replaced = line.replace(RX, (_m, q) => `${q}${REPLACEMENT}${q}`)
    if (replaced !== line) {
      lines[i] = replaced
      mutated = true
    }
  }
  return mutated ? lines.join('\n') : null
}

module.exports = transform
module.exports.default = transform
module.exports.transform = transform
