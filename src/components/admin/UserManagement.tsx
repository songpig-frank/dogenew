import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Clock,
  Download,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";

const ITEMS_PER_PAGE = 10;

const UserManagement = () => {
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
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState<
    "all" | "blocked" | "active"
  >("all");

  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching users with params:", {
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        role: roleFilter,
        status:
          activeTab === "all"
            ? undefined
            : activeTab === "blocked"
              ? "blocked"
              : "active",
      });

      const result = await fetchUsers({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        role: roleFilter as "admin" | "moderator" | "user" | undefined,
        status:
          activeTab === "all"
            ? undefined
            : activeTab === "blocked"
              ? "blocked"
              : "active",
      });

      console.log("Fetched users result:", result);
      setUsers(result.users);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description:
          "Failed to fetch users: " + (error.message || String(error)),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, roleFilter, activeTab, toast]);

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
      console.log(
        `Blocking user ${selectedUser.id} with reason: ${blockReason}`,
      );

      // Try direct SQL update first as a workaround
      try {
        const { error: directError } = await supabase.rpc("execute_sql", {
          sql_query: `UPDATE public.user_profiles SET blocked = TRUE, blocked_reason = '${blockReason.replace("'", "''")}', blocked_at = NOW() WHERE id = '${selectedUser.id}'`,
        });

        if (directError) {
          console.warn(
            "Direct SQL update failed, trying API method:",
            directError,
          );
          // Fall back to the API method
          await blockUser(selectedUser.id, blockReason);
        } else {
          console.log("Direct SQL update succeeded");
        }
      } catch (directErr) {
        console.warn(
          "Error with direct SQL update, trying API method:",
          directErr,
        );
        // Fall back to the API method
        await blockUser(selectedUser.id, blockReason);
      }

      // Force reload users to get updated data
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
        description:
          "Failed to block user: " + (error.message || String(error)),
        variant: "destructive",
      });
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      console.log(`Unblocking user ${userId}`);
      await unblockUser(userId);

      // Force reload users to get updated data
      await loadUsers();

      toast({
        title: "Success",
        description: "User has been unblocked",
      });
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Error",
        description:
          "Failed to unblock user: " + (error.message || String(error)),
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Find the user to check if they're blocked
      const user = users.find((u) => u.id === userId);

      // Don't allow promoting blocked users
      if (user?.blocked && newRole !== "user") {
        toast({
          title: "Action Failed",
          description: "Cannot promote blocked users",
          variant: "destructive",
        });
        return;
      }

      // Don't change role if it's already the same
      if (user?.role === newRole) {
        toast({
          title: "No Change",
          description: `User already has ${newRole} role`,
        });
        return;
      }

      // Try direct SQL update first as a workaround
      try {
        const { error: directError } = await supabase.rpc("execute_sql", {
          sql_query: `INSERT INTO public.user_roles (user_id, role) VALUES ('${userId}', '${newRole}') ON CONFLICT (user_id) DO UPDATE SET role = '${newRole}'`,
        });

        if (directError) {
          console.warn(
            "Direct SQL update failed for role change, trying API method:",
            directError,
          );
          // Fall back to the API method
          await updateUserRole(userId, newRole);
        } else {
          console.log("Direct SQL update succeeded for role change");
        }
      } catch (directErr) {
        console.warn(
          "Error with direct SQL update for role change, trying API method:",
          directErr,
        );
        // Fall back to the API method
        await updateUserRole(userId, newRole);
      }

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

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleBulkAction = async (
    action: "block" | "unblock" | "promote" | "demote",
  ) => {
    if (selectedUsers.length === 0) return;

    try {
      switch (action) {
        case "block":
          // Implement bulk blocking
          for (const userId of selectedUsers) {
            try {
              // Try direct SQL update first as a workaround
              const { error: directError } = await supabase.rpc("execute_sql", {
                sql_query: `UPDATE public.user_profiles SET blocked = TRUE, blocked_reason = 'Bulk action', blocked_at = NOW() WHERE id = '${userId}'`,
              });

              if (directError) {
                console.warn(
                  "Direct SQL update failed for user",
                  userId,
                  directError,
                );
                await blockUser(userId, "Bulk action");
              }
            } catch (err) {
              console.error(`Error blocking user ${userId}:`, err);
            }
          }
          toast({
            title: "Bulk Action",
            description: `Blocked ${selectedUsers.length} users`,
          });
          break;
        case "unblock":
          // Implement bulk unblocking
          for (const userId of selectedUsers) {
            try {
              await unblockUser(userId);
            } catch (err) {
              console.error(`Error unblocking user ${userId}:`, err);
            }
          }
          toast({
            title: "Bulk Action",
            description: `Unblocked ${selectedUsers.length} users`,
          });
          break;
        case "promote":
          // Implement bulk promotion
          for (const userId of selectedUsers) {
            try {
              // Try direct SQL update first
              const { error: directError } = await supabase.rpc("execute_sql", {
                sql_query: `INSERT INTO public.user_roles (user_id, role) VALUES ('${userId}', 'moderator') ON CONFLICT (user_id) DO UPDATE SET role = 'moderator'`,
              });

              if (directError) {
                console.warn(
                  "Direct SQL update failed for role promotion:",
                  directError,
                );
                await updateUserRole(userId, "moderator");
              }
            } catch (err) {
              console.error(`Error promoting user ${userId}:`, err);
            }
          }
          toast({
            title: "Bulk Action",
            description: `Promoted ${selectedUsers.length} users to moderator`,
          });
          break;
        case "demote":
          // Implement bulk demotion
          for (const userId of selectedUsers) {
            try {
              // Try direct SQL update first
              const { error: directError } = await supabase.rpc("execute_sql", {
                sql_query: `INSERT INTO public.user_roles (user_id, role) VALUES ('${userId}', 'user') ON CONFLICT (user_id) DO UPDATE SET role = 'user'`,
              });

              if (directError) {
                console.warn(
                  "Direct SQL update failed for role demotion:",
                  directError,
                );
                await updateUserRole(userId, "user");
              }
            } catch (err) {
              console.error(`Error demoting user ${userId}:`, err);
            }
          }
          toast({
            title: "Bulk Action",
            description: `Demoted ${selectedUsers.length} users to regular users`,
          });
          break;
      }

      // Clear selection after action
      setSelectedUsers([]);
      await loadUsers();
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} users`,
        variant: "destructive",
      });
    }
  };

  const exportUserData = () => {
    try {
      const dataToExport = users.map((user) => ({
        id: user.id,
        username: user.username || "N/A",
        email: user.email || "N/A",
        role: user.role || "user",
        status: user.blocked ? "blocked" : "active",
        created_at: user.created_at,
      }));

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "user-data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported data for ${users.length} users`,
      });
    } catch (error) {
      console.error("Error exporting user data:", error);
      toast({
        title: "Export Failed",
        description: "Could not export user data",
        variant: "destructive",
      });
    }
  };

  console.log("Current users state:", { users, loading, totalPages });

  if (loading) {
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
          <Button variant="outline" onClick={exportUserData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
        </TabsList>
      </Tabs>

      {selectedUsers.length > 0 && (
        <div className="bg-muted p-4 rounded-md mb-6 flex items-center justify-between">
          <p className="text-sm">{selectedUsers.length} users selected</p>
          <div className="flex gap-2">
            <Select
              defaultValue="promote"
              onValueChange={(value) => {
                if (value === "promote_mod") {
                  // Filter out blocked users
                  const nonBlockedUsers = selectedUsers.filter((userId) => {
                    const user = users.find((u) => u.id === userId);
                    return user && !user.blocked;
                  });

                  if (nonBlockedUsers.length === 0) {
                    toast({
                      title: "Action Failed",
                      description: "Cannot promote blocked users",
                      variant: "destructive",
                    });
                    return;
                  }

                  if (nonBlockedUsers.length < selectedUsers.length) {
                    toast({
                      title: "Note",
                      description: `${selectedUsers.length - nonBlockedUsers.length} blocked users were skipped`,
                    });
                  }

                  // Update only non-blocked users
                  Promise.all(
                    nonBlockedUsers.map(async (userId) => {
                      try {
                        // Try direct SQL update first
                        const { error: directError } = await supabase.rpc(
                          "execute_sql",
                          {
                            sql_query: `INSERT INTO public.user_roles (user_id, role) VALUES ('${userId}', 'moderator') ON CONFLICT (user_id) DO UPDATE SET role = 'moderator'`,
                          },
                        );

                        if (directError) {
                          console.warn(
                            "Direct SQL update failed for moderator promotion:",
                            directError,
                          );
                          await updateUserRole(userId, "moderator");
                        }
                      } catch (err) {
                        console.error(
                          `Error promoting user ${userId} to moderator:`,
                          err,
                        );
                      }
                    }),
                  ).then(() => {
                    if (nonBlockedUsers.length > 0) {
                      toast({
                        title: "Bulk Action",
                        description: `Promoted ${nonBlockedUsers.length} users to moderator`,
                      });
                    }
                    setSelectedUsers([]);
                    loadUsers();
                  });
                } else if (value === "promote_admin") {
                  // Filter out blocked users
                  const nonBlockedUsers = selectedUsers.filter((userId) => {
                    const user = users.find((u) => u.id === userId);
                    return user && !user.blocked;
                  });

                  if (nonBlockedUsers.length === 0) {
                    toast({
                      title: "Action Failed",
                      description: "Cannot promote blocked users",
                      variant: "destructive",
                    });
                    return;
                  }

                  if (nonBlockedUsers.length < selectedUsers.length) {
                    toast({
                      title: "Note",
                      description: `${selectedUsers.length - nonBlockedUsers.length} blocked users were skipped`,
                    });
                  }

                  // Update only non-blocked users
                  Promise.all(
                    nonBlockedUsers.map(async (userId) => {
                      try {
                        // Try direct SQL update first
                        const { error: directError } = await supabase.rpc(
                          "execute_sql",
                          {
                            sql_query: `INSERT INTO public.user_roles (user_id, role) VALUES ('${userId}', 'admin') ON CONFLICT (user_id) DO UPDATE SET role = 'admin'`,
                          },
                        );

                        if (directError) {
                          console.warn(
                            "Direct SQL update failed for admin promotion:",
                            directError,
                          );
                          await updateUserRole(userId, "admin");
                        }
                      } catch (err) {
                        console.error(
                          `Error promoting user ${userId} to admin:`,
                          err,
                        );
                      }
                    }),
                  ).then(() => {
                    if (nonBlockedUsers.length > 0) {
                      toast({
                        title: "Bulk Action",
                        description: `Promoted ${nonBlockedUsers.length} users to admin`,
                      });
                    }
                    setSelectedUsers([]);
                    loadUsers();
                  });
                }
              }}
            >
              <SelectTrigger className="w-[130px]">
                <Shield className="mr-2 h-4 w-4" />
                Promote
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="promote_mod">To Moderator</SelectItem>
                <SelectItem value="promote_admin">To Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select
              defaultValue="demote"
              onValueChange={(value) => {
                if (value === "demote_user") {
                  // Filter users who are not already users
                  const nonUserRoles = selectedUsers.filter((userId) => {
                    const user = users.find((u) => u.id === userId);
                    return user && user.role !== "user";
                  });

                  if (nonUserRoles.length === 0) {
                    toast({
                      title: "Action Failed",
                      description: "All selected users already have user role",
                      variant: "destructive",
                    });
                    return;
                  }

                  if (nonUserRoles.length < selectedUsers.length) {
                    toast({
                      title: "Note",
                      description: `${selectedUsers.length - nonUserRoles.length} users already have user role and were skipped`,
                    });
                  }

                  // Update only users who are not already users
                  Promise.all(
                    nonUserRoles.map(async (userId) => {
                      try {
                        // Try direct SQL update first
                        const { error: directError } = await supabase.rpc(
                          "execute_sql",
                          {
                            sql_query: `INSERT INTO public.user_roles (user_id, role) VALUES ('${userId}', 'user') ON CONFLICT (user_id) DO UPDATE SET role = 'user'`,
                          },
                        );

                        if (directError) {
                          console.warn(
                            "Direct SQL update failed for user demotion:",
                            directError,
                          );
                          await updateUserRole(userId, "user");
                        }
                      } catch (err) {
                        console.error(
                          `Error demoting user ${userId} to user:`,
                          err,
                        );
                      }
                    }),
                  ).then(() => {
                    if (nonUserRoles.length > 0) {
                      toast({
                        title: "Bulk Action",
                        description: `Demoted ${nonUserRoles.length} users to regular users`,
                      });
                    }
                    setSelectedUsers([]);
                    loadUsers();
                  });
                } else if (value === "demote_mod") {
                  // Filter users who are not already moderators and not blocked
                  const eligibleUsers = selectedUsers.filter((userId) => {
                    const user = users.find((u) => u.id === userId);
                    return user && user.role !== "moderator" && !user.blocked;
                  });

                  if (eligibleUsers.length === 0) {
                    toast({
                      title: "Action Failed",
                      description:
                        "No eligible users to change to moderator role",
                      variant: "destructive",
                    });
                    return;
                  }

                  if (eligibleUsers.length < selectedUsers.length) {
                    toast({
                      title: "Note",
                      description: `${selectedUsers.length - eligibleUsers.length} users were skipped (already moderators or blocked)`,
                    });
                  }

                  // Update only eligible users
                  Promise.all(
                    eligibleUsers.map(async (userId) => {
                      try {
                        // Try direct SQL update first
                        const { error: directError } = await supabase.rpc(
                          "execute_sql",
                          {
                            sql_query: `INSERT INTO public.user_roles (user_id, role) VALUES ('${userId}', 'moderator') ON CONFLICT (user_id) DO UPDATE SET role = 'moderator'`,
                          },
                        );

                        if (directError) {
                          console.warn(
                            "Direct SQL update failed for moderator change:",
                            directError,
                          );
                          await updateUserRole(userId, "moderator");
                        }
                      } catch (err) {
                        console.error(
                          `Error changing user ${userId} to moderator:`,
                          err,
                        );
                      }
                    }),
                  ).then(() => {
                    if (eligibleUsers.length > 0) {
                      toast({
                        title: "Bulk Action",
                        description: `Changed ${eligibleUsers.length} users to moderator`,
                      });
                    }
                    setSelectedUsers([]);
                    loadUsers();
                  });
                }
              }}
            >
              <SelectTrigger className="w-[130px]">
                <UserCheck className="mr-2 h-4 w-4" />
                Demote
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="demote_user">To User</SelectItem>
                <SelectItem value="demote_mod">To Moderator</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("block")}
            >
              <UserX className="mr-2 h-4 w-4" />
              Block
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("unblock")}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Unblock
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedUsers([])}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {users.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p>No users found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <Card
                  key={user.id}
                  className={`relative overflow-hidden ${selectedUsers.includes(user.id) ? "border-primary" : ""}`}
                >
                  {user.blocked && (
                    <div className="absolute inset-0 bg-destructive/5 pointer-events-none" />
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                          id={`select-${user.id}`}
                        />
                        <div>
                          <CardTitle className="text-lg">
                            {user.username || user.email || user.id}
                          </CardTitle>
                          {user.email && (
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
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
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">
                          User ID: {user.id}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {user.blocked ? (
                        <div className="space-y-2">
                          <p className="text-sm text-destructive">
                            Blocked:{" "}
                            {new Date(user.blocked_at!).toLocaleString()}
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
          )}

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
