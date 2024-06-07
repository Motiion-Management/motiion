import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { preloadMyResume } from '@/lib/server/resumes'
import { SkillsForm } from './skills-form'

export default async function EditSkillsPage() {
  const preloadedResume = await preloadMyResume()

  return (
    <Card className="h-fit">
      <CardHeader className="pb-0 pt-5">
        <h3 className="text-h5">Skills by level</h3>
      </CardHeader>
      <CardContent className="divide-border flex flex-col divide-y py-2">
        <SkillsForm preloadedResume={preloadedResume} />
      </CardContent>
    </Card>
  )
}
