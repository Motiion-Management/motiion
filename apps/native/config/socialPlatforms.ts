export type SocialPlatform = 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'whatsapp';

export interface SocialPlatformConfig {
  key: SocialPlatform;
  name: string;
  displayName: string;
  placeholder: string;
  icon: string;
  urlTemplate: (handle: string) => string;
  handlePrefix?: string;
  handlePattern?: RegExp;
}

export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    key: 'instagram',
    name: 'Instagram',
    displayName: 'Instagram',
    placeholder: 'username',
    icon: 'logo.instagram',
    urlTemplate: (handle) => `https://instagram.com/${handle.replace(/^@/, '')}`,
    handlePrefix: '@',
    handlePattern: /^@?[a-zA-Z0-9._]+$/,
  },
  {
    key: 'twitter',
    name: 'Twitter',
    displayName: 'X (Twitter)',
    placeholder: 'username',
    icon: 'logo.x',
    urlTemplate: (handle) => `https://twitter.com/${handle.replace(/^@/, '')}`,
    handlePrefix: '@',
    handlePattern: /^@?[a-zA-Z0-9_]+$/,
  },
  {
    key: 'tiktok',
    name: 'TikTok',
    displayName: 'TikTok',
    placeholder: 'username',
    icon: 'logo.tiktok',
    urlTemplate: (handle) => `https://tiktok.com/@${handle.replace(/^@/, '')}`,
    handlePrefix: '@',
    handlePattern: /^@?[a-zA-Z0-9._]+$/,
  },
  {
    key: 'youtube',
    name: 'YouTube',
    displayName: 'YouTube',
    placeholder: 'channel',
    icon: 'logo.youtube',
    urlTemplate: (handle) => `https://youtube.com/@${handle.replace(/^@/, '')}`,
    handlePrefix: '@',
    handlePattern: /^@?[a-zA-Z0-9_-]+$/,
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    displayName: 'WhatsApp',
    placeholder: '1234567890',
    icon: 'logo.whatsapp',
    urlTemplate: (handle) => `https://wa.me/${handle.replace(/[^0-9]/g, '')}`,
    handlePattern: /^[+]?[0-9\s-()]+$/,
  },
];

export function getSocialPlatformConfig(key: SocialPlatform): SocialPlatformConfig | undefined {
  return SOCIAL_PLATFORMS.find((p) => p.key === key);
}

/**
 * Build a full URL from a handle for a given platform
 */
export function buildSocialUrl(platform: SocialPlatform, handle: string): string {
  const config = getSocialPlatformConfig(platform);
  if (!config) return '';
  return config.urlTemplate(handle);
}

/**
 * Normalize a handle by removing or adding prefix as needed
 */
export function normalizeHandle(platform: SocialPlatform, handle: string): string {
  const config = getSocialPlatformConfig(platform);
  if (!config) return handle;

  const trimmed = handle.trim();

  // For platforms with @ prefix, ensure consistency
  if (config.handlePrefix === '@') {
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  }

  return trimmed;
}

/**
 * Validate a handle for a given platform
 */
export function validateHandle(platform: SocialPlatform, handle: string): boolean {
  const config = getSocialPlatformConfig(platform);
  if (!config || !handle) return false;

  if (config.handlePattern) {
    return config.handlePattern.test(handle);
  }

  return handle.length > 0;
}
