import { FC } from 'react'

export interface EditSkillListProps {
  name: string
}
export const EditSkillList: FC<EditSkillListProps> = ({ name }) => {
  return (
    <div>
      <h4 className="text-h4 capitalize">{name} Skills</h4>
    </div>
  )
}
