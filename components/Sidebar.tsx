import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  FileText, 
  Map as MapIcon, 
  Bot, 
  BarChart3, 
  ChevronLeft, 
  Menu,
  MapPin,
  Settings,
  Trophy,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/components/app-provider";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Report Issue", href: "/dashboard/report", icon: FileText },
  { name: "All Issues", href: "/dashboard/issues", icon: FileText },
  { name: "Map View", href: "/dashboard/map", icon: MapIcon },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "My Profile", href: "/dashboard/profile", icon: User },
  { name: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAppContext();
  const isAdmin = user?.email === 'dhariwalraj37@gmail.com' || user?.email === 'admin@demo.com';

  const navItems = isAdmin 
    ? [...navigation, { name: "Admin Panel", href: "/dashboard/admin", icon: Settings }]
    : navigation;

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isExpanded ? 240 : 72 
      }}
      className="h-screen sticky top-0 border-r bg-card flex flex-col z-40"
    >
      <div className="flex items-center h-16 px-4 border-b shrink-0 justify-between">
        <AnimatePresence mode="popLayout">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
            >
              <MapPin className="h-6 w-6 text-primary shrink-0" />
              <span className="font-display font-bold text-lg">FIXMYAREA <span className="text-primary">AI</span></span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0"
        >
          {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center rounded-md transition-colors relative h-10",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isExpanded ? "px-3" : "justify-center"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5 shrink-0", isExpanded && "mr-3")} />
                <AnimatePresence mode="popLayout">
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>
      
    </motion.aside>
  );
}
