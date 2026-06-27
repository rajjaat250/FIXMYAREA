import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { User, Menu, Bell, LogOut, MapPin, Check } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, orderBy, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { useAppContext } from "./app-provider";
import { Sidebar } from "./Sidebar";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Report Issue", href: "/dashboard/report" },
  { name: "All Issues", href: "/dashboard/issues" },
  { name: "Map View", href: "/dashboard/map" },
  { name: "Leaderboard", href: "/dashboard/leaderboard" },
  { name: "My Profile", href: "/dashboard/profile" },
  { name: "AI Assistant", href: "/dashboard/assistant" },
  { name: "Analytics", href: "/dashboard/analytics" },
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [open, setOpen] = useState(false);
  const { user, logout } = useAppContext();
  const isAdmin = user?.email === 'dhariwalraj37@gmail.com' || user?.email === 'admin@demo.com';

  const navItems = isAdmin 
    ? [...navigation, { name: "Admin Panel", href: "/dashboard/admin" }]
    : navigation;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={`block px-2 py-1 text-lg font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? "text-primary font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-xl">FIXMYAREA</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <User className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{user?.displayName || user?.email?.split('@')[0] || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={true}>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAppContext();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const subscribeToNotifications = () => {
      if (user?.email) {
        try {
          const q = query(
            collection(db, "notifications"), 
            where("userEmail", "==", user.email),
            orderBy("createdAt", "desc")
          );
          unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedNotifications = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setNotifications(fetchedNotifications);
          }, (error) => {
            console.error("Error fetching notifications:", error);
          });
        } catch (error) {
          console.error("Error setting up notifications listener:", error);
        }
      }
    };

    subscribeToNotifications();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), { read: true });
      setNotifications(notifications.map(n => n.id === notificationId ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
      <div className="px-6 flex h-16 items-center justify-end">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive"></span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <DropdownMenuItem 
                      key={notif.id} 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => !notif.read && markAsRead(notif.id)}
                    >
                      <div className={`flex flex-col gap-1 ${!notif.read ? 'font-semibold' : 'text-muted-foreground'}`}>
                        <span className="text-sm">{notif.title}</span>
                        <span className="text-xs opacity-80">{notif.message}</span>
                      </div>
                      {!notif.read && <div className="h-2 w-2 bg-primary rounded-full mt-1 flex-shrink-0" />}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "flex gap-2" })}>
              <User className="h-4 w-4" />
              {user?.displayName || user?.email?.split('@')[0] || 'Profile'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={true}>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-muted/20">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <TopBar />
        <main className="flex-1 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}
