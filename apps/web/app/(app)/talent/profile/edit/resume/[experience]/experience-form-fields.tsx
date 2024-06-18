import { FC } from 'react'
import { InputField } from '@/components/ui/form-fields/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { YearPickerField } from '@/components/ui/form-fields/year-picker'

export const ExperienceFormFields: FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 py-6 [&>div:not(.separator)]:mx-8 [&>div:not(.separator)]:mb-2">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="private-toggle" className="text-body">
          Make Private
        </Label>
        <Switch name="private" id="private-toggle" />
      </div>
      <Separator />
      <InputField name="title" label="Title" required tabIndex={1} />
      <YearPickerField name="startYear" label="Year" required />

      <Separator />
      <InputField name="role[0]" label="Role" required tabIndex={3} />
      <Separator />
      <InputField name="credits[0]" label="Credits" tabIndex={4} />
      <Separator />
      <InputField
        name="link"
        label="Link"
        type="url"
        placeholder="https://www.youtube.com/12ab23d"
        tabIndex={5}
      />
    </div>
  )
}
