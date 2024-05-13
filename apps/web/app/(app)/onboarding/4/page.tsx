'use client'
import Image from 'next/image'
import placeholder from '@/public/images/upload-document-placeholder.png'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { CircleX } from 'lucide-react'
import { ONBOARDING_STEPS } from '@packages/backend/convex/users'
import { useState } from 'react'
import { ResumeUploadButton } from '@/components/ui/resume-upload-button'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

export default function ResumeUploadStep() {
  const resumeUploads = useQuery(api.resumes.getMyResumeUploads)
  const removeResumeUpload = useMutation(api.resumes.removeResumeUpload)
  const resumeUploadsExist = resumeUploads && resumeUploads.length > 0
  const updateMyUser = useMutation(api.users.updateMyUser)
  const user = useQuery(api.users.getMyUser)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function nextStep() {
    setLoading(true)
    await updateMyUser({
      id: user!._id,
      patch: {
        onboardingStep: ONBOARDING_STEPS.COMPLETE
      }
    })

    router.push('/home')
  }

  return (
    <section className="mt-4 grid h-full w-full grid-cols-1 grid-rows-[1fr_min-content] gap-8">
      <div className="flex flex-col items-start gap-5 ">
        <p className="">
          We recommend using an existing resume to import your information. If
          your resume isn’t nearby, you can enter it manually later.
        </p>

        {resumeUploadsExist ? (
          <div className="flex w-full flex-col gap-5">
            <div className="flex w-full justify-between">
              <h4 className="text-xl font-bold">Resumes</h4>
              <p className="text-sm">{resumeUploads?.length || 0} imported</p>
            </div>
            <Separator className="bg-ring/50 mb-2" />
            {resumeUploads.map((resumeUpload, index) => (
              <div
                className="bg-input flex w-full justify-between rounded-lg p-3"
                key={index}
              >
                {resumeUpload.title}
                <CircleX
                  className="stroke-input fill-white"
                  onClick={() => {
                    removeResumeUpload({
                      resumeUploadId: resumeUpload.storageId
                    })
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <Image
            src={placeholder}
            className="mt-6 h-auto w-[200px] self-center  object-contain"
            alt="Upload Image Placeholder"
          />
        )}
      </div>
      <div className="sticky bottom-0 w-full ">
        {resumeUploadsExist ? (
          <Button onClick={nextStep} className="w-full" loading={loading}>
            Continue
          </Button>
        ) : (
          <>
            <Button
              variant="accent-link"
              onClick={nextStep}
              className="w-full"
              loading={loading}
            >
              Enter Manually Later
            </Button>
            <ResumeUploadButton className="w-full" />
          </>
        )}
      </div>
    </section>
  )
}
