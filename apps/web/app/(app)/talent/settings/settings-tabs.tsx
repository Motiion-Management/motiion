import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
export interface SettingsTabProps {
  links: { href: string; header: string; subtext: string; iconPath: string; }[]
}
export function SettingsTabs({  links }: SettingsTabProps) {
  return (
    <div className="border-b-border flex h-min w-full flex-col gap-2 divide-y divide-solid border-b pb-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-body flex items-center justify-between pb-2 pt-4"
        >
          <div className='flex gap-3'>
          <Image height={30} width={30} src={link.iconPath} alt={link.header}/>
          <div>
          <h4 className='text-lg font-semibold'>{link.header}</h4>
          <p className="text-body-xs flex items-center gap-2">{link.subtext} </p>
          
          </div>
          </div>
          <div >
           <ChevronRight size={16} />
          </div>
        </Link>
      ))}
    </div>
  )
}
