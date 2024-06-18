import { Button } from '@/components/ui/button'
export default function Privacy() {
  return (
    <div className="grid w-full grid-rows-[1fr_auto]">
      <div className="flex flex-col gap-6">
        <h4 className="text-lg font-semibold">Data Practices</h4>
        <p>
          Motiion collects information from you in order to provide our service.
          This includes your name, email, and phone number.
        </p>
        <p>
          By using our service, you also agree to our Terms and Conditions. You
          can read them by clicking the button below.
        </p>
      </div>

      <Button>Terms and Conditions</Button>
    </div>
  )
}
