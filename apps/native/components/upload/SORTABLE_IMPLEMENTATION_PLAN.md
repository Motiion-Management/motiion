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

### Challenge C: State Management & Schema Support
- **Current State**: Images stored in Convex backend with real-time sync. Schema today does not track explicit item order.
- **Preferred Solution (Chosen)**: Add a persistent `position` field to each headshot item so order is explicit, durable, and independent of array mutations.
- **Alternative**: Skip the field and persist ordering by reordering the array only. This works but is less explicit and can be brittle across writers. The rest of this plan assumes the `position` field approach; see Section 6 for both options.

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
// Use storageId as the stable key and track an explicit position
type SortableHeadshot = HeadshotWithUrl & {
  id: string; // storageId
  position: number;
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
  const updated = next.map((item, idx) => ({ ...item, position: idx }));
  setSortableHeadshots(updated);

  // 2) Persist to backend; rollback on failure
  updateHeadshotPosition({
    headshots: updated.map(h => ({ storageId: h.storageId, position: h.position }))
  }).catch(() => {
    setSortableHeadshots(prev);
    Alert.alert('Reorder failed', 'Your order change could not be saved.');
  });
}, [sortableHeadshots, updateHeadshotPosition]);
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

### Step 6: Backend Integration (Add Explicit Position Field)
Persist and query an explicit `position` field for each headshot so ordering is stable and intentional.

Schema changes:
- File: `packages/backend/convex/validators/base.ts`
  - Update `zFileUploadObject` to add `position: z.number().optional()` (optional for migration safety; write it going forward).
- File: `packages/backend/convex/validators/users.ts`
  - No schema shape changes beyond the updated `zFileUploadObject`; continue to use `zFileUploadObjectArray` in user fields.

Write-path updates:
- File: `packages/backend/convex/users/headshots.ts`
  - In `saveHeadshotIds`, assign `position` for any newly added items (e.g., recompute by array index after merging), ensuring positions are contiguous starting at 0.
  - In `removeHeadshot`, after removing, recompute positions to remain contiguous.
  - Add a new mutation `updateHeadshotPosition` that accepts `{ headshots: { storageId, position }[] }` and rewrites the user’s `headshots` array with updated positions (payload-first by `position`, then remaining items), also normalizing positions to `0..n-1`.

Read-path updates:
- File: `packages/backend/convex/users/headshotsOptimized.ts`
  - In `getMyHeadshotsMetadata`, return `position` and default to index when absent.
  - The client should sort by `position ?? index` before rendering.
```typescript
// packages/backend/convex/users/headshots.ts
export const updateHeadshotPosition = authMutation({
  args: {
    headshots: v.array(v.object({
      storageId: v.id('_storage'),
      position: v.number()
    }))
  },
  handler: async (ctx, { headshots }) => {
    if (!ctx.user) return
    const current = ctx.user.headshots || []

    // Map incoming position by storageId
    const posMap = new Map(headshots.map(h => [h.storageId, h.position]))

    // Rebuild list: first all in payload ordered by position, then the rest (stable)
    const inPayload = current
      .filter(h => posMap.has(h.storageId))
      .sort((a, b) => (posMap.get(a.storageId)! - posMap.get(b.storageId)!))

    const remaining = current.filter(h => !posMap.has(h.storageId))

    const next = [...inPayload, ...remaining].map((h, idx) => ({ ...h, position: idx }))
    await ctx.db.patch(ctx.user._id, { headshots: next })
  }
})

// Ensure saveHeadshotIds writes `position` (e.g., recompute by array index after merging)

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
      position: h.position ?? index
    }))
  }
})
```

Migration note: for existing users without `position`, default to the current array index and write `position` on the next mutation touching headshots (e.g., in `saveHeadshotIds`) or via a dedicated maintenance job.

Alternative (Array Reorder Only):
- Skip adding `position` to the schema. Instead, persist the array in the desired order in `updateHeadshotOrder({ storageIds: Id<'_storage'>[] })` and patch `users.headshots` with the re-ordered list. This avoids schema changes but makes order implicit and may be fragile with concurrent writers.

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
2. Persist order via `updateHeadshotPosition` mutation (explicit `position` field)
3. Convex queries return `position`; client sorts by `position` (fallback to index) to render

### Visual Hierarchy Preservation
- First image displays full-width (index 0 after sort)
- Remaining images use `flex-1` in a row with `gap-4`
- Upload cards fill to 3 total; primary shape if no images

This plan updates the existing component to support drag-and-drop sorting, adds explicit sort order in the backend, and preserves current UX and upload behavior.
