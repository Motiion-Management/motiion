import Image from 'next/image'
import motif4 from '@/public/images/motif-4.png'

export function Motif4() {
  return (
    <Image
      src={motif4}
      alt="Motif 2"
      height={200}
      width={200}
      className="bottom-00 absolute -right-[95%]"
    />
  )
}
