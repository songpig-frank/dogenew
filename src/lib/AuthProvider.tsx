import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setSession(data.session);
    setUser(data.user);
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // First check if username is available
      const { data: existingUser } = await supabase
        .from("user_profiles")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUser) {
        throw new Error("Username already taken");
      }

      // Create auth user with username in metadata
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: { username },
          },
        },
      );

      if (signUpError) throw signUpError;

      // Manually create user profile in case the trigger fails
      if (authData.user) {
        try {
          // Try to create the profile with a unique username if needed
          let uniqueUsername = username;
          let counter = 0;
          let profileCreated = false;

          while (!profileCreated && counter < 10) {
            // Limit attempts to avoid infinite loop
            try {
              const { error: upsertError } = await supabase
                .from("user_profiles")
                .upsert({
                  id: authData.user.id,
                  username: uniqueUsername,
                  display_name: username, // Keep original username as display name
                  email: email,
                  created_at: new Date().toISOString(),
                });

              if (!upsertError) {
                profileCreated = true;
                console.log(`Profile created with username: ${uniqueUsername}`);
              } else if (upsertError.code === "23505") {
                // Unique violation
                counter++;
                uniqueUsername = `${username}${counter}`;
                console.log(`Username taken, trying: ${uniqueUsername}`);
              } else {
                throw upsertError;
              }
            } catch (err) {
              if (err.code === "23505") {
                // Unique violation
                counter++;
                uniqueUsername = `${username}${counter}`;
                console.log(`Username taken, trying: ${uniqueUsername}`);
              } else {
                throw err;
              }
            }
          }

          // Also create user role
          await supabase.from("user_roles").upsert({
            user_id: authData.user.id,
            role: "user",
          });
        } catch (profileError) {
          console.warn("Error creating profile manually:", profileError);
          // Continue anyway as the auth user was created
        }
      }

      // Log the successful signup
      console.log("User signed up successfully:", {
        id: authData.user?.id,
        email: authData.user?.email,
        username,
      });

      return authData;
    } catch (error) {
      console.error("Error in signUp:", error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Clear auth state
    setSession(null);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const value = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
