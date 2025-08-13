import { FC } from 'react'
import { SendHorizontal } from 'lucide-react'

export interface EmailProps {
  address: string
}
export const Email: FC<EmailProps> = ({ address }) => {
  return (
    <a
      href={`mailto:${address}`}
      className="text-foreground flex flex-nowrap items-center gap-2 lowercase"
    >
      {address}
      <SendHorizontal size={12} />
    </a>
  )
}
