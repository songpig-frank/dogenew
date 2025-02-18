import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Pagination } from "@/components/ui/pagination";
import UserStatsCard from "./UserStatsCard";
import {
  fetchUsers,
  blockUser,
  unblockUser,
  updateUserRole,
  getUserStats,
} from "@/lib/api/users";
import type { UserWithRole, UserStats } from "@/lib/types/user";

const ITEMS_PER_PAGE = 10;

import { setupTables } from "@/lib/setupTables";

const UserManagement = () => {
  React.useEffect(() => {
    setupTables().then((result) => {
      if (!result.success) {
        console.error("Error setting up tables:", result.error);
      }
    });
  }, []);
  const { toast } = useToast();
  const [users, setUsers] = React.useState<UserWithRole[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showBlockDialog, setShowBlockDialog] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserWithRole | null>(
    null,
  );
  const [selectedUserStats, setSelectedUserStats] =
    React.useState<UserStats | null>(null);
  const [blockReason, setBlockReason] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [statsLoading, setStatsLoading] = React.useState(false);

  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchUsers({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        role: roleFilter as "admin" | "moderator" | "user" | undefined,
      });

      setUsers(result.users);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, roleFilter, toast]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadUserStats = async (userId: string) => {
    try {
      setStatsLoading(true);
      const stats = await getUserStats(userId);
      setSelectedUserStats(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user statistics",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!selectedUser || !blockReason.trim()) return;

    try {
      await blockUser(selectedUser.id, blockReason);
      await loadUsers();
      setShowBlockDialog(false);
      setBlockReason("");
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User has been blocked",
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await unblockUser(userId);
      await loadUsers();
      toast({
        title: "Success",
        description: "User has been unblocked",
      });
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      await loadUsers();
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleSearch = React.useCallback(
    (value: string) => {
      setSearchQuery(value);
      setPage(1); // Reset to first page when searching
    },
    [setSearchQuery, setPage],
  );

  const handleRoleFilter = React.useCallback(
    (value: string) => {
      setRoleFilter(value);
      setPage(1); // Reset to first page when filtering
    },
    [setRoleFilter, setPage],
  );

  if (loading && users.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id} className="relative overflow-hidden">
                {user.blocked && (
                  <div className="absolute inset-0 bg-destructive/5 pointer-events-none" />
                )}
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {user.username || user.email || user.id}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          user.role === "admin" ? "destructive" : "secondary"
                        }
                        className="cursor-pointer"
                        onClick={() =>
                          handleRoleChange(
                            user.id,
                            user.role === "admin" ? "moderator" : "admin",
                          )
                        }
                      >
                        {user.role || "user"}
                      </Badge>
                      {user.blocked && (
                        <Badge variant="destructive">Blocked</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      User ID: {user.id}
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
                          onClick={() => handleUnblock(user.id)}
                        >
                          Unblock User
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadUserStats(user.id)}
                        >
                          View Stats
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          {selectedUserStats && (
            <UserStatsCard stats={selectedUserStats} isLoading={statsLoading} />
          )}
        </div>
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
