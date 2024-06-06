import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { FC, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { motion } from 'framer-motion'

export interface EditSkillListProps {
  name: string
}
export const EditSkillList: FC<EditSkillListProps> = ({ name }) => {
  const { register } = useFormContext()
  const { fields, remove } = useFieldArray({ name })

  const [itemsToRemove, setItemsToRemove] = useState<number[]>([])

  function createChangeHandler(index: number) {
    return (checked: boolean) => {
      if (checked) {
        setItemsToRemove([...itemsToRemove, index])
      } else {
        setItemsToRemove(itemsToRemove.filter((i) => i !== index))
      }
    }
  }

  function removeItems() {
    remove(itemsToRemove)
    setItemsToRemove([])
  }
  return (
    <div className="flex min-h-[70dvh] flex-col gap-6">
      <div className="mx-6 flex flex-col gap-2">
        <div className="mb-2 flex justify-between">
          <h4 className="text-h4 capitalize">{name} Skills</h4>
          <motion.span
            className="text-body-xs"
            animate={{ opacity: itemsToRemove.length > 0 ? 1 : 0 }}
          >
            {itemsToRemove.length} selected
          </motion.span>
        </div>
        {fields.map((skill, index) => (
          <div key={skill.id} className="flex w-full items-center gap-4">
            <Checkbox onCheckedChange={createChangeHandler(index)} />

            <Input {...register(`${name}.${index}`)} />
          </div>
        ))}
      </div>
      <Separator />
      <motion.div
        animate={{ opacity: itemsToRemove.length > 0 ? 1 : 0 }}
        className="flex justify-center"
      >
        <Button variant="destructive-link" onClick={removeItems}>
          Remove
        </Button>
      </motion.div>
    </div>
  )
}
