import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { useRouter } from 'expo-router'
import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'

type TabType = 'select-project' | 'add-cover'

export function useAddHighlight(profileId: Id<'dancers'> | null) {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState<TabType>('select-project')
  const [selectedProjectId, setSelectedProjectId] = useState<Id<'projects'> | null>(null)
  const [uploadedImageId, setUploadedImageId] = useState<Id<'_storage'> | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const addHighlight = useMutation(api.highlights.addHighlight)

  const canProceedToNextTab = currentTab === 'select-project' && selectedProjectId !== null
  const canSubmit =
    currentTab === 'add-cover' && selectedProjectId !== null && uploadedImageId !== null

  const handleNextTab = useCallback(() => {
    if (canProceedToNextTab) {
      setCurrentTab('add-cover')
    }
  }, [canProceedToNextTab])

  const handlePrevTab = useCallback(() => {
    if (currentTab === 'add-cover') {
      setCurrentTab('select-project')
    }
  }, [currentTab])

  const selectProject = useCallback((projectId: Id<'projects'>) => {
    setSelectedProjectId(projectId)
  }, [])

  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permissions to upload images.')
      return false
    }
    return true
  }, [])

  const pickImage = useCallback(async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return null

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1 // Keep original quality; we compress in optimizer
    })

    if (!result.canceled && result.assets[0]) {
      return result.assets[0]
    }
    return null
  }, [requestPermissions])

  const takePicture = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera permissions to take pictures.')
      return null
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1 // Keep original quality; we compress in optimizer
    })

    if (!result.canceled && result.assets[0]) {
      return result.assets[0]
    }
    return null
  }, [])

  const uploadImage = useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      try {
        setIsUploading(true)
        setUploadProgress(0)

        // Resize the image using Expo ImageManipulator
        const manipResult = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        )

        setUploadProgress(30)

        // Generate upload URL
        const uploadUrl = await generateUploadUrl()

        setUploadProgress(50)

        // Upload optimized image to Convex storage
        const response = await fetch(manipResult.uri)
        const blob = await response.blob()

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': blob.type },
          body: blob
        })

        if (!uploadResponse.ok) {
          throw new Error('Upload failed')
        }

        const { storageId } = await uploadResponse.json()
        setUploadedImageId(storageId as Id<'_storage'>)
        setUploadProgress(100)
        setIsUploading(false)

        return storageId as Id<'_storage'>
      } catch (error) {
        setIsUploading(false)
        setUploadProgress(0)
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        Alert.alert('Upload Error', errorMessage)
        return null
      }
    },
    [generateUploadUrl]
  )

  const handleImageUpload = useCallback(async () => {
    Alert.alert('Select Image Source', 'Choose how you want to add your image', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await takePicture()
          if (result) {
            await uploadImage(result)
          }
        }
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const result = await pickImage()
          if (result) {
            await uploadImage(result)
          }
        }
      },
      { text: 'Cancel', style: 'cancel' }
    ])
  }, [takePicture, pickImage, uploadImage])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !profileId || !selectedProjectId || !uploadedImageId) {
      return
    }

    try {
      await addHighlight({
        profileId,
        projectId: selectedProjectId,
        imageId: uploadedImageId
      })

      // Close modal and navigate back
      router.back()
    } catch (error) {
      console.error('Failed to add highlight:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add highlight'
      Alert.alert('Error', errorMessage)
    }
  }, [canSubmit, profileId, selectedProjectId, uploadedImageId, addHighlight, router])

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  return {
    models: {
      currentTab,
      selectedProjectId,
      uploadedImageId,
      isUploading,
      uploadProgress,
      canProceedToNextTab,
      canSubmit
    },
    actions: {
      handleNextTab,
      handlePrevTab,
      selectProject,
      handleImageUpload,
      handleSubmit,
      handleClose
    }
  }
}
