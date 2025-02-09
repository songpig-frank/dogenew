import React from "react";
import { Menu, Moon, Sun, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useThemeStore } from "@/lib/theme";
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

  const menuItems = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Submit", to: "/submit" },
    { label: "AI Help", to: "/ai-help" },
    { label: "Donations", to: "/donations" },
  ];

  const handleDonateClick = () => {
    navigate("/donations");
  };

  return (
    <nav className="w-full h-16 bg-background border-b fixed top-0 left-0 z-50">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="DOGEcuts.org"
              className="h-14 w-14"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://api.dicebear.com/7.x/shapes/svg?seed=dogecuts";
              }}
            />
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
