import { Separator } from './separator'

export function Header({
  title,
  actionSlot,
  children
}: {
  title: string
  actionSlot?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header className="flex w-full flex-wrap items-center justify-between gap-4 pt-8">
      <div className="flex w-full flex-wrap justify-between gap-4 px-4">
        <h1 className="text-primary flex-1 text-2xl font-semibold">{title}</h1>
        <div className="flex">{actionSlot}</div>
        {children && (
          <div className="flex basis-full justify-center gap-4">{children}</div>
        )}
      </div>
      <Separator className="basis-full" />
    </header>
  )
}
