import { zim } from '../util'

function parseDateToTimestamp(value: any): number | undefined {
  if (value == null) return undefined
  if (typeof value === 'number') return value
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'string') {
    const m = value.match(/^\d{4}-\d{2}-\d{2}$/)
    if (m) {
      const [y, mo, d] = value.split('-').map(Number)
      const dt = new Date(y, (mo || 1) - 1, d || 1)
      const ts = dt.getTime()
      return isNaN(ts) ? undefined : ts
    }
    const dt = new Date(value)
    const ts = dt.getTime()
    return isNaN(ts) ? undefined : ts
  }
  return undefined
}

export const migrateDates = zim({
  args: {},
  handler: async (ctx) => {
    const result = {
      projects: { scanned: 0, patched: 0 },
      events: { scanned: 0, patched: 0 }
    }

    // Migrate projects.startDate/endDate
    const projects = await ctx.db.query('projects').collect()
    for (const p of projects) {
      result.projects.scanned++
      const patch: any = {}
      const sd = parseDateToTimestamp((p as any).startDate)
      const ed = parseDateToTimestamp((p as any).endDate)
      if (sd !== undefined && typeof (p as any).startDate !== 'number')
        patch.startDate = sd
      if (ed !== undefined && typeof (p as any).endDate !== 'number')
        patch.endDate = ed
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(p._id, patch)
        result.projects.patched++
      }
    }

    // NOTE: Events currently remain string-based for date fields.
    // When we are ready to migrate events, adjust schema to z.date() and re-enable the logic below.

    return result
  }
})

// Public action wrapper lives in admin/runMigrations.ts to avoid type cycles
