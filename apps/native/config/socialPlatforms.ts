export type SocialPlatform = 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'whatsapp'

export interface SocialPlatformConfig {
  key: SocialPlatform
  name: string
  displayName: string
  placeholder: string
  icon: string
  urlPattern?: RegExp
}

export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    key: 'instagram',
    name: 'Instagram',
    displayName: 'Instagram',
    placeholder: 'https://instagram.com/username',
    icon: 'logo.instagram',
  },
  {
    key: 'twitter',
    name: 'Twitter',
    displayName: 'X (Twitter)',
    placeholder: 'https://twitter.com/username',
    icon: 'logo.x',
  },
  {
    key: 'tiktok',
    name: 'TikTok',
    displayName: 'TikTok',
    placeholder: 'https://tiktok.com/@username',
    icon: 'logo.tiktok',
  },
  {
    key: 'youtube',
    name: 'YouTube',
    displayName: 'YouTube',
    placeholder: 'https://youtube.com/@channel',
    icon: 'logo.youtube',
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    displayName: 'WhatsApp',
    placeholder: 'https://wa.me/1234567890',
    icon: 'logo.whatsapp',
  },
]

export function getSocialPlatformConfig(key: SocialPlatform): SocialPlatformConfig | undefined {
  return SOCIAL_PLATFORMS.find((p) => p.key === key)
}
