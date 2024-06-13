import { LinkSection } from './link-section'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'
import { UserDoc } from '@packages/backend/convex/validators/users'

export const AboutLinks: React.FC<{ user: UserDoc }> = async ({
  user: resume
}) => {
  let representation
  if (resume.representation?.agencyId) {
    representation = await fetchQuery(api.agencies.getAgency, {
      id: resume.representation.agencyId
    })
  }
  return (
    <LinkSection
      title="About"
      links={[
        {
          href: '/talent/profile/edit/about/representation',
          text: 'Representation',
          preview: representation?.shortName || representation?.name
        },
        {
          href: '/talent/profile/edit/about/attributes',
          text: 'Attributes'
        },
        {
          href: '/talent/profile/edit/about/sizing',
          text: 'Sizing'
        }
      ]}
    />
  )
}
