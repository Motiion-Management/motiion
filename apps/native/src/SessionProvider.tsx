import { useSession } from '@clerk/clerk-expo'
import CookieManager from '@react-native-cookies/cookies'
import { addYears } from '@clerk/shared/date'

const baseURL = process.env.EXPO_PUBLIC_WEB_SERVER || 'http://jake.local:3000'

type SameSiteAttributeType = 'None' | 'Lax' | 'Strict'

// export const getSecureAttribute = (sameSite: SameSiteAttributeType): boolean => {
//   if (window.location.protocol === 'https:') {
//     return true;
//   }
//
//   // If the cookie is not SameSite=None, then the Secure attribute is not required
//   if (sameSite !== 'None') {
//     return false;
//   }
//
//   // This is because Safari does not support the Secure attribute on localhost
//   if (typeof (window as any).safari !== 'undefined') {
//     return false;
//   }
//
//   // This is a useful way to check if the current context is secure
//   // This is needed for example in environments like Firefox Remote Control
//   // where the `localhost` is not considered secure
//   if (typeof window.isSecureContext !== 'undefined') {
//     return window.isSecureContext;
//   }
//
//   return window.location.hostname === 'localhost';
// };

export default function ClerkSessionProvider({
  children
}: {
  children: React.ReactNode
}) {
  const { session, isLoaded, isSignedIn } = useSession()

  if (isLoaded && isSignedIn) {
    session.getToken().then((token) => {
      console.log('🍪🍪 tokenCookie:', token)
      console.log('🍪🍪 baseURL:', baseURL)
      console.log('\n')

      const expires = addYears(Date.now(), 1)
      // const sameSite = 'None'
      const secure = true
      // const secure = getSecureAttribute(sameSite)

      CookieManager.set(
        baseURL,
        {
          name: '__session',
          httpOnly: true,
          value: token,
          // replace 'http://', 'https://', and any port specifier with '' to set secure cookies
          domain: baseURL
            .replace('http://', '')
            .replace('https://', '')
            .replace(/:\d+$/, ''),
          path: '/',
          version: '1',
          expires: expires.toString(),
          secure
        },
        true
      )
        .then((done) => {
          console.log('CookieManager.set 🍪 =>', done)
        })
        .catch((err) => {
          console.error('CookieManager.set 🍪 =>', err)
        })

      CookieManager.set(
        baseURL,
        {
          name: '__session_wto-9JoH',
          // httpOnly: true,
          value: token,
          // replace 'http://', 'https://', and any port specifier with '' to set secure cookies
          domain: baseURL
            .replace('http://', '')
            .replace('https://', '')
            .replace(/:\d+$/, ''),
          path: '/',
          version: '1',
          expires: expires.toString(),
          secure
        },
        true
      )
        .then((done) => {
          console.log('CookieManager.set 🍪 =>', done)
        })
        .catch((err) => {
          console.error('CookieManager.set 🍪 =>', err)
        })
    })
  }

  return <>{children}</>
}
