import {
  SiInstagram,
  SiTwitter,
  SiLinkedin,
  SiFacebook,
  SiTiktok
} from '@icons-pack/react-simple-icons'
import { Link } from 'lucide-react'

const iconMap = {
  instagram: SiInstagram,
  twitter: SiTwitter,
  linkedin: SiLinkedin,
  facebook: SiFacebook,
  tiktok: SiTiktok
} as const
const SocialIcon: React.FC<{ platform: keyof typeof iconMap }> = ({
  platform
}) => {
  const Icon = iconMap[platform] || Link

  return <Icon size={24} />
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
