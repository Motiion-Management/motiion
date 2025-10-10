import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { api } from '@packages/backend/convex/_generated/api';
import { useConvexAuth, useQuery } from 'convex/react';
import { UserDoc } from '@packages/backend/convex/schemas/users';

export interface SharedUserContextValue {
  user: UserDoc | null | undefined;
  isLoading: boolean;
}

export const SharedUserContext = createContext<SharedUserContextValue | undefined>(undefined);

export function SharedUserProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const shouldFetchUser = isAuthenticated && !authLoading;

  const user = useQuery(api.users.users.getMyUser, shouldFetchUser ? undefined : 'skip');

  const isLoading = authLoading || (shouldFetchUser && user === undefined);

  const value = useMemo<SharedUserContextValue>(
    () => ({ user: user ?? null, isLoading }),
    [isLoading, user]
  );

  return <SharedUserContext.Provider value={value}>{children}</SharedUserContext.Provider>;
}

export function useSharedUser() {
  const context = useContext(SharedUserContext);
  if (!context) {
    throw new Error('useSharedUser must be used within SharedUserProvider');
  }
  return context;
}

// Backwards-compatible helper to access only the user
export function useCurrentUser() {
  const { user } = useSharedUser();
  return user;
}
