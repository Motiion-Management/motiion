import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { createContext, useContext, ReactNode } from 'react';

interface SharedUserContextValue {
  user: ReturnType<typeof useQuery<typeof api.users.getMyUser>>;
  isLoading: boolean;
}

const SharedUserContext = createContext<SharedUserContextValue | undefined>(undefined);

export function SharedUserProvider({ children }: { children: ReactNode }) {
  const user = useQuery(api.users.getMyUser);
  const isLoading = user === undefined;

  return (
    <SharedUserContext.Provider value={{ user, isLoading }}>{children}</SharedUserContext.Provider>
  );
}

export function useSharedUser() {
  const context = useContext(SharedUserContext);
  if (!context) {
    throw new Error('useSharedUser must be used within a SharedUserProvider');
  }
  return context;
}

// Helper hook for backwards compatibility
export function useCurrentUser() {
  const { user } = useSharedUser();
  return user;
}
