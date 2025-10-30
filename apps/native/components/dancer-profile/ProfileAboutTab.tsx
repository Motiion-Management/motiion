import React from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { Text } from '~/components/ui/text';
import { type DancerProfileData } from '@packages/backend/convex/dancers';
import { TypecastDetails } from './TypecastDetails';
import { buildSocialUrl } from '~/config/socialPlatforms';
import {
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
  WhatsAppIcon,
  TwitterIcon,
} from '~/components/socials/icons';
import { Chips } from '../ui/chips';
import { Separator } from '../ui/separator';

interface ProfileAboutTabProps {
  profileData: DancerProfileData;
}

function ChipsSection({ items, label }: { items?: string[]; label: string }) {
  if (!(items?.length && items.length > 0)) {
    return null;
  }
  return (
    <View className="gap-4">
      <Text variant="labelSm" className="uppercase text-text-low">
        {label}
      </Text>
      <Chips items={items} variant="filter" />
    </View>
  );
}

export function ProfileAboutTab({ profileData }: ProfileAboutTabProps) {
  const { dancer, agency } = profileData;
  const workLocations = dancer.workLocation || [];
  const genres = dancer.genres || [];
  const representation = dancer.representation;
  const sagAftraId = dancer.sagAftraId;

  const affiliations = [];
  if (representation?.agencyId && agency?.name) {
    affiliations.push(agency.name);
  }
  if (sagAftraId) {
    affiliations.push('SAG-AFTRA');
  }

  const openSocialLink = async (
    platform: 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'whatsapp',
    handle: string
  ) => {
    try {
      const url = buildSocialUrl(platform, handle);
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error('Failed to open social link:', error);
    }
  };

  return (
    <View className="flex-1 gap-8 px-4">
      <TypecastDetails dancer={dancer} />

      <Separator className="-mx-4 w-[110%] bg-border-tint" />

      <ChipsSection items={workLocations} label="Work Locations" />
      <ChipsSection items={genres} label="Genres" />
      <ChipsSection items={affiliations} label="Affiliations" />

      <Separator className="-mx-4 w-[110%] bg-border-tint" />

      {/* Socials Section */}
      {dancer.links?.socials &&
        Object.keys(dancer.links.socials).some(
          (key) => dancer.links?.socials?.[key as keyof typeof dancer.links.socials]
        ) ? (
        <View className="flex-row justify-center gap-4">
          {dancer.links?.socials?.instagram && (
            <TouchableOpacity
              onPress={() => openSocialLink('instagram', dancer.links?.socials?.instagram!)}
              className="h-12 w-12 items-center justify-center rounded-full bg-surface-tint">
              <InstagramIcon size={24} />
            </TouchableOpacity>
          )}
          {dancer.links?.socials?.youtube && (
            <TouchableOpacity
              onPress={() => openSocialLink('youtube', dancer.links?.socials?.youtube!)}
              className="h-12 w-12 items-center justify-center rounded-full bg-surface-tint">
              <YouTubeIcon size={24} />
            </TouchableOpacity>
          )}
          {dancer.links?.socials?.tiktok && (
            <TouchableOpacity
              onPress={() => openSocialLink('tiktok', dancer.links?.socials?.tiktok!)}
              className="h-12 w-12 items-center justify-center rounded-full bg-surface-tint">
              <TikTokIcon size={24} />
            </TouchableOpacity>
          )}
          {dancer.links?.socials?.whatsapp && (
            <TouchableOpacity
              onPress={() => openSocialLink('whatsapp', dancer.links?.socials?.whatsapp!)}
              className="h-12 w-12 items-center justify-center rounded-full bg-surface-tint">
              <WhatsAppIcon size={24} />
            </TouchableOpacity>
          )}
          {dancer.links?.socials?.twitter && (
            <TouchableOpacity
              onPress={() => openSocialLink('twitter', dancer.links?.socials?.twitter!)}
              className="h-12 w-12 items-center justify-center rounded-full bg-surface-tint">
              <TwitterIcon size={24} />
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </View>
  );
}
