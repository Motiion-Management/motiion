import { ResumeDoc } from '@packages/backend/convex/resumes'
import { LinkSection } from './link-section'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'

export const AboutLinks: React.FC<{ resume: ResumeDoc }> = async ({
  resume
}) => {
  let representation
  if (resume.representation) {
    representation = await fetchQuery(api.agencies.getAgency, {
      id: resume?.representation
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
