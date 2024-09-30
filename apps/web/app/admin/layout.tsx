import Link from 'next/link'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container my-2 max-w-screen-xl">
      <header className="bg-muted rounded-md p-4">
        <h1 className="text-3xl">Admin Panel</h1>
        <nav>
          <div className="flex flex-row gap-8">
            <Link href="/admin/users">Manage Users</Link>
            <Link href="/admin/events">Manage Events</Link>
            <Link href="/admin/settings">Settings</Link>
          </div>
        </nav>
      </header>
      <main className="p-4">{children}</main>
    </div>
  )
}
