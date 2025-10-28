import { useCallback, useMemo } from 'react'
import { type Id } from '@packages/backend/convex/_generated/dataModel'
import { useUser } from '~/hooks/useUser'

export type DancerViewType = 'own' | 'dancerViewingDancer' | 'choreographerViewingDancer' | 'guest'

export interface DancerViewConfig {
  viewType: DancerViewType
  canShare: boolean
  canEdit: boolean
  showQRCode: boolean
  showAddToList: boolean
  showFavorite: boolean
  showBook: boolean
  showRequest: boolean
}

export interface DancerViewActions {
  onQRCodePress: () => void
  onAddPress: () => void
  onFavoritePress: () => void
  onBookPress: () => void
  onRequestPress: () => void
}

export interface UseDancerViewResult {
  config: DancerViewConfig
  actions: DancerViewActions
  isLoading: boolean
}

export interface UseDancerViewOptions {
  targetDancerId: Id<'dancers'>
  targetUserId: Id<'users'> | undefined
  onQRCodePress?: () => void
  onAddPress?: () => void
  onFavoritePress?: () => void
  onBookPress?: () => void
  onRequestPress?: () => void
}

/**
 * Hook to determine the dancer profile view type and available actions
 * based on the current user's profile type and relationship to the target dancer
 */
export function useDancerView(options: UseDancerViewOptions): UseDancerViewResult {
  const {
    targetDancerId,
    targetUserId,
    onQRCodePress,
    onAddPress,
    onFavoritePress,
    onBookPress,
    onRequestPress,
  } = options

  const { user: currentUser, isLoading } = useUser()

  // Determine view type
  const viewType = useMemo((): DancerViewType => {
    // If not authenticated, treat as guest
    if (!currentUser) {
      return 'guest'
    }

    // If viewing own profile
    if (currentUser._id === targetUserId) {
      return 'own'
    }

    // If current user is a choreographer viewing a dancer
    if (currentUser.activeProfileType === 'choreographer') {
      return 'choreographerViewingDancer'
    }

    // Default: dancer viewing another dancer
    return 'dancerViewingDancer'
  }, [currentUser, targetUserId])

  // Build configuration based on view type
  const config = useMemo((): DancerViewConfig => {
    switch (viewType) {
      case 'own':
        return {
          viewType: 'own',
          canShare: true,
          canEdit: true,
          showQRCode: true,
          showAddToList: false,
          showFavorite: false,
          showBook: false,
          showRequest: false,
        }

      case 'choreographerViewingDancer':
        return {
          viewType: 'choreographerViewingDancer',
          canShare: true,
          canEdit: false,
          showQRCode: false,
          showAddToList: true,
          showFavorite: false,
          showBook: true,
          showRequest: true,
        }

      case 'dancerViewingDancer':
        return {
          viewType: 'dancerViewingDancer',
          canShare: true,
          canEdit: false,
          showQRCode: false,
          showAddToList: true,
          showFavorite: true,
          showBook: false,
          showRequest: false,
        }

      case 'guest':
      default:
        return {
          viewType: 'guest',
          canShare: false,
          canEdit: false,
          showQRCode: false,
          showAddToList: false,
          showFavorite: false,
          showBook: false,
          showRequest: false,
        }
    }
  }, [viewType])

  // Memoized action handlers
  const handleQRCodePress = useCallback(() => {
    if (!config.showQRCode) return
    onQRCodePress?.()
  }, [config.showQRCode, onQRCodePress])

  const handleAddPress = useCallback(() => {
    if (!config.showAddToList) return
    onAddPress?.()
  }, [config.showAddToList, onAddPress])

  const handleFavoritePress = useCallback(() => {
    if (!config.showFavorite) return
    onFavoritePress?.()
  }, [config.showFavorite, onFavoritePress])

  const handleBookPress = useCallback(() => {
    if (!config.showBook) return
    onBookPress?.()
  }, [config.showBook, onBookPress])

  const handleRequestPress = useCallback(() => {
    if (!config.showRequest) return
    onRequestPress?.()
  }, [config.showRequest, onRequestPress])

  const actions = useMemo(
    (): DancerViewActions => ({
      onQRCodePress: handleQRCodePress,
      onAddPress: handleAddPress,
      onFavoritePress: handleFavoritePress,
      onBookPress: handleBookPress,
      onRequestPress: handleRequestPress,
    }),
    [handleQRCodePress, handleAddPress, handleFavoritePress, handleBookPress, handleRequestPress]
  )

  return {
    config,
    actions,
    isLoading,
  }
}
