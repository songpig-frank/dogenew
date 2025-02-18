import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface UserRole {
  user_id: string;
  role: "admin" | "moderator";
  email?: string;
  username?: string;
  blocked?: boolean;
  blocked_reason?: string;
  blocked_at?: string;
}

const UserManagement = () => {
  const [users, setUsers] = React.useState<UserRole[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showBlockDialog, setShowBlockDialog] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserRole | null>(null);
  const [blockReason, setBlockReason] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const fetchUsers = async () => {
    try {
      // First get all users with roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("*");

      if (roleError) throw roleError;

      // Then get user details including block status
      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("id, username, email, blocked, blocked_reason, blocked_at");

      if (userError) throw userError;

      // Combine the data
      const combinedData = roleData.map((role) => {
        const userDetails = userData.find((u) => u.id === role.user_id);
        return {
          ...role,
          username: userDetails?.username,
          email: userDetails?.email,
          blocked: userDetails?.blocked,
          blocked_reason: userDetails?.blocked_reason,
          blocked_at: userDetails?.blocked_at,
        };
      });

      // Filter by search query if present
      const filteredData = searchQuery
        ? combinedData.filter(
            (user) =>
              user.username
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.user_id.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : combinedData;

      setUsers(filteredData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const handleBlock = async () => {
    if (!selectedUser || !blockReason.trim()) return;

    try {
      // Update user_profiles table
      const { error: blockError } = await supabase
        .from("user_profiles")
        .update({
          blocked: true,
          blocked_reason: blockReason,
          blocked_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.user_id);

      if (blockError) throw blockError;

      // Archive all user's submissions
      const { error: archiveError } = await supabase
        .from("submissions")
        .update({ archived: true })
        .eq("user_id", selectedUser.user_id);

      if (archiveError) throw archiveError;

      await fetchUsers();
      setShowBlockDialog(false);
      setBlockReason("");
      setSelectedUser(null);
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user");
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          blocked: false,
          blocked_reason: null,
          blocked_at: null,
        })
        .eq("id", userId);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Failed to unblock user");
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "moderator",
  ) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update user role");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={`${user.user_id}-${user.role}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {user.username || user.email || user.user_id}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      user.role === "admin" ? "destructive" : "secondary"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      handleRoleChange(
                        user.user_id,
                        user.role === "admin" ? "moderator" : "admin",
                      )
                    }
                  >
                    {user.role}
                  </Badge>
                  {user.blocked && <Badge variant="destructive">Blocked</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  User ID: {user.user_id}
                </p>
                {user.blocked ? (
                  <div className="space-y-2">
                    <p className="text-sm text-destructive">
                      Blocked: {new Date(user.blocked_at!).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reason: {user.blocked_reason}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(user.user_id)}
                    >
                      Unblock User
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowBlockDialog(true);
                    }}
                  >
                    Block User
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              This will block the user and archive all their submissions. Their
              content will remain visible but they won't be able to make new
              submissions or comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Textarea
              placeholder="Enter reason for blocking"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              className="bg-destructive text-destructive-foreground"
            >
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
