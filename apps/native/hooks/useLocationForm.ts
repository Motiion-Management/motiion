import { useState, useCallback } from 'react'

import { type USCity } from '~/data/usCities'

export interface LocationFormData {
  primaryLocation: USCity | null
}

export interface LocationFormOptions {
  initialValue?: USCity | null
  onSubmit?: (data: LocationFormData) => Promise<void> | void
  validateLocation?: (location: USCity | null) => string | null
}

export interface LocationFormState {
  data: LocationFormData
  errors: {
    primaryLocation?: string
  }
  isSubmitting: boolean
  isValid: boolean
}

export interface LocationFormActions {
  setLocation: (location: USCity | null) => void
  submit: () => Promise<void>
  reset: () => void
  validate: () => boolean
}

export function useLocationForm(options: LocationFormOptions = {}) {
  const {
    initialValue = null,
    onSubmit,
    validateLocation
  } = options
  
  const [state, setState] = useState<LocationFormState>({
    data: {
      primaryLocation: initialValue
    },
    errors: {},
    isSubmitting: false,
    isValid: !!initialValue
  })
  
  const validateForm = useCallback((location: USCity | null = state.data.primaryLocation) => {
    const errors: LocationFormState['errors'] = {}
    
    // Required field validation
    if (!location) {
      errors.primaryLocation = 'Please select a city and state'
    } else if (validateLocation) {
      // Custom validation
      const customError = validateLocation(location)
      if (customError) {
        errors.primaryLocation = customError
      }
    }
    
    const isValid = Object.keys(errors).length === 0
    
    setState(prev => ({
      ...prev,
      errors,
      isValid
    }))
    
    return isValid
  }, [state.data.primaryLocation, validateLocation])
  
  const setLocation = useCallback((location: USCity | null) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        primaryLocation: location
      },
      errors: {
        ...prev.errors,
        primaryLocation: undefined
      }
    }))
    
    // Validate on change
    validateForm(location)
  }, [validateForm])
  
  const submit = useCallback(async () => {
    if (!validateForm()) {
      return
    }
    
    setState(prev => ({ ...prev, isSubmitting: true }))
    
    try {
      if (onSubmit) {
        await onSubmit(state.data)
      }
    } catch (error) {
      console.error('Location form submission error:', error)
      // Set a general error if needed
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          primaryLocation: 'Failed to save location. Please try again.'
        },
        isValid: false
      }))
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }, [state.data, onSubmit, validateForm])
  
  const reset = useCallback(() => {
    setState({
      data: {
        primaryLocation: initialValue
      },
      errors: {},
      isSubmitting: false,
      isValid: !!initialValue
    })
  }, [initialValue])
  
  return {
    ...state,
    actions: {
      setLocation,
      submit,
      reset,
      validate: () => validateForm()
    }
  }
}