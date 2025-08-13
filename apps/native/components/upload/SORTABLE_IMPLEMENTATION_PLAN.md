# Implementation Plan: Add Sorting To Existing MultiImageUploadOptimized

## 1. Architecture Overview
Enhance the existing `MultiImageUploadOptimized` to support drag-and-drop reordering of uploaded images while preserving the current UI (first card full width, next two side-by-side) and the existing upload/remove flows. Sorting applies only to uploaded images; upload cards render separately.

## 2. Key Implementation Challenges & Solutions

### Challenge A: Different Layout for First Item
- **Current State**: First image is full-width, remaining images are in a 2-column grid
- **Solution**: Use **Sortable.Flex** instead of Grid for maximum flexibility, allowing custom layouts per position
- **Alternative**: Custom renderItem that applies different styles based on index

### Challenge B: Mixed Content Types
- **Current State**: Mix of ImagePreview components (uploaded images) and ImageUploadCard (empty slots)
- **Solution**: Only include uploaded images in sortable container; render upload cards separately to fill remaining slots up to 3.

### Challenge C: State Management
- **Current State**: Images stored in Convex backend with real-time sync
- **Solution**: Implement optimistic UI updates with local state, then sync to backend on drag end

## 3. Detailed Implementation Steps

### Step 1: Modify Existing Component
**File**: `apps/native/components/upload/MultiImageUploadOptimized.tsx`

```typescript
// Core changes:
- Import Sortable from 'react-native-sortables'
- Derive `sortableImages` from current `headshotsWithUrls` (uploaded only)
- Wrap rendered uploaded images in <Sortable.Flex/>, keep upload cards after
- Add `onDragEnd` to update local order optimistically and persist to backend
- Disable sorting during uploads with `sortEnabled={!uploadState.isUploading}`
```

### Step 2: Data Structure Enhancement
```typescript
// Use storageId as the stable key and track order explicitly
type SortableHeadshot = HeadshotWithUrl & {
  id: string; // storageId
  order: number;
}
```

### Step 3: Sortable Implementation Strategy

**Sortable Container (Recommended)**
```typescript
<Sortable.Flex
  gap={16}
  padding={0}
  sortEnabled={!uploadState.isUploading}
  onDragEnd={handleDragEnd}
  activeItemScale={1.05}
  inactiveItemOpacity={0.8}
  dragActivationDelay={150}
>
  {sortableHeadshots.map((headshot, index) => (
    <View key={headshot.id} className={index === 0 ? 'w-full' : 'flex-1'}>
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
```

### Step 4: Drag End Handler Implementation
```typescript
const handleDragEnd = useCallback(({ fromIndex, toIndex }) => {
  if (fromIndex === toIndex) return;

  // 1) Optimistic local reorder
  const prev = sortableHeadshots;
  const next = [...prev];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  const updated = next.map((item, idx) => ({ ...item, order: idx }));
  setSortableHeadshots(updated);

  // 2) Persist to backend; rollback on failure
  updateHeadshotOrder({
    headshots: updated.map(h => ({ storageId: h.storageId, order: h.order }))
  }).catch(() => {
    setSortableHeadshots(prev);
    Alert.alert('Reorder failed', 'Your order change could not be saved.');
  });
}, [sortableHeadshots, updateHeadshotOrder]);
```

### Step 5: Upload Card Integration
Place upload cards after sortable container:
```typescript
<View className="flex-1">
  {/* Sortable images */}
  {/* ...Sortable.Flex as above... */}

  {/* Upload cards to fill remaining slots (to 3) */}
  {remainingSlots > 0 && (
    <View className={sortableHeadshots.length === 0 ? 'gap-4 mt-4' : 'flex-row gap-4 mt-4'}>
      {Array.from({ length: remainingSlots }).map((_, idx) => (
        <View key={`upload-${idx}`} className={sortableHeadshots.length === 0 && idx === 0 ? 'w-full' : 'flex-1'}>
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
</View>
```

### Step 6: Backend Integration (Add Explicit Sort Order)
Persist and query an explicit `order` field for each headshot. Keep the array as the single source of truth, but make order explicit for clarity and migration.
```typescript
// packages/backend/convex/users/headshots.ts
export const updateHeadshotOrder = authMutation({
  args: {
    headshots: v.array(v.object({
      storageId: v.id('_storage'),
      order: v.number()
    }))
  },
  handler: async (ctx, { headshots }) => {
    if (!ctx.user) return
    const current = ctx.user.headshots || []

    // Map incoming order by storageId
    const orderMap = new Map(headshots.map(h => [h.storageId, h.order]))

    // Rebuild sorted list: first all that are in payload, then the rest (stable)
    const inPayload = current
      .filter(h => orderMap.has(h.storageId))
      .sort((a, b) => (orderMap.get(a.storageId)! - orderMap.get(b.storageId)!))
      .map((h, idx) => ({ ...h, order: idx }))

    const remaining = current
      .filter(h => !orderMap.has(h.storageId))
      .map((h, idx) => ({ ...h, order: inPayload.length + idx }))

    const next = [...inPayload, ...remaining]
    await ctx.db.patch(ctx.user._id, { headshots: next })
  }
})

// Also ensure saveHeadshotIds writes an `order` number (e.g., recompute by array index)

// packages/backend/convex/users/headshotsOptimized.ts
export const getMyHeadshotsMetadata = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .unique()
    const list = user?.headshots ?? []
    return list.map((h, index) => ({
      id: `headshot-${index}`,
      storageId: h.storageId,
      title: h.title,
      uploadDate: h.uploadDate,
      order: h.order ?? index
    }))
  }
})
```

Migration note: for existing users without `order`, default to the current array index and write `order` on next mutation touching headshots (e.g., in `saveHeadshotIds` or a dedicated migration).

## 4. UI/UX Enhancements

### Visual Feedback
- **activeItemScale**: 1.05 (subtle scale on drag)
- **inactiveItemOpacity**: 0.8 (slight fade for other items)
- **dragActivationDelay**: 150ms (quick but prevents accidental drags)

### Optional: Drag Handle
Add a drag handle icon to ImagePreview and enable `customHandle` on the container:
```typescript
<Sortable.Flex customHandle {...otherProps}>
  {/* ... */}
  <View className="absolute top-2 left-2">
    <Sortable.Handle>
      <GripVertical size={20} className="color-icon-subtle" />
    </Sortable.Handle>
  </View>
  {/* ... */}
</Sortable.Flex>
```

## 5. Complete Implementation Example

### Complete Example: Changes Inside MultiImageUploadOptimized
Keep existing upload/remove logic. Focus changes on rendering and ordering. See snippets above for `Sortable.Flex`, `handleDragEnd`, and upload card placement.

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
5. **Rapid Reordering**: Debounce backend updates (optional; or rely on latest write wins)

## 8. Testing Checklist

- [ ] Drag and drop between all positions
- [ ] First item maintains full-width styling after reorder
- [ ] Upload new images with existing sortable images
- [ ] Remove images during active sort
- [ ] Network interruption during reorder
- [ ] Performance with maximum images (5)
- [ ] Accessibility with screen readers

## 9. File Structure
No new components. Modify the existing file only.
```
apps/native/components/upload/
├── MultiImageUploadOptimized.tsx  (modified)
├── ImagePreview.tsx               (optional: add handle UI)
├── ImageUploadCard.tsx            (existing)
└── index.ts                       (unchanged)
```

## 10. Dependencies & Imports
```typescript
import Sortable from 'react-native-sortables'
import { View, Alert } from 'react-native'
import { useCallback, useMemo, useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
```

## 11. Implementation Notes

### Why Sortable.Flex over Sortable.Grid?
- **Flexibility**: Allows different widths for first item vs. others
- **Simpler**: No need to handle column spans or complex grid logic
- **Performance**: Better for small lists (3 items max)

### State Synchronization Strategy
1. Local state (`headshotsWithUrls` → derive `sortableHeadshots`) updates immediately
2. Persist order via `updateHeadshotOrder` mutation (explicit `order` field)
3. Convex queries return `order`; client sorts by `order` to render

### Visual Hierarchy Preservation
- First image displays full-width (index 0 after sort)
- Remaining images use `flex-1` in a row with `gap-4`
- Upload cards fill to 3 total; primary shape if no images

This plan updates the existing component to support drag-and-drop sorting, adds explicit sort order in the backend, and preserves current UX and upload behavior.
