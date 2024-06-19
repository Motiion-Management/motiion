import {
  SiInstagram,
  SiTwitter,
  SiLinkedin,
  SiFacebook,
  SiTiktok,
  SiYoutube
} from '@icons-pack/react-simple-icons'
import { Link } from 'lucide-react'

const iconMap = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  twitter: SiTwitter,
  facebook: SiFacebook,
  linkedin: SiLinkedin
} as const

export type SocialPlatform = keyof typeof iconMap
export const SocialIcon: React.FC<{
  platform: SocialPlatform
  className?: string
}> = ({ platform, className }) => {
  const Icon = iconMap[platform] || Link

  return <Icon size={24} className={className} />
}

export interface SocialLinkProps {
  link: string
  platform: keyof typeof iconMap
}

export const SocialLink: React.FC<SocialLinkProps> = ({ link, platform }) => {
  return (
    <a
      className="hover:underline"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <SocialIcon platform={platform} />
    </a>
  )
}
