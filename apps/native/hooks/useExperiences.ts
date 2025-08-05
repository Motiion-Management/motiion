import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import {
  ExperienceFormState,
  TvFilmExperience,
  MusicVideoExperience,
  LivePerformanceExperience,
  CommercialExperience,
} from '~/types/experiences';

const MAX_EXPERIENCES = 3;

export function useExperiences() {
  const [experiences, setExperiences] = useState<(ExperienceFormState | null)[]>([]);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Convex mutations for different experience types
  const addTvFilm = useMutation(api.experiences.tvfilm.addMyExperience);
  const addMusicVideo = useMutation(api.experiences.musicvideos.addMyExperience);
  const addLivePerformance = useMutation(api.experiences.liveperformances.addMyExperience);
  const addCommercial = useMutation(api.experiences.commercials.addMyExperience);

  const handleExperiencePress = useCallback((index: number) => {
    setCurrentEditingIndex(index);
    setIsSheetOpen(true);
  }, []);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setCurrentEditingIndex(null);
    }
  }, []);

  const handleSaveExperience = useCallback(
    (experience: ExperienceFormState) => {
      setExperiences((prev) => {
        const newExperiences = [...prev];

        if (currentEditingIndex !== null) {
          // Update existing experience
          newExperiences[currentEditingIndex] = experience;
        } else {
          // Add new experience (find first empty slot)
          const emptyIndex = newExperiences.findIndex((exp) => exp === null);
          if (emptyIndex !== -1) {
            newExperiences[emptyIndex] = experience;
          } else if (newExperiences.length < MAX_EXPERIENCES) {
            newExperiences.push(experience);
          }
        }

        return newExperiences;
      });
    },
    [currentEditingIndex]
  );

  const handleDeleteExperience = useCallback(() => {
    if (currentEditingIndex !== null) {
      setExperiences((prev) => {
        const newExperiences = [...prev];
        newExperiences[currentEditingIndex] = null;
        return newExperiences;
      });
      setIsSheetOpen(false);
    }
  }, [currentEditingIndex]);

  const saveToBackend = useCallback(async () => {
    const validExperiences = experiences.filter((exp) => exp && exp.isComplete);

    for (const exp of validExperiences) {
      if (!exp) continue;

      try {
        const baseData = {
          private: false,
          roles: exp.data.roles || [],
          link: exp.data.link,
          media: exp.data.media,
          mainTalent: exp.data.mainTalent,
          choreographers: exp.data.choreographers,
          associateChoreographers: exp.data.associateChoreographers,
        };

        switch (exp.type) {
          case 'tv-film':
            const tvFilmData = exp.data as TvFilmExperience;
            await addTvFilm({
              ...baseData,
              projectType: tvFilmData.projectType,
              title: tvFilmData.title,
              studio: tvFilmData.studio,
              startDate: tvFilmData.startDate,
              duration: tvFilmData.duration,
            });
            break;

          case 'music-video':
            const musicVideoData = exp.data as MusicVideoExperience;
            await addMusicVideo({
              ...baseData,
              songTitle: musicVideoData.songTitle,
              artists: musicVideoData.artists,
              startDate: musicVideoData.startDate,
              duration: musicVideoData.duration,
            });
            break;

          case 'live-performance':
            const liveData = exp.data as LivePerformanceExperience;
            await addLivePerformance({
              ...baseData,
              eventType: liveData.eventType,
              startDate: liveData.startDate,
              duration: liveData.duration,
              festivalTitle: liveData.festivalTitle,
              tourName: liveData.tourName,
              tourArtist: liveData.tourArtist,
              companyName: liveData.companyName,
              eventName: liveData.eventName,
              awardShowName: liveData.awardShowName,
              productionTitle: liveData.productionTitle,
              venue: liveData.venue,
            });
            break;

          case 'commercial':
            const commercialData = exp.data as CommercialExperience;
            await addCommercial({
              ...baseData,
              companyName: commercialData.companyName,
              campaignTitle: commercialData.campaignTitle,
              productionCompany: commercialData.productionCompany,
              startDate: commercialData.startDate,
              duration: commercialData.duration,
            });
            break;
        }
      } catch (error) {
        console.error('Error saving experience:', error);
        throw error;
      }
    }
  }, [experiences, addTvFilm, addMusicVideo, addLivePerformance, addCommercial]);

  const getCurrentExperience = useCallback((): ExperienceFormState | null => {
    if (currentEditingIndex === null) return null;
    return experiences[currentEditingIndex] || null;
  }, [currentEditingIndex, experiences]);

  const canProgress = useCallback(() => {
    // At least one complete experience or user can skip
    return experiences.some((exp) => exp?.isComplete) || experiences.length === 0;
  }, [experiences]);

  return {
    experiences,
    currentEditingIndex,
    isSheetOpen,
    handleExperiencePress,
    handleSheetOpenChange,
    handleSaveExperience,
    handleDeleteExperience,
    saveToBackend,
    getCurrentExperience,
    canProgress,
    isNewExperience: currentEditingIndex !== null && !experiences[currentEditingIndex],
  };
}
