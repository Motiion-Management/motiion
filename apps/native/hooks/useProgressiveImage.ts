import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { Id } from '@packages/backend/convex/_generated/dataModel';

/**
 * Hook that loads image URLs progressively
 * Returns immediately with placeholder, then loads actual URL
 */
export function useProgressiveImage(storageId: Id<'_storage'> | undefined) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const url = useQuery(api.files.getUrl, storageId ? { storageId } : 'skip');

  useEffect(() => {
    if (url) {
      setImageUrl(url);
    }
  }, [url]);

  return {
    url: imageUrl,
    isLoading: !!storageId && !imageUrl,
  };
}
