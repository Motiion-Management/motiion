import Image from 'next/image'
import motif2 from '@/public/images/motif-2.png'

export function Motif2() {
  return (
    <Image
      src={motif2}
      alt="Motif 2"
      height={200}
      width={200}
      className="absolute -right-[80px] top-0"
    />
  )
}
