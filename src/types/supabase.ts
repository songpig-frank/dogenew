export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      submissions: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          category: "Praise" | "Complaint" | "Recommendation";
          media_url?: string;
          user_id?: string;
          likes: number;
          comments: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
          category: "Praise" | "Complaint" | "Recommendation";
          media_url?: string;
          user_id?: string;
          likes?: number;
          comments?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          category?: "Praise" | "Complaint" | "Recommendation";
          media_url?: string;
          user_id?: string;
          likes?: number;
          comments?: number;
        };
      };
    };
  };
}
