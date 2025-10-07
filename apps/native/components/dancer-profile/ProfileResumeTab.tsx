import React from 'react'
import { ScrollView, View } from 'react-native'
import { ProfileCategoryCard } from './ProfileCategoryCard'
import { type Doc } from '@packages/backend/convex/_generated/dataModel'

interface ProfileResumeTabProps {
  dancer: Doc<'dancers'>
  allProjects: Array<any>
  training: Array<any>
}

export function ProfileResumeTab({ dancer, allProjects, training }: ProfileResumeTabProps) {
  // Count projects by type
  const tvFilmCount = allProjects.filter((p) => p.type === 'tv-film').length
  const musicVideoCount = allProjects.filter((p) => p.type === 'music-video').length
  const livePerformanceCount = allProjects.filter((p) => p.type === 'live-performance').length
  const commercialCount = allProjects.filter((p) => p.type === 'commercial').length

  // Count skills
  const skillsCount = dancer.skills?.length || 0

  // Count training
  const trainingCount = training.length

  const handleCategoryPress = (category: string) => {
    // TODO: Navigate to category detail view (bottomsheet)
    // Reference design: https://www.figma.com/design/XsSFnEl8pmOL7KMKq2ofx3/Mobile-App?node-id=3136-17408&m=dev
    console.log(`Category pressed: ${category}`)
  }

  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      <View className="gap-3 pb-4">
        {/* TV/Film */}
        <ProfileCategoryCard
          title="Television & Film"
          count={tvFilmCount}
          onPress={() => handleCategoryPress('tv-film')}
        />

        {/* Music Videos */}
        <ProfileCategoryCard
          title="Music Videos"
          count={musicVideoCount}
          onPress={() => handleCategoryPress('music-video')}
        />

        {/* Live/Stage Performances */}
        <ProfileCategoryCard
          title="Live/Stage Performances"
          count={livePerformanceCount}
          onPress={() => handleCategoryPress('live-performance')}
        />

        {/* Print/Commercial */}
        <ProfileCategoryCard
          title="Print/Commercial"
          count={commercialCount}
          onPress={() => handleCategoryPress('commercial')}
        />

        {/* Training */}
        <ProfileCategoryCard
          title="Training"
          count={trainingCount}
          onPress={() => handleCategoryPress('training')}
        />

        {/* Special Skills */}
        <ProfileCategoryCard
          title="Special Skills"
          count={skillsCount}
          onPress={() => handleCategoryPress('skills')}
        />
      </View>
    </ScrollView>
  )
}
