import React from 'react';

const { createContext, useState } = React;

interface MockUser {
  id: string;
  email: string;
}

interface MockAuthContextType {
  user: MockUser | null;
  session: { access_token: string; user: MockUser } | null;
  loading: boolean;
  hasRegistered: boolean;
  signOut: () => Promise<void>;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

const DEFAULT_USER: MockUser = { id: 'test-user-id', email: 'test@test.com' };

interface MockAuthContextProviderProps {
  children: React.ReactNode;
  user?: MockUser | null;
  loading?: boolean;
}

/**
 * A test wrapper that provides AuthContext without any real Supabase calls.
 *
 * Usage:
 *   <MockAuthContextProvider user={{ id: 'x', email: 'x@test.com' }}>
 *     <MyComponent />
 *   </MockAuthContextProvider>
 */
export const MockAuthContextProvider: React.FC<MockAuthContextProviderProps> = ({
  children,
  user: userOverride,
  loading = false,
}) => {
  const user = userOverride === undefined ? DEFAULT_USER : userOverride;
  const [, setDummy] = useState(0); // force re-render support

  const value: MockAuthContextType = {
    user,
    session: user ? { access_token: 'mock-token', user } : null,
    loading,
    hasRegistered: !!user,
    signOut: async () => { setDummy((n) => n + 1); },
  };

  return React.createElement(MockAuthContext.Provider, { value }, children);
};

export { MockAuthContext, DEFAULT_USER };
export type { MockUser };
