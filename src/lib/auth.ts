import { supabase } from "./supabase";

export const signInWithEmailOrUsername = async (
  emailOrUsername: string,
  password: string,
) => {
  // First try to find user by username
  if (!emailOrUsername.includes("@")) {
    const { data: userData } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("username", emailOrUsername)
      .single();

    if (userData) {
      // Get user's email using their ID
      const { data: authData } = await supabase
        .from("auth.users")
        .select("email")
        .eq("id", userData.id)
        .single();

      if (authData?.email) {
        return supabase.auth.signInWithPassword({
          email: authData.email,
          password,
        });
      }
    }
  }

  // If no username found or input is an email, try email login
  return supabase.auth.signInWithPassword({
    email: emailOrUsername,
    password,
  });
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};
