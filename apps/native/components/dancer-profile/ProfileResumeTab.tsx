import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { SectionCard } from '~/components/ui/section-card';
import { ProjectCarousel } from './ProjectCarousel';
import { type DancerProfileData } from '@packages/backend/convex/dancers';
import { Separator } from '../ui/separator';
import { Text } from '../ui/text';

interface ProfileResumeTabProps {
  profileData: DancerProfileData;
}

export function ProfileResumeTab({ profileData }: ProfileResumeTabProps) {
  const { dancer, allProjects, highlights } = profileData;

  // Count projects by type
  const tvFilmCount = allProjects.filter((p) => p.type === 'tv-film').length;
  const musicVideoCount = allProjects.filter((p) => p.type === 'music-video').length;
  const livePerformanceCount = allProjects.filter((p) => p.type === 'live-performance').length;
  const commercialCount = allProjects.filter((p) => p.type === 'commercial').length;

  // Count skills
  const skillsCount = dancer.skills?.length || 0;

  // Count training
  const trainingCount = dancer.training?.length || 0;

  const handleCategoryPress = (category: string) => {
    // Route to dedicated pages for training and skills
    if (category === 'training') {
      router.push({
        pathname: '/app/dancers/[id]/training',
        params: { id: dancer._id },
      });
      return;
    }

    if (category === 'skills') {
      router.push({
        pathname: '/app/dancers/[id]/skills',
        params: { id: dancer._id },
      });
      return;
    }

    // Navigate to projects screen with category filter for project types
    router.push({
      pathname: '/app/dancers/[id]/projects',
      params: { id: dancer._id, category },
    });
  };

  return (
    <View className="gap-8">
      {highlights && highlights.length > 0 && (
        <>
          <Separator className="-mx-4 w-[110%] bg-border-tint" />
          <Text variant="header5" className="px-4 text-text-low">
            Highlights
          </Text>
          <ProjectCarousel
            projects={highlights
              .map(h => h.project ? {
                ...h.project,
                imageUrl: h.imageUrl
              } : null)
              .filter((p): p is NonNullable<typeof p> => p !== null)}
            dancerId={dancer._id}
          />
        </>
      )}

      <Separator className="-mx-4 w-[110%] bg-border-tint" />
      <Text variant="header5" className="px-4 text-text-low">
        Experience
      </Text>
      {/* Grid cards */}
      <View className="gap-4 px-4">
        {/* Row 1: TV/Film & Music Videos */}
        <View className="flex-row gap-4">
          <SectionCard
            title="Television/Film"
            count={tvFilmCount}
            backgroundImage={require('~/assets/images/projects/Television_Film.png')}
            onPress={() => handleCategoryPress('tv-film')}
          />
          <SectionCard
            title="Music Videos"
            count={musicVideoCount}
            backgroundImage={require('~/assets/images/projects/MusicVideos.png')}
            onPress={() => handleCategoryPress('music-video')}
          />
        </View>

        {/* Row 2: Live/Stage & Print/Commercial */}
        <View className="flex-row gap-4">
          <SectionCard
            title="Live/Stage Performances"
            count={livePerformanceCount}
            backgroundImage={require('~/assets/images/projects/Live_StagePerformances.png')}
            onPress={() => handleCategoryPress('live-performance')}
          />
          <SectionCard
            title="Print/Commercial"
            count={commercialCount}
            backgroundImage={require('~/assets/images/projects/Print_Commercial.png')}
            onPress={() => handleCategoryPress('commercial')}
          />
        </View>

        {/* Row 3: Training & Special Skills */}
        <View className="flex-row gap-4">
          <SectionCard
            title="Training"
            count={trainingCount}
            backgroundImage={require('~/assets/images/training/Training.png')}
            onPress={() => handleCategoryPress('training')}
          />
          <SectionCard
            title="Special Skills"
            count={skillsCount}
            backgroundImage={require('~/assets/images/skills/Skills.png')}
            onPress={() => handleCategoryPress('skills')}
          />
        </View>
      </View>
    </View>
  );
}
