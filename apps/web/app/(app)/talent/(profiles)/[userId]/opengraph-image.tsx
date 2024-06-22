import { fetchPublicUser } from '@/lib/server/users'
import { calculateAge, formatHeight } from '@/lib/utils'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { fetchQuery } from 'convex/nextjs'
import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Motiion Profile Card'
export const size = {
  width: 360,
  height: 475
}

export const contentType = 'image/png'

function Stat({ label, value }: { label: string; value?: string | number }) {
  if (!value) {
    return null
  }
  return (
    <div
      style={{
        display: 'flex',
        flexBasis: '20%',
        flexDirection: 'column',
        marginBottom: '1rem',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          display: 'flex',
          color: '#e6faf8',
          fontSize: '18px',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: '140%',
          letterSpacing: '-0.02rem'
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: 'flex',
          color: '#e6faf8',
          fontFamily: 'Montserrat',
          fontSize: '10px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '140%',
          letterSpacing: '-0.02rem',
          textTransform: 'uppercase'
        }}
      >
        {label}
      </div>
    </div>
  )
}
// Image generation
export default async function OGImage({
  params: { userId }
}: {
  params: { userId: Id<'users'> }
}) {
  const user = await fetchPublicUser(userId)

  const agency =
    user?.representation?.agencyId &&
    (await fetchQuery(api.agencies.getAgency, {
      id: user.representation.agencyId
    }))

  const headshots =
    user?.headshots?.[0] &&
    (await fetchQuery(api.users.headshots.getHeadshots, { userId }))
  const headshot = headshots?.[0]
  // Font
  const montserratMedium = fetch(
    new URL(
      '../../../../../public/fonts/Montserrat-Medium.ttf',
      import.meta.url
    )
  ).then((res) => res.arrayBuffer())

  const montserratSemibold = fetch(
    new URL(
      '../../../../../public/fonts/Montserrat-SemiBold.ttf',
      import.meta.url
    )
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      // ImageResponse JSX element

      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          flexDirection: 'column',
          fontFamily: 'Montserrat',
          fontSize: '24px',
          fontStyle: 'normal',
          lineHeight: '120%',
          letterSpacing: '-0.02rem',
          fontWeight: 600,
          textAlign: 'center',
          backgroundColor: '#111121',
          color: '#FFFFFF'
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: '18px',
            backgroundImage: 'linear-gradient(to bottom, #007064, #1C1D20)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            padding: '2rem 0',
            flexDirection: 'column'
          }}
        >
          {/* eslint-disable-next-line */}
          <svg
            style={{
              position: 'absolute',
              opacity: 0.1,
              width: '100%',
              height: '60%',
              bottom: 0,
              left: '50%'
            }}
            width="102"
            height="66"
            viewBox="0 0 102 66"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M60.2703 9.78571C60.2703 14.9141 56.1187 19.0714 50.9975 19.0714C45.8764 19.0714 41.7248 14.9141 41.7248 9.78571C41.7248 4.65735 45.8764 0.5 50.9975 0.5C56.1187 0.5 60.2703 4.65735 60.2703 9.78571Z"
              fill="white"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M17.5481 35.527C17.9945 34.5938 18.4782 33.6825 18.9973 32.7952C20.7794 29.749 25.0312 30.293 26.5888 33.4602C36.5823 53.781 65.3293 54.2972 76.044 34.3483C77.714 31.239 81.9825 30.8481 83.6544 33.9563C84.1414 34.8617 84.5922 35.7897 85.0048 36.7383C88.3265 44.3746 88.9887 52.9073 86.8849 60.9658C86.3077 63.1768 87.8755 65.5 90.1576 65.5H99.0199C99.6392 65.5 100.185 65.0887 100.342 64.4887C103.234 53.4083 102.324 41.6758 97.7566 31.1759C95.0564 24.9683 91.1707 19.4046 86.3637 14.7721C80.8287 9.43796 72.2082 12.0852 68.5695 18.86L63.7944 27.7505C58.437 37.725 44.0635 37.4668 39.0667 27.3065L34.613 18.2502C31.2191 11.3492 22.699 8.39411 16.9766 13.5261C12.0068 17.983 7.9244 23.4037 5.00367 29.5103C0.0633772 39.8395 -1.26655 51.5317 1.22751 62.7088C1.59853 64.3716 3.10759 65.5 4.80896 65.5H10.5123C13.4303 65.5 15.4382 62.5231 14.8018 59.6714C12.988 51.5425 13.9552 43.0391 17.5481 35.527ZM22.135 24.404C22.1352 24.4044 22.1353 24.4043 22.135 24.404C22.1181 24.3807 22.1219 24.3773 22.135 24.404ZM80.8191 25.4578C80.8332 25.4316 80.8369 25.4352 80.8191 25.4578C80.8188 25.4581 80.8189 25.4582 80.8191 25.4578Z"
              fill="white"
            />
          </svg>
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexBasis: '80%',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: '0 2rem'
              }}
            >
              <div>{user.fullName}</div>
              <div
                style={{
                  fontSize: '16px',
                  lineHeight: '140%'
                }}
              >
                {user.location?.city}
              </div>
            </div>
            {agency?.logoUrl && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  flexBasis: '15%'
                }}
              >
                {/* eslint-disable-next-line */}
                <img
                  src={agency.logoUrl}
                  alt=""
                  height="50px"
                  style={{ justifySelf: 'flex-end' }}
                />
              </div>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: '1rem',
              padding: '1rem 0.5rem 0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              borderTop: '1px solid #8796A6',
              borderBottom: '1px solid #8796A6'
            }}
          >
            <Stat label="age" value={calculateAge(user.dateOfBirth)} />
            <Stat label="Yrs Exp" value={user.attributes?.yearsOfExperience} />
            <Stat label="Gender" value={user?.gender?.[0]} />
            <Stat
              label="Height"
              value={formatHeight(user.attributes?.height)}
            />
            <Stat
              label="Hair"
              value={user.attributes?.hairColor?.slice(0, 2)}
            />
            <Stat label="Eyes" value={user.attributes?.eyeColor?.slice(0, 3)} />
            <Stat label="Waist" value={user.sizing?.general?.waist} />
            <Stat
              label="Shoes"
              value={user.sizing?.male?.shoes || user.sizing?.female?.shoes}
            />
            <Stat label="Jacket" value={user.sizing?.male?.coatLength?.[0]} />
          </div>
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between'
            }}
          >
            {headshot?.url && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  padding: '2rem 1rem',
                  flexBasis: '40%'
                }}
              >
                {/* eslint-disable-next-line */}
                <img
                  src={headshot.url}
                  alt=""
                  height="188px"
                  width="125px"
                  style={{ borderRadius: '14px' }}
                />
              </div>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: '18px',
                flexBasis: '60%',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                textAlign: 'end',
                padding: '2rem 1rem 2rem 0'
              }}
            >
              <div>Join me on Motiion!</div>
              <div
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  fontSize: '14px',
                  lineHeight: '140%'
                }}
              >
                An app for dancers,
                <br />
                choreographers,
                <br />
                {`&`} talent agencies.
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: 'Montserrat',
          data: await montserratMedium,
          style: 'normal',
          weight: 500
        },
        {
          name: 'Montserrat',
          data: await montserratSemibold,
          style: 'normal',
          weight: 600
        }
      ]
    }
  )
}
