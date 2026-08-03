import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AppUserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AppUserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile(currentSession: Session | null) {
      if (!currentSession) {
        if (mounted) {
          setProfile(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        let baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
        if (!baseUrl.endsWith("/api/v1")) {
          baseUrl = `${baseUrl}/api/v1`;
        }
        const res = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (mounted) setProfile(data.data || data);
        } else {
          console.error("Failed to fetch profile", res.status);
          if (mounted) setProfile(null);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        fetchProfile(session);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setIsLoading(true);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        fetchProfile(newSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
