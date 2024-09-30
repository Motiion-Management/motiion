'use client'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { zFeaturedContent } from '@packages/backend/convex/validators/featuredContent'
import { useState } from 'react'

export default function FeaturedContentPage() {
  const featuredContent = useQuery(api.featuredContent.getAll)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(zFeaturedContent)
  })

  const createFeaturedContent = useMutation(api.featuredContent.create)
  const updateFeaturedContent = useMutation(api.featuredContent.update)
  const deleteFeaturedContent = useMutation(api.featuredContent.destroy)

  const onSubmit = async (data) => {
    await createFeaturedContent(data)
  }

  return (
    <div>
      <h1>Manage Featured Content</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Title" {...register('title')} />
        {errors.title && <span>{errors.title.message}</span>}
        
        <input type="text" placeholder="Description" {...register('description')} />
        {errors.description && <span>{errors.description.message}</span>}
        
        <input type="text" placeholder="Media ID" {...register('media')} />
        {errors.media && <span>{errors.media.message}</span>}
        
        <input type="text" placeholder="Contract ID" {...register('contract')} />
        {errors.contract && <span>{errors.contract.message}</span>}
        
        <input type="text" placeholder="Link" {...register('link')} />
        {errors.link && <span>{errors.link.message}</span>}
        
        <button type="submit">Create Featured Content</button>
      </form>

      <div>
        {featuredContent?.map((content, index) => (
          <div key={index}>
            <h2>{content.title}</h2>
            <p>{content.description}</p>
            <button onClick={() => updateFeaturedContent({ id: content._id, patch: { title: 'Updated Title' } })}>
              Update
            </button>
            <button onClick={() => deleteFeaturedContent({ id: content._id })}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
