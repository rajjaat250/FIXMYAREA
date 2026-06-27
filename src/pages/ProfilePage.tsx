import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Star, FileText } from "lucide-react";
import { useAppContext } from "@/components/app-provider";

export default function ProfilePage() {
  const { user } = useAppContext();
  const [stats, setStats] = useState({ reported: 0, resolved: 0, upvoted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "reports"), where("userEmail", "==", user.email || ''));
        const querySnapshot = await getDocs(q);
        
        let reported = 0;
        let resolved = 0;
        let upvoted = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          reported++;
          if (data.status === "resolved") resolved++;
          upvoted += (data.upvotes || 0);
        });

        setStats({ reported, resolved, upvoted });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  const getBadges = () => {
    const badges = [];
    if (stats.reported >= 1) badges.push({ name: "First Step", icon: <Award className="w-5 h-5 text-amber-600" />, desc: "Reported your first issue" });
    if (stats.reported >= 5) badges.push({ name: "Active Citizen", icon: <Star className="w-5 h-5 text-blue-500" />, desc: "Reported 5+ issues" });
    if (stats.reported >= 20) badges.push({ name: "Top Reporter", icon: <Trophy className="w-5 h-5 text-yellow-500" />, desc: "Reported 20+ issues" });
    
    if (stats.resolved >= 1) badges.push({ name: "Problem Solver", icon: <Medal className="w-5 h-5 text-emerald-500" />, desc: "Had 1 issue resolved" });
    if (stats.resolved >= 10) badges.push({ name: "Community Hero", icon: <Trophy className="w-5 h-5 text-purple-500" />, desc: "Had 10+ issues resolved" });

    if (stats.upvoted >= 10) badges.push({ name: "Influencer", icon: <Star className="w-5 h-5 text-pink-500" />, desc: "Received 10+ upvotes" });
    
    return badges;
  };

  const badges = getBadges();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">View your impact on the community.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback className="text-2xl">{user?.displayName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <CardTitle className="text-2xl">{user?.displayName || "Citizen"}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4"/> Issues Reported</span>
                <span className="font-bold">{loading ? "..." : stats.reported}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><Medal className="w-4 h-4"/> Issues Resolved</span>
                <span className="font-bold text-emerald-500">{loading ? "..." : stats.resolved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><Star className="w-4 h-4"/> Total Upvotes</span>
                <span className="font-bold text-blue-500">{loading ? "..." : stats.upvoted}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" /> My Badges
            </CardTitle>
            <CardDescription>Earn badges by reporting issues and getting them resolved.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading badges...</div>
            ) : badges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.map((badge, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/20">
                    <div className="p-2 bg-background rounded-full border shadow-sm">
                      {badge.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <div className="flex justify-center mb-4">
                  <Award className="w-12 h-12 text-muted-foreground opacity-20" />
                </div>
                <h3 className="font-medium text-lg mb-1">No badges yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">Start reporting issues in your community to earn your first badge!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
