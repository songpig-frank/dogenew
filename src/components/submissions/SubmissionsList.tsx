import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, MessageCircle, Share2, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface Submission {
  id: string;
  title: string;
  description: string;
  category: "Praise" | "Complaint" | "Recommendation";
  likes: number;
  comments: number;
  created_at: string;
}

import { getCategoryColor } from "@/lib/utils";
import { useAuth } from "@/lib/AuthProvider";
import { checkUserLike, toggleLike } from "@/lib/interactions";

const SubmissionsList = () => {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("submissions")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query.eq("archived", false);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSubmissions();
  }, [searchQuery]);

  const { user } = useAuth();

  const [likedSubmissions, setLikedSubmissions] = React.useState<
    Record<string, boolean>
  >({});

  React.useEffect(() => {
    if (user && submissions.length > 0) {
      submissions.forEach(async (submission) => {
        const hasLiked = await checkUserLike(submission.id, user.id);
        setLikedSubmissions((prev) => ({ ...prev, [submission.id]: hasLiked }));
      });
    }
  }, [user, submissions]);

  const handleLike = async (e: React.MouseEvent, submissionId: string) => {
    e.stopPropagation(); // Prevent navigation when clicking like button
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const newLikeState = await toggleLike(submissionId, user.id);
      setLikedSubmissions((prev) => ({
        ...prev,
        [submissionId]: newLikeState,
      }));
      fetchSubmissions();
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Public Submissions</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => navigate("/submit")}>New Submission</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No submissions found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission) => (
            <Card
              key={submission.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/submissions/${submission.id}`)}
            >
              <CardHeader className="space-y-0 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {submission.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Posted by {submission.username || "Anonymous"} •{" "}
                      {new Date(submission.created_at).toLocaleString("en-US", {
                        timeZone: "America/Chicago",
                      })}
                    </p>
                  </div>
                  <Badge className={getCategoryColor(submission.category)}>
                    {submission.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {submission.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={(e) => handleLike(e, submission.id)}
                    >
                      <ThumbsUp
                        className={`h-4 w-4 ${likedSubmissions[submission.id] ? "fill-current" : ""}`}
                      />
                      <span>{submission.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/submissions/${submission.id}?showComments=true`,
                        );
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{submission.comments}</span>
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/submissions/${submission.id}?share=true`);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;
