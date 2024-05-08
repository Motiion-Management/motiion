import Image from 'next/image'
import motif2 from '@/public/images/motif-2.png'

export function Motif2() {
  return (
    <Image
      src={motif2}
      alt="Motif 2"
      height={300}
      width={300}
      className="absolute -right-[100px] -top-10 -m-[50px] h-min"
    />
  )
}
