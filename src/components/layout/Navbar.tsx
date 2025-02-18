import React from "react";
import Logo from "./Logo";
import { Menu, Moon, Sun, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useThemeStore } from "@/lib/theme";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const { user, signOut, signIn } = useAuth();
  const [adminLoading, setAdminLoading] = React.useState(false);
  const [adminError, setAdminError] = React.useState<string | null>(null);

  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error checking admin status:", error);
          return;
        }

        const isAdminOrMod =
          data?.some((r) => ["admin", "moderator"].includes(r.role)) || false;
        console.log("User roles:", data, "Is admin/mod:", isAdminOrMod);
        setIsAdmin(isAdminOrMod);
      } catch (err) {
        console.error("Error in checkAdminStatus:", err);
      }
    };
    checkAdminStatus();
  }, [user]);

  const menuItems = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Submit", to: "/submit" },
    { label: "Submissions", to: "/submissions" },
    { label: "AI Help", to: "/ai-help" },
    { label: "Donations", to: "/donations" },
    ...(isAdmin ? [{ label: "Admin Dashboard", to: "/admin" }] : []),
  ];

  const handleDonateClick = () => {
    navigate("/donations");
  };

  return (
    <nav className="w-full h-16 bg-background border-b fixed top-0 left-0 z-50">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-xl hidden sm:inline">
              DOGEcuts.org
            </span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to={item.to}>{item.label}</Link>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                {menuItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      asChild
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    >
                      <Link to={item.to}>{item.label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="outline"
            onClick={async () => {
              try {
                setAdminLoading(true);
                setAdminError(null);
                const { error: signInError } =
                  await supabase.auth.signInWithPassword({
                    email: "super_admin@dogecuts.org",
                    password: "Wd5gks22%%",
                  });
                if (signInError) throw signInError;
                navigate("/admin");
              } catch (err) {
                console.error("Admin login error:", err);
                setAdminError(
                  err instanceof Error ? err.message : "Login failed",
                );
              } finally {
                setAdminLoading(false);
              }
            }}
            className="mr-2"
            disabled={adminLoading}
          >
            {adminLoading ? "Logging in..." : "Quick Admin Login"}
            {adminError && (
              <span className="ml-2 text-xs text-destructive">
                {adminError}
              </span>
            )}
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.user_metadata?.username || user.email}
              </span>
              <Button
                variant="destructive"
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Button>
          )}
          <Button
            onClick={handleDonateClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Donate
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
