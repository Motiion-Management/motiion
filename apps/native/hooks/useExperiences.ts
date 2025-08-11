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

  // User-scoped experiences action (server injects userId from session)
  // Note: Convex codegen exposes this module as "users/experiences".
  // Some environments may not have the key typed; narrow with bracket access.
  // Use typed path from Convex codegen (nested module)
  const addExperience = useMutation(api.users.experiences.addMyExperience);

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
          directors: (exp.data as any).directors,
        } as Record<string, any>;

        // Normalize payload into unified table shape
        const payload: Record<string, any> = {
          ...baseData,
          type: exp.type,
        };

        if (exp.type === 'tv-film') {
          const tv = exp.data as TvFilmExperience;
          payload.title = tv.title;
          payload.studio = tv.studio;
          if (tv.startDate) payload.startDate = tv.startDate;
          if (tv.duration) payload.duration = tv.duration;
        } else if (exp.type === 'music-video') {
          const mv = exp.data as MusicVideoExperience;
          payload.songTitle = mv.songTitle;
          payload.artists = mv.artists;
          if (mv.startDate) payload.startDate = mv.startDate;
          if (mv.duration) payload.duration = mv.duration;
        } else if (exp.type === 'live-performance') {
          const live = exp.data as LivePerformanceExperience;
          payload.subtype = (live as any).subtype || (live as any).eventType; // tolerate older field name
          if (live.startDate) payload.startDate = live.startDate;
          if (live.duration) payload.duration = live.duration;
          payload.festivalTitle = live.festivalTitle;
          payload.tourName = live.tourName;
          payload.tourArtist = live.tourArtist;
          payload.companyName = live.companyName;
          payload.eventName = live.eventName;
          payload.awardShowName = live.awardShowName;
          payload.productionTitle = live.productionTitle;
          payload.venue = live.venue;
        } else if (exp.type === 'commercial') {
          const c = exp.data as CommercialExperience;
          payload.companyName = c.companyName;
          payload.campaignTitle = c.campaignTitle;
          payload.productionCompany = c.productionCompany;
          if (c.startDate) payload.startDate = c.startDate;
          if (c.duration) payload.duration = c.duration;
        }

        await addExperience(payload as any);
      } catch (error) {
        console.error('Error saving experience:', error);
        throw error;
      }
    }
  }, [experiences, addExperience]);

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
