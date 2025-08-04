import React, { createContext, useContext, ReactNode } from 'react';
import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';

type User = ReturnType;

export interface SharedUserContextValue {
  user: User;
  isLoading: boolean;
}

export const SharedUserContext = createContext<SharedUserContextValue | undefined>(undefined);

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
    throw new Error('useSharedUser must be used within SharedUserProvider');
  }
  return context;
}
