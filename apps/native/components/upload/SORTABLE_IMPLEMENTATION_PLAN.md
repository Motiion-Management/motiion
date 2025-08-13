# Implementation Plan: React Native Sortables for Headshots Page

## 1. Architecture Overview
Create a new **SortableMultiImageUpload** component that wraps the existing functionality with sortable capabilities. This approach maintains the current component structure while adding drag-and-drop reordering specifically for ImagePreview cards.

## 2. Key Implementation Challenges & Solutions

### Challenge A: Different Layout for First Item
- **Current State**: First image is full-width, remaining images are in a 2-column grid
- **Solution**: Use **Sortable.Flex** instead of Grid for maximum flexibility, allowing custom layouts per position
- **Alternative**: Custom renderItem that applies different styles based on index

### Challenge B: Mixed Content Types
- **Current State**: Mix of ImagePreview components (uploaded images) and ImageUploadCard (empty slots)
- **Solution**: Only include uploaded images in sortable data array, render upload cards separately outside the sortable container

### Challenge C: State Management
- **Current State**: Images stored in Convex backend with real-time sync
- **Solution**: Implement optimistic UI updates with local state, then sync to backend on drag end

## 3. Detailed Implementation Steps

### Step 1: Create SortableMultiImageUpload Component
**File**: `apps/native/components/upload/SortableMultiImageUpload.tsx`

```typescript
// Core structure:
- Import Sortable from 'react-native-sortables'
- Import existing components (ImagePreview, ImageUploadCard)
- Extend MultiImageUploadOptimized props
- Add local state for sortable data management
```

### Step 2: Data Structure Enhancement
```typescript
interface SortableHeadshot extends HeadshotWithUrl {
  id: string; // Unique identifier for sortable
  order: number; // Display order
}
```

### Step 3: Sortable Implementation Strategy

**Option A: Sortable.Flex (Recommended)**
```typescript
<Sortable.Flex gap={16} padding={0}>
  {sortableHeadshots.map((headshot, index) => (
    <View 
      key={headshot.id}
      style={{
        width: index === 0 ? '100%' : '48%',
        marginBottom: index === 0 ? 16 : 0
      }}
    >
      <ImagePreview 
        imageUrl={headshot.url}
        onRemove={() => handleRemoveImage(headshot.storageId)}
      />
    </View>
  ))}
</Sortable.Flex>
```

**Option B: Custom Grid with Dynamic Columns**
```typescript
<Sortable.Grid
  columns={2}
  data={sortableHeadshots}
  renderItem={({ item, index }) => (
    <View style={index === 0 ? fullWidthStyle : halfWidthStyle}>
      <ImagePreview {...} />
    </View>
  )}
  onDragEnd={handleDragEnd}
/>
```

### Step 4: Drag End Handler Implementation
```typescript
const handleDragEnd = useCallback(({ fromIndex, toIndex }) => {
  // 1. Update local state immediately (optimistic update)
  const reorderedImages = [...sortableHeadshots];
  const [movedItem] = reorderedImages.splice(fromIndex, 1);
  reorderedImages.splice(toIndex, 0, movedItem);
  
  // 2. Update order property
  const updatedWithOrder = reorderedImages.map((item, idx) => ({
    ...item,
    order: idx
  }));
  
  setSortableHeadshots(updatedWithOrder);
  
  // 3. Persist to backend
  updateHeadshotOrder({ 
    headshots: updatedWithOrder.map(h => ({
      storageId: h.storageId,
      order: h.order
    }))
  });
}, [sortableHeadshots, updateHeadshotOrder]);
```

### Step 5: Upload Card Integration
Place upload cards after sortable container:
```typescript
<View className="flex-1">
  {/* Sortable images */}
  <Sortable.Flex {...}>
    {sortableHeadshots.map(...)}
  </Sortable.Flex>
  
  {/* Upload cards for remaining slots */}
  {remainingSlots > 0 && (
    <View className="flex-row gap-4 mt-4">
      {Array.from({ length: remainingSlots }).map((_, idx) => (
        <ImageUploadCard 
          key={`upload-${idx}`}
          shape={sortableHeadshots.length === 0 && idx === 0 ? 'primary' : 'secondary'}
          onPress={handleImageUpload}
          isActive={idx === 0}
        />
      ))}
    </View>
  )}
</View>
```

### Step 6: Backend Integration
Add Convex mutation for updating image order:
```typescript
// packages/backend/convex/users/headshots.ts
export const updateHeadshotOrder = mutation({
  args: {
    headshots: v.array(v.object({
      storageId: v.id('_storage'),
      order: v.number()
    }))
  },
  handler: async (ctx, args) => {
    // Update order in database
  }
});
```

## 4. UI/UX Enhancements

### Visual Feedback
- **activeItemScale**: 1.05 (subtle scale on drag)
- **inactiveItemOpacity**: 0.8 (slight fade for other items)
- **dragActivationDelay**: 150ms (quick but prevents accidental drags)

### Optional: Drag Handle
Add a drag handle icon to ImagePreview:
```typescript
<View className="absolute top-2 left-2">
  <Sortable.Handle>
    <GripVertical size={20} className="color-icon-subtle" />
  </Sortable.Handle>
</View>
```

## 5. Complete Implementation Example

### SortableMultiImageUpload.tsx
```typescript
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useState, useEffect, memo } from 'react';
import { Alert, View } from 'react-native';
import Sortable from 'react-native-sortables';

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { ImagePreview } from './ImagePreview';
import { ImageUploadCard } from './ImageUploadCard';
import { ActivityIndicator } from '../ui/activity-indicator';
import { Text } from '../ui/text';

interface SortableHeadshot extends HeadshotWithUrl {
  id: string;
  order: number;
}

export function SortableMultiImageUpload({ onImageCountChange }: MultiImageUploadProps) {
  const [sortableHeadshots, setSortableHeadshots] = useState<SortableHeadshot[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  // Convex mutations and queries
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveHeadshotIds = useMutation(api.users.headshots.saveHeadshotIds);
  const removeHeadshot = useMutation(api.users.headshots.removeHeadshot);
  const updateHeadshotOrder = useMutation(api.users.headshots.updateHeadshotOrder);

  const headshotsMetadata = useQuery(api.users.headshotsOptimized.getMyHeadshotsMetadata);
  const getHeadshotUrls = useQuery(
    api.users.headshotsOptimized.getHeadshotUrls,
    headshotsMetadata ? { storageIds: headshotsMetadata.map((h) => h.storageId) } : 'skip'
  );

  // Update local state when metadata or URLs change
  useEffect(() => {
    if (headshotsMetadata) {
      const updatedHeadshots = headshotsMetadata.map((metadata, index) => {
        const urlData = getHeadshotUrls?.find((u) => u.storageId === metadata.storageId);
        return {
          ...metadata,
          id: metadata.storageId,
          order: metadata.order ?? index,
          url: urlData?.url,
          isLoading: !urlData,
        };
      });
      setSortableHeadshots(updatedHeadshots.sort((a, b) => a.order - b.order));
    }
  }, [headshotsMetadata, getHeadshotUrls]);

  const handleDragEnd = useCallback(({ fromIndex, toIndex }) => {
    const reorderedImages = [...sortableHeadshots];
    const [movedItem] = reorderedImages.splice(fromIndex, 1);
    reorderedImages.splice(toIndex, 0, movedItem);
    
    const updatedWithOrder = reorderedImages.map((item, idx) => ({
      ...item,
      order: idx
    }));
    
    setSortableHeadshots(updatedWithOrder);
    
    // Persist to backend
    updateHeadshotOrder({ 
      headshots: updatedWithOrder.map(h => ({
        storageId: h.storageId,
        order: h.order
      }))
    });
  }, [sortableHeadshots, updateHeadshotOrder]);

  const remainingSlots = Math.max(0, 3 - sortableHeadshots.length);

  return (
    <View className="flex-1 gap-4">
      {/* Sortable images */}
      {sortableHeadshots.length > 0 && (
        <Sortable.Flex 
          gap={16} 
          padding={0}
          onDragEnd={handleDragEnd}
          activeItemScale={1.05}
          inactiveItemOpacity={0.8}
          dragActivationDelay={150}
        >
          {sortableHeadshots.map((headshot, index) => (
            <View 
              key={headshot.id}
              className={index === 0 ? "w-full" : "w-[48%]"}
            >
              {headshot.url ? (
                <ImagePreview 
                  imageUrl={headshot.url}
                  onRemove={() => handleRemoveImage(headshot.storageId)}
                />
              ) : (
                <View className="bg-bg-surface h-[234px] w-full items-center justify-center rounded">
                  <ActivityIndicator size="small" />
                </View>
              )}
            </View>
          ))}
        </Sortable.Flex>
      )}

      {/* Upload cards for remaining slots */}
      {remainingSlots > 0 && (
        <View className={sortableHeadshots.length === 0 ? "gap-4" : "flex-row gap-4"}>
          {Array.from({ length: remainingSlots }).map((_, idx) => (
            <View 
              key={`upload-${idx}`} 
              className={sortableHeadshots.length === 0 && idx === 0 ? "w-full" : "flex-1"}
            >
              <ImageUploadCard 
                shape={sortableHeadshots.length === 0 && idx === 0 ? 'primary' : 'secondary'}
                onPress={handleImageUpload}
                isActive={sortableHeadshots.length === 0 ? idx === 0 : true}
                disabled={uploadState.isUploading}
              />
            </View>
          ))}
        </View>
      )}

      {/* Upload progress and error states remain the same */}
    </View>
  );
}
```

## 6. Performance Optimizations

- **Memoization**: Wrap renderItem in useCallback
- **Lazy Loading**: Only load visible image URLs
- **Optimistic Updates**: Update UI immediately, sync backend async
- **Image Caching**: Leverage expo-image built-in caching

## 7. Edge Cases to Handle

1. **Empty State**: Show regular upload cards when no images
2. **Maximum Images**: Disable sorting when at max capacity
3. **Upload in Progress**: Disable sorting during active uploads
4. **Network Failures**: Rollback optimistic updates on backend error
5. **Rapid Reordering**: Debounce backend updates

## 8. Testing Checklist

- [ ] Drag and drop between all positions
- [ ] First item maintains full-width styling after reorder
- [ ] Upload new images with existing sortable images
- [ ] Remove images during active sort
- [ ] Network interruption during reorder
- [ ] Performance with maximum images (5)
- [ ] Accessibility with screen readers

## 9. File Structure
```
apps/native/components/upload/
├── SortableMultiImageUpload.tsx  (new)
├── MultiImageUploadOptimized.tsx  (existing)
├── ImagePreview.tsx               (modify if adding handle)
├── ImageUploadCard.tsx            (existing)
└── index.ts                       (update exports)
```

## 10. Dependencies & Imports
```typescript
import Sortable from 'react-native-sortables'
import { View, Alert } from 'react-native'
import { useCallback, useState, useEffect, useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'
```

## 11. Implementation Notes

### Why Sortable.Flex over Sortable.Grid?
- **Flexibility**: Allows different widths for first item vs. others
- **Simpler**: No need to handle column spans or complex grid logic
- **Performance**: Better for small lists (3 items max)

### State Synchronization Strategy
1. Local state (`sortableHeadshots`) for immediate UI updates
2. Backend persistence via `updateHeadshotOrder` mutation
3. Real-time sync via Convex subscriptions ensures consistency

### Visual Hierarchy Preservation
- First image always displays full-width regardless of position
- Remaining images display in 48% width (allowing for gap)
- Empty upload cards adapt based on existing images

This implementation provides a complete, production-ready solution for adding sortable functionality to the headshots page while maintaining all existing features and UI patterns.