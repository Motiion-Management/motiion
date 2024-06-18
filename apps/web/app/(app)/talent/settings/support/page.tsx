import { Alert } from '@/components/ui/alert'
import { AlertDescription } from '@/components/ui/alert'
import { InfoIcon as Info } from 'lucide-react'
import Logo from '@/public/SettingsAccentLogo.svg'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
export default function Support() {
  return (
    <div className="grid w-full grid-rows-[1fr_auto]">
      <div>
        <Alert
          variant="accent"
          iconSlot={<Info />}
          className="relative overflow-clip border-solid"
        >
          <AlertDescription className="text-body-sm flex flex-col gap-3 overflow-hidden">
            <p>
              Thank you for using Motiion. We aim to make this platform easy to
              use and beneficial for all.
            </p>
            <p>
              We would love your feedback! Let us know which features you love
              or think could use some improvement.
            </p>
            <Image
              className="absolute right-[-.5rem] top-16"
              src={Logo}
              alt="Settings Accent Logo"
              width={100}
              height={100}
            />
          </AlertDescription>
        </Alert>
      </div>

      <a href="mailto:support@motiion.io" className="grid">
        <Button>Contact Motion</Button>
      </a>
    </div>
  )
}
