import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/form-fields/input'
import { DatePickerField } from '@/components/ui/form-fields/date-picker'
import { SelectField } from '@/components/ui/form-fields/select'
import { LocationField } from '@/components/ui/form-fields/location'

import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'
import { PersonalDetailsFormProvider } from './form'
import { AccordionPlus } from './accordion'
import { getAuthToken } from '@/lib/server/utils'

export default async function Onboarding1() {
  const token = await getAuthToken()
  const data = await fetchQuery(api.users.getMyUser, {}, { token })

  console.log(data)

  const defaultValues = data
    ? {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        displayName: data.displayName || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        phone: data.phone || '',
        location: data.location || ''
      }
    : {}

  return (
    <section>
      <PersonalDetailsFormProvider defaultValues={defaultValues}>
        <InputField required name="firstName" placeholder="First Name" />
        <InputField required name="lastName" placeholder="Last Name" />
        <AccordionPlus label="Add Display Name">
          <InputField
            name="displayName"
            placeholder="What should we call you?"
          />
        </AccordionPlus>
        <DatePickerField name="dob" label="DOB" className="col-span-2" />
        <SelectField
          name="gender"
          label="I identify as"
          options={['Male', 'Female', 'Non-Binary']}
        />

        <InputField
          required
          name="phone"
          placeholder="Phone Number"
          label="Contact"
        />
        <LocationField name="location" required className="col-span-2" />
        <Button className="col-span-2 w-full" type="submit">
          Continue
        </Button>
      </PersonalDetailsFormProvider>
    </section>
  )
}
