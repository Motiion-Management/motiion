import { InputField } from '@/components/ui/form-fields/input-array'
import { SocialIcon, SocialPlatform } from '@/components/ui/social-link'
import { FC } from 'react'

export const SocialLinkField: FC<{
  platform: SocialPlatform
}> = ({ platform }) => {
  return (
    <div className="grid-cols-social-input grid-rows-social-input grid-areas-social-input grid gap-4 ">
      <SocialIcon platform={platform} className="grid-in-icon" />
      <div className="grid-in-input [&_h6]:capitalize">
        <InputField name={`socials.${platform}`} label={platform} />
      </div>
    </div>
  )
}

export const SocialLinkFields: FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <SocialLinkField platform="instagram" />
      <SocialLinkField platform="tiktok" />
      <SocialLinkField platform="youtube" />
      <SocialLinkField platform="twitter" />
      <SocialLinkField platform="facebook" />
      <SocialLinkField platform="linkedin" />
    </div>
  )
}
