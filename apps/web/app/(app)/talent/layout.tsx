import { Nav } from './nav'

interface UserScreensLayoutProps {
  title: React.ReactNode
  children: React.ReactNode
}
export default function UserScreensLayout({
  title,
  children
}: UserScreensLayoutProps) {
  return (
    <div className="grid-areas-user-screen grid-rows-user-screen grid-cols-user-screen md:grid-rows-user-screen-md md:grid-areas-user-screen-md grid h-full pb-4">
      <header className="grid-in-title">{title}</header>
      <main className="grid-in-content grid overflow-y-auto overflow-x-clip p-4">
        {children}
      </main>
      <Nav className="grid-in-nav z-10" />
    </div>
  )
}
