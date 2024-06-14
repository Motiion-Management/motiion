import { Alert } from '@/components/ui/alert'
import { AlertDescription } from '@/components/ui/alert'
import { InfoIcon as Info } from 'lucide-react'
import Logo from '@/public/SettingsAccentLogo.svg'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
export default function Support() {
  return (
    <div className="flex w-full flex-col overflow-hidden">
      <main className="bg-background flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto w-full max-w-6xl gap-2 pb-5">
          <h1 className="text-3xl font-semibold">Support</h1>
          <p className="text-xs uppercase">Settings</p>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-80">
          <div className="grid gap-6">
            <Alert
              iconSlot={<Info />}
              className="relative overflow-hidden border-solid border-[#00CCB6] bg-[#E6FAF8]"
            >
              <AlertDescription className="flex flex-col gap-3 overflow-hidden">
                <p>
                  Thank you for using Motiion. We aim to make this platform easy
                  to use and beneficial for all.
                </p>
                <p>
                  We would love your feedback! Let us know which features you
                  love or think could use some improvement.
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

            <Button>Contact Motion</Button>
        </div>
      </main>
    </div>
  )
}
