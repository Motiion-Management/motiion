import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

export default function Vision() {
    return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="bg-background flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10 justify-between">
        <div className="mx-auto grid w-full max-w-6xl gap-2 my-24">
          <h1 className="text-4xl font-semibold pb-10">The dance ecosystem in <span style={{color:"#00CCB6"}}>motiion</span></h1>
          <p className="text-xl">Our mission is to empower dancers with innovative tools and resources to enhance their mental health, financial stability, and creative expression, fostering a vibrant and sustainable ecosystem.</p>
        </div>
        <div className="mx-auto grid w-full max-w-6xl gap-2 mb-8">
        <Button className="rounded-full font-semibold" size="rounded" variant="default">Next</Button>

        </div>
      </main>
    </div>
  )
}
