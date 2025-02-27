export interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  email?: string;
  is_anonymous?: boolean;
  created_at: string;
  blocked?: boolean;
  blocked_reason?: string;
  blocked_at?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  submission_id: string;
  status: "pending" | "approved" | "rejected";
  is_anonymous: boolean;
  username?: string;
  email?: string;
  upvotes: number;
  downvotes: number;
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  category: "Praise" | "Complaint" | "Recommendation";
  user_id: string;
  username?: string;
  email?: string;
  is_anonymous: boolean;
  status: "pending" | "approved" | "rejected";
  likes: number;
  comments: number;
  created_at: string;
}
