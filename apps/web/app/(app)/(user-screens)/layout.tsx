import { Nav } from './nav'

interface UserScreensLayoutProps {
  children: React.ReactNode
}
export default function UserScreensLayout({
  children
}: UserScreensLayoutProps) {
  return (
    <div className="grid-areas-user-screen grid-rows-user-screen grid-cols-user-screen md:grid-rows-user-screen md:grid-areas-user-screen-md grid h-full">
      <Nav className="grid-in-nav" />
      <main className="grid-in-content grid h-full place-items-center">
        {children}
      </main>
    </div>
  )
}
