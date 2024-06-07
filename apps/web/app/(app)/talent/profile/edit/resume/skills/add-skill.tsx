import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { FC } from 'react'
import { useController } from 'react-hook-form'
import { PROFICIENCY } from '@packages/backend/convex/validators/base'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

export interface AddSkillProps {
  name: string
}

export const AddSkill: FC<AddSkillProps> = ({ name }) => {
  const skillCtl = useController({ name: `${name}.skill` })
  const levelCtl = useController({ name: `${name}.level` })

  function createLevelChangeHandler(level: (typeof PROFICIENCY)[number]) {
    return () => {
      levelCtl.field.onChange(level)
    }
  }

  return (
    <div className="flex min-h-[70dvh] flex-col gap-6">
      <div className="mx-6 flex flex-col gap-2">
        <div className="mb-2 flex justify-between">
          <h4 className="text-h4 capitalize">Special Skill</h4>
        </div>
        <FormItem>
          <FormLabel className="text-h6 flex items-center justify-between px-3">
            Skill Name
          </FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Enter the name of your representation..."
              {...skillCtl.field}
            />
          </FormControl>

          <FormMessage />
          <span className="text-body-xs text-foreground/50 px-3">
            Name the skill you want to add to your resume.
          </span>
        </FormItem>
      </div>
      <Separator />
      <div className="mx-6 grid grid-cols-3 gap-2">
        {PROFICIENCY.map((skill) => (
          <Button
            key={skill}
            variant={levelCtl.field.value === skill ? 'secondary' : 'outline'}
            size="sm"
            className="capitalize"
            onClick={createLevelChangeHandler(skill)}
          >
            {skill}
          </Button>
        ))}
      </div>
    </div>
  )
}
