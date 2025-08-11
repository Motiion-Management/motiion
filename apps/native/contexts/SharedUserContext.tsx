import React, { createContext, useContext, ReactNode } from 'react';
import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { UserDoc } from '@packages/backend/convex/validators/users';

export interface SharedUserContextValue {
  user: UserDoc | undefined;
  isLoading: boolean;
}

export const SharedUserContext = createContext<SharedUserContextValue | undefined>(undefined);

export function SharedUserProvider({ children }: { children: ReactNode }) {
  const user = useQuery(api.users.getMyUser) || undefined;
  const isLoading = user === undefined;

  return (
    <SharedUserContext.Provider value={{ user, isLoading }}>{children}</SharedUserContext.Provider>
  );
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
