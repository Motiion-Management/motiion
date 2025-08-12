/**
 * Convert date strings to Date objects for form layer
 * Handles various date formats and ensures proper Date object creation
 */
export function hydrateDates<T extends Record<string, any>>(data: T | undefined): T {
  if (!data) return {} as T
  
  const result = { ...data } as T
  
  const parseDate = (value: any): Date | undefined => {
    if (!value) return undefined
    if (value instanceof Date) return value
    if (typeof value !== 'string') return undefined
    
    const trimmed = value.trim()
    if (!trimmed) return undefined
    
    const date = new Date(trimmed)
    return isNaN(date.getTime()) ? undefined : date
  }
  
  // Handle common date fields
  const dateFields = ['startDate', 'endDate', 'createdAt', 'updatedAt'] as const
  
  dateFields.forEach(field => {
    if (field in result) {
      const parsedDate = parseDate(result[field as keyof T])
      if (parsedDate) {
        ;(result as any)[field] = parsedDate
      } else {
        delete (result as any)[field]
      }
    }
  })
  
  return result
}

/**
 * Convert Date objects to ISO strings for storage
 */
export function serializeDates<T extends Record<string, any>>(data: T): T {
  const result = { ...data } as T
  
  Object.keys(result).forEach(key => {
    const value = result[key as keyof T] as any
    if (value instanceof Date) {
      ;(result as any)[key] = value.toISOString()
    }
  })
  
  return result
}