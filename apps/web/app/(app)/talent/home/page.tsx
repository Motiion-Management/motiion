import { me } from '@/lib/server/users'

export default async function HomePage() {
  const user = await me()
  return (
    <div>
      <p>Logged in as {user.firstName}</p>
      <h1>Home</h1>
    </div>
  )
}
