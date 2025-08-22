import { useState, useCallback } from 'react'

type FormType = 
  | 'display-name'
  | 'height'
  | 'ethnicity'
  | 'hair-color'
  | 'eye-color'
  | 'gender'
  | 'headshots'
  | 'sizing'
  | 'location'
  | 'work-location'
  | 'representation'
  | 'agency'
  | 'training'
  | 'skills'
  | 'experiences'

export interface UseReviewFormSheetReturn {
  // State
  isOpen: boolean
  currentFormType: FormType | null
  
  // Actions
  openForm: (formType: FormType) => void
  closeForm: () => void
  
  // Handlers
  handleFormComplete: (data: any) => void
}

interface UseReviewFormSheetProps {
  onFormComplete?: (formType: FormType, data: any) => void
}

export function useReviewFormSheet({ 
  onFormComplete 
}: UseReviewFormSheetProps = {}): UseReviewFormSheetReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [currentFormType, setCurrentFormType] = useState<FormType | null>(null)

  const openForm = useCallback((formType: FormType) => {
    setCurrentFormType(formType)
    setIsOpen(true)
  }, [])

  const closeForm = useCallback(() => {
    setIsOpen(false)
    // Small delay before clearing form type to allow sheet to close smoothly
    setTimeout(() => {
      setCurrentFormType(null)
    }, 300)
  }, [])

  const handleFormComplete = useCallback((data: any) => {
    if (currentFormType) {
      onFormComplete?.(currentFormType, data)
    }
  }, [currentFormType, onFormComplete])

  return {
    isOpen,
    currentFormType,
    openForm,
    closeForm,
    handleFormComplete,
  }
}