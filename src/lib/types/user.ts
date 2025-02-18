export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  created_at: string;
  blocked?: boolean;
  blocked_reason?: string;
  blocked_at?: string | null;
}

export interface UserRole {
  user_id: string;
  role: "admin" | "moderator" | "user";
}

export interface UserWithRole extends UserProfile {
  role?: "admin" | "moderator" | "user";
}

export interface UserStats {
  total_submissions: number;
  total_comments: number;
  total_likes: number;
}
