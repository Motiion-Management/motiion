import React from 'react';
import { ScrollView, View, ImageBackground, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { getProjectDisplayTitle } from '~/config/projectTypes';

interface ProjectCarouselProps {
  projects: Array<any>;
  dancerId?: string;
}

export function ProjectCarousel({ projects, dancerId }: ProjectCarouselProps) {
  if (projects.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
      {projects.map((project, index) => (
        <ProjectCard key={project._id || index} project={project} dancerId={dancerId} />
      ))}
    </ScrollView>
  );
}

function ProjectCard({ project, dancerId }: { project: any; dancerId?: string }) {
  const title = getProjectDisplayTitle(project);
  const subtitle = getProjectSubtitle(project);
  const label = getProjectLabel(project.type);

  // Get image URL from project (passed from highlights)
  const imageUrl = project.imageUrl || null;

  const handlePress = () => {
    if (dancerId && project._id) {
      router.push(`/app/dancers/${dancerId}/projects/${project._id}`);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <View
        style={{
          width: 177,
          height: 234,
          borderRadius: 8,
          overflow: 'hidden',
        }}
        className="bg-surface-high shadow-md">
        {imageUrl ? (
          <ImageBackground source={{ uri: imageUrl }} style={{ flex: 1 }} resizeMode="cover">
            <ProjectCardOverlay label={label} title={title} subtitle={subtitle} />
          </ImageBackground>
        ) : (
          <View className="flex-1 bg-gradient-to-br from-accent/20 to-surface-high">
            <ProjectCardOverlay label={label} title={title} subtitle={subtitle} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ProjectCardOverlay({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="flex-1 justify-end">
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: '600',
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: 1,
            marginBottom: 4,
          }}>
          {label}
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: 'white',
            marginBottom: 4,
          }}
          numberOfLines={2}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.8)',
            }}
            numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </LinearGradient>
    </View>
  );
}

function getProjectLabel(type: string): string {
  switch (type) {
    case 'tv-film':
      return 'TV/FILM';
    case 'music-video':
      return 'MUSIC VIDEO';
    case 'live-performance':
      return 'LIVE PERFORMANCE';
    case 'commercial':
      return 'COMMERCIAL';
    default:
      return 'PROJECT';
  }
}

function getProjectSubtitle(project: any): string | undefined {
  if (project.type === 'tv-film') return project.studio;
  if (project.type === 'music-video') return project.artists?.join(', ');
  if (project.type === 'live-performance') return project.tourArtist || project.venue;
  if (project.type === 'commercial') return project.companyName;
  return undefined;
}
