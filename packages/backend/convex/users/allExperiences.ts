import { authQuery, notEmpty } from '../util'
import { v } from 'convex/values'
import { getAll } from 'convex-helpers/server/relationships'
import { query } from '../_generated/server'
import { Doc } from '../_generated/dataModel'

// Type for unified experience with type field
type UnifiedExperience = {
  _id: string
  _creationTime: number
  type: 'tv-film' | 'music-video' | 'live-performance' | 'commercial'
  userId: string
  private?: boolean
  startDate?: string
  link?: string
  media?: string
  roles: string[]
  // Display fields
  displayTitle: string
  displaySubtitle?: string
  displayDate: string
  // Raw data
  data: any
}

// Helper to format experiences into unified format
const formatTvFilmExperience = (exp: Doc<'experiencesTvFilm'>): UnifiedExperience => ({
  _id: exp._id,
  _creationTime: exp._creationTime,
  type: 'tv-film',
  userId: exp.userId,
  private: exp.private,
  startDate: exp.startDate,
  link: exp.link,
  media: exp.media,
  roles: exp.roles,
  displayTitle: exp.title,
  displaySubtitle: exp.studio,
  displayDate: exp.startDate,
  data: exp
})

const formatMusicVideoExperience = (exp: Doc<'experiencesMusicVideos'>): UnifiedExperience => ({
  _id: exp._id,
  _creationTime: exp._creationTime,
  type: 'music-video',
  userId: exp.userId,
  private: exp.private,
  startDate: exp.startDate,
  link: exp.link,
  media: exp.media,
  roles: exp.roles,
  displayTitle: exp.songTitle,
  displaySubtitle: exp.artists.join(', '),
  displayDate: exp.startDate,
  data: exp
})

const formatLivePerformanceExperience = (exp: Doc<'experiencesLivePerformances'>): UnifiedExperience => {
  let displayTitle = ''
  let displaySubtitle = ''
  
  switch (exp.eventType) {
    case 'festival':
      displayTitle = exp.festivalTitle || ''
      displaySubtitle = 'Festival'
      break
    case 'tour':
      displayTitle = exp.tourName || ''
      displaySubtitle = exp.tourArtist || 'Tour'
      break
    case 'concert':
      displayTitle = exp.venue || 'Concert'
      displaySubtitle = 'Concert'
      break
    case 'corporate':
      displayTitle = exp.eventName || ''
      displaySubtitle = exp.companyName || 'Corporate'
      break
    case 'award-show':
      displayTitle = exp.awardShowName || ''
      displaySubtitle = 'Award Show'
      break
    case 'theater':
      displayTitle = exp.productionTitle || ''
      displaySubtitle = exp.venue || 'Theater'
      break
    case 'other':
      displayTitle = exp.eventName || 'Performance'
      displaySubtitle = 'Other'
      break
  }
  
  return {
    _id: exp._id,
    _creationTime: exp._creationTime,
    type: 'live-performance',
    userId: exp.userId,
    private: exp.private,
    startDate: exp.startDate,
    link: exp.link,
    media: exp.media,
    roles: exp.roles,
    displayTitle,
    displaySubtitle,
    displayDate: exp.startDate,
    data: exp
  }
}

const formatCommercialExperience = (exp: Doc<'experiencesCommercials'>): UnifiedExperience => ({
  _id: exp._id,
  _creationTime: exp._creationTime,
  type: 'commercial',
  userId: exp.userId,
  private: exp.private,
  startDate: exp.startDate,
  link: exp.link,
  media: exp.media,
  roles: exp.roles,
  displayTitle: exp.campaignTitle,
  displaySubtitle: exp.companyName,
  displayDate: exp.startDate,
  data: exp
})

// Get all experiences for current user
export const getMyAllExperiences = authQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const experiences: UnifiedExperience[] = []
    
    // Fetch TV/Film experiences
    if (ctx.user?.resume?.experiencesTvFilm) {
      const tvFilmExps = await getAll(ctx.db, ctx.user.resume.experiencesTvFilm)
      experiences.push(...tvFilmExps.filter(notEmpty).map(formatTvFilmExperience))
    }
    
    // Fetch Music Video experiences
    if (ctx.user?.resume?.experiencesMusicVideos) {
      const musicVideoExps = await getAll(ctx.db, ctx.user.resume.experiencesMusicVideos)
      experiences.push(...musicVideoExps.filter(notEmpty).map(formatMusicVideoExperience))
    }
    
    // Fetch Live Performance experiences
    if (ctx.user?.resume?.experiencesLivePerformances) {
      const livePerformanceExps = await getAll(ctx.db, ctx.user.resume.experiencesLivePerformances)
      experiences.push(...livePerformanceExps.filter(notEmpty).map(formatLivePerformanceExperience))
    }
    
    // Fetch Commercial experiences
    if (ctx.user?.resume?.experiencesCommercials) {
      const commercialExps = await getAll(ctx.db, ctx.user.resume.experiencesCommercials)
      experiences.push(...commercialExps.filter(notEmpty).map(formatCommercialExperience))
    }
    
    // Sort by start date descending
    return experiences.sort((a, b) => {
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
    const user = await ctx.db.get(args.userId)
    if (!user) return []
    
    const experiences: UnifiedExperience[] = []
    
    // Fetch TV/Film experiences
    if (user?.resume?.experiencesTvFilm) {
      const tvFilmExps = await getAll(ctx.db, user.resume.experiencesTvFilm)
      experiences.push(
        ...tvFilmExps
          .filter(notEmpty)
          .filter(exp => !exp.private)
          .map(formatTvFilmExperience)
      )
    }
    
    // Fetch Music Video experiences
    if (user?.resume?.experiencesMusicVideos) {
      const musicVideoExps = await getAll(ctx.db, user.resume.experiencesMusicVideos)
      experiences.push(
        ...musicVideoExps
          .filter(notEmpty)
          .filter(exp => !exp.private)
          .map(formatMusicVideoExperience)
      )
    }
    
    // Fetch Live Performance experiences
    if (user?.resume?.experiencesLivePerformances) {
      const livePerformanceExps = await getAll(ctx.db, user.resume.experiencesLivePerformances)
      experiences.push(
        ...livePerformanceExps
          .filter(notEmpty)
          .filter(exp => !exp.private)
          .map(formatLivePerformanceExperience)
      )
    }
    
    // Fetch Commercial experiences
    if (user?.resume?.experiencesCommercials) {
      const commercialExps = await getAll(ctx.db, user.resume.experiencesCommercials)
      experiences.push(
        ...commercialExps
          .filter(notEmpty)
          .filter(exp => !exp.private)
          .map(formatCommercialExperience)
      )
    }
    
    // Sort by start date descending
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
    const counts = {
      tvFilm: ctx.user?.resume?.experiencesTvFilm?.length || 0,
      musicVideos: ctx.user?.resume?.experiencesMusicVideos?.length || 0,
      livePerformances: ctx.user?.resume?.experiencesLivePerformances?.length || 0,
      commercials: ctx.user?.resume?.experiencesCommercials?.length || 0,
      total: 0
    }
    
    counts.total = counts.tvFilm + counts.musicVideos + counts.livePerformances + counts.commercials
    
    return counts
  }
})