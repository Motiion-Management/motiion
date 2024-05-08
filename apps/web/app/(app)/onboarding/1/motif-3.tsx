import Image from 'next/image'
import motif3 from '@/public/images/motif-3.png'

export function Motif3() {
  return (
    <Image
      src={motif3}
      alt="Motif 2"
      height={200}
      width={200}
      className="absolute bottom-0 left-5 h-min"
    />
  )
}
