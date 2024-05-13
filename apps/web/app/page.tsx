import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Link from 'next/link'

export default function RootPage() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Card>
        <CardHeader>
          <CardTitle>Motiion</CardTitle>
          <CardDescription>The app for dancers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Link href="/sign-up">Sign up</Link>
            <Link href="/sign-in">Sign in</Link>
            <Link href="/onboarding/1">Onboarding</Link>
            <Link href="/home">Home</Link>
            <Link href="/discover">Discover</Link>
            <Link href="/profile">Profile</Link>
            <Link href="/settings">Settings</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
