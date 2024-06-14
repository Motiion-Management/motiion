import { Button } from '@/components/ui/button'
export default function Privacy() {
  return (
    <div className="flex w-full flex-col overflow-hidden">
      <main className="bg-background flex justify-start flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto w-full max-w-6xl gap-2 pb-5">
          <h1 className="text-2xl font-semibold">Data and Privacy</h1>
          <p className="text-xs uppercase">Settings</p>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-80">
          <div className="grid gap-6">
            <h4 className='text-lg font-semibold'>Data Practices</h4>
            <p>Motiion collects information from you in order to provide our service. This includes your name, email, and phone number.</p>
          </div>

            <Button>Terms and Conditions</Button>
        </div>
      </main>
    </div>
  )
}
