import { authQuery } from '../util'
import { v } from 'convex/values'
import { query } from '../_generated/server'

// Type for unified experience with type field
type UnifiedExperience = any

// Helper to format experiences into unified format
function decorate(exp: any): UnifiedExperience {
  let displayTitle = ''
  let displaySubtitle = ''
  switch (exp.type) {
    case 'tv-film':
      displayTitle = exp.title || 'Untitled Project'
      displaySubtitle = exp.studio || ''
      break
    case 'music-video':
      displayTitle = exp.songTitle || 'Untitled Song'
      displaySubtitle = Array.isArray(exp.artists) ? exp.artists.join(', ') : ''
      break
    case 'live-performance':
      switch (exp.subtype) {
        case 'festival':
          displayTitle = exp.festivalTitle || 'Festival'
          displaySubtitle = 'Festival'
          break
        case 'tour':
          displayTitle = exp.tourName || 'Tour'
          displaySubtitle = exp.tourArtist || 'Tour'
          break
        case 'concert':
          displayTitle = exp.venue || 'Concert'
          displaySubtitle = 'Concert'
          break
        case 'corporate':
          displayTitle = exp.eventName || 'Event'
          displaySubtitle = exp.companyName || 'Corporate'
          break
        case 'award-show':
          displayTitle = exp.awardShowName || 'Award Show'
          displaySubtitle = 'Award Show'
          break
        case 'theater':
          displayTitle = exp.productionTitle || 'Theater Production'
          displaySubtitle = exp.venue || 'Theater'
          break
        default:
          displayTitle = exp.eventName || 'Performance'
          displaySubtitle = 'Other'
      }
      break
    case 'commercial':
      displayTitle = exp.campaignTitle || 'Commercial'
      displaySubtitle = exp.companyName || ''
      break
  }
  return {
    ...exp,
    displayTitle,
    displaySubtitle,
    displayDate: exp.startDate
  }
}

// Get all experiences for current user
export const getMyAllExperiences = authQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const res = await ctx.db
      .query('experiences')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .collect()
    return res
      .map(decorate)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        const dateA = new Date(a.startDate).getTime()
        const dateB = new Date(b.startDate).getTime()
        return dateB - dateA
      })
  }
})

// Get all public experiences for a specific user
export const getUserPublicAllExperiences = query({
  args: { userId: v.id('users') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const res = await ctx.db
      .query('experiences')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()
    const experiences = res.filter((e) => !e?.private).map(decorate)
    return experiences.sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0
      const dateA = new Date(a.startDate).getTime()
      const dateB = new Date(b.startDate).getTime()
      return dateB - dateA
    })
  }
})

// Get experience counts by type for current user
export const getMyExperienceCounts = authQuery({
  args: {},
  returns: v.object({
    tvFilm: v.number(),
    musicVideos: v.number(),
    livePerformances: v.number(),
    commercials: v.number(),
    total: v.number()
  }),
  handler: async (ctx) => {
    const res = await ctx.db
      .query('experiences')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .collect()
    const byType = res.reduce(
      (acc, e) => {
        switch (e.type) {
          case 'tv-film':
            acc.tvFilm++
            break
          case 'music-video':
            acc.musicVideos++
            break
          case 'live-performance':
            acc.livePerformances++
            break
          case 'commercial':
            acc.commercials++
            break
        }
        return acc
      },
      { tvFilm: 0, musicVideos: 0, livePerformances: 0, commercials: 0 }
    )
    return { ...byType, total: res.length }
  }
})
