import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, isReady: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const readyFallback = setTimeout(() => {
      if (mounted) setIsReady(true);
    }, 2500);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
      })
      .catch((error) => {
        console.warn("Failed to restore Supabase session", error);
      })
      .finally(() => {
        if (!mounted) return;
        clearTimeout(readyFallback);
        setIsReady(true);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      clearTimeout(readyFallback);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
