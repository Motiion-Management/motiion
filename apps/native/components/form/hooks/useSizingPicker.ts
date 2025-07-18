import { useCallback, useState } from 'react'
import { SizingMetricConfig } from '~/types/sizing'

export function useSizingPicker() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<SizingMetricConfig | null>(null)
  const [selectedValue, setSelectedValue] = useState<string>('')
  const [initialValue, setInitialValue] = useState<string>('')

  const present = useCallback((newConfig: SizingMetricConfig, currentValue?: string) => {
    setConfig(newConfig)
    const value = currentValue || newConfig.values[0]
    setSelectedValue(value)
    setInitialValue(value)
    setIsOpen(true)
  }, [])

  const dismiss = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleValueChange = useCallback((value: string) => {
    setSelectedValue(value)
  }, [])

  const hasValueChanged = selectedValue !== initialValue

  return {
    models: {
      isOpen,
      config,
      selectedValue,
      hasValueChanged,
    },
    actions: {
      present,
      dismiss,
      handleValueChange,
    },
  }
}