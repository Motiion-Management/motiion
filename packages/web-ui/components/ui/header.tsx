import { Separator } from './separator'

export function Header({
  title,
  actionSlot,
  children,
  noSeparator
}: {
  title?: string
  actionSlot?: React.ReactNode
  children?: React.ReactNode
  noSeparator?: boolean
}) {
  return (
    <header className="bg-background flex w-full flex-wrap items-center justify-between gap-4 ">
      <div className="flex w-full flex-wrap justify-between gap-4 px-4">
        {title && <h1 className="text-primary text-h3 flex-1">{title}</h1>}
        <div className="flex">{actionSlot}</div>
        {children && (
          <div className="flex basis-full justify-center gap-4">{children}</div>
        )}
      </div>
      {!noSeparator && <Separator className="basis-full" />}
    </header>
  )
}
