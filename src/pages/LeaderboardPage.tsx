import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, Award, User } from "lucide-react";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, "reports"));
        const querySnapshot = await getDocs(q);
        const users: Record<string, { points: number, reports: number }> = {};
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const email = data.userEmail || "anonymous";
          if (!users[email]) {
            users[email] = { points: 0, reports: 0 };
          }
          users[email].reports += 1;
          // Gamification points system
          let points = 10; // base points
          if (data.status === "resolved") points += 20; // bonus for resolved
          if (data.upvotes) points += data.upvotes * 5; // bonus for upvotes
          users[email].points += points;
        });

        const sortedLeaderboard = Object.entries(users)
          .map(([email, stats]) => ({ email, ...stats }))
          .sort((a, b) => b.points - a.points);
          
        setLeaderboard(sortedLeaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-700" />;
    return <span className="font-bold text-muted-foreground ml-2">{index + 1}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" /> Community Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">Top contributors making our city better.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Citizens</CardTitle>
          <CardDescription>Earn points by reporting issues and getting them resolved.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Issues Reported</TableHead>
                <TableHead className="text-right">Total Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No data available.
                  </TableCell>
                </TableRow>
              ) : (
                leaderboard.map((user, index) => (
                  <TableRow key={user.email} className={index < 3 ? "bg-muted/30 font-medium" : ""}>
                    <TableCell>{getRankIcon(index)}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      {user.email.split('@')[0]}
                    </TableCell>
                    <TableCell className="text-right">{user.reports}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{user.points}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
