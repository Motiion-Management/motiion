import Image from 'next/image'
import motif3 from '@/public/svgs/motif-3.svg'

export function Motif3() {
  return (
    <Image
      src={motif3}
      alt="Motif 2"
      height={250}
      width={250}
      className="absolute bottom-0 left-0 -m-[30px] h-min"
    />
  )
}
