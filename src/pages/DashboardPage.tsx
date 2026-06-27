import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  ThumbsUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAppContext } from "@/components/app-provider";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useAppContext();
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    inProgress: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [departmentStats, setDepartmentStats] = useState<
    Record<string, { total: number; resolved: number }>
  >({});

  useEffect(() => {
    const fetchReportsAndStats = async () => {
      try {
        const qAll = query(collection(db, "reports"));
        const allSnapshot = await getDocs(qAll);

        let openCount = 0;
        let resolvedCount = 0;
        let inProgressCount = 0;
        const deptStats: Record<string, { total: number; resolved: number }> =
          {};

        allSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === "resolved") resolvedCount++;
          else if (data.status === "in progress") inProgressCount++;
          else openCount++;

          const dept =
            data.aiAnalysis?.department || data.department || "Unassigned";
          if (!deptStats[dept]) deptStats[dept] = { total: 0, resolved: 0 };
          deptStats[dept].total++;
          if (data.status === "resolved") deptStats[dept].resolved++;
        });

        setDashboardStats({
          total: allSnapshot.size,
          open: openCount,
          resolved: resolvedCount,
          inProgress: inProgressCount,
        });
        setDepartmentStats(deptStats);

        const qRecent = query(
          collection(db, "reports"),
          orderBy("createdAt", "desc"),
          limit(4),
        );
        const recentSnapshot = await getDocs(qRecent);
        const fetchedReports = recentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecentReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportsAndStats();
  }, []);

  const handleUpvote = async (reportId: string) => {
    if (!user) {
      toast.error("Please login to upvote");
      return;
    }
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        upvotes: increment(1),
      });
      toast.success("Thanks for upvoting!");
    } catch (error) {
      console.error("Error upvoting:", error);
      toast.error("Failed to upvote");
    }
  };

  const stats = [
    {
      name: "Total Reports",
      value: dashboardStats.total.toString(),
      icon: AlertCircle,
      change: "All time",
      changeType: "neutral",
    },
    {
      name: "Open Issues",
      value: dashboardStats.open.toString(),
      icon: AlertCircle,
      change: "Requires action",
      changeType: "negative",
    },
    {
      name: "In Progress",
      value: dashboardStats.inProgress.toString(),
      icon: Users,
      change: "Currently working on",
      changeType: "neutral",
    },
    {
      name: "Resolved Issues",
      value: dashboardStats.resolved.toString(),
      icon: CheckCircle2,
      change: "Successfully fixed",
      changeType: "positive",
    },
  ];

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
    try {
      return formatDistanceToNow(
        timestamp.toDate ? timestamp.toDate() : new Date(timestamp),
        { addSuffix: true },
      );
    } catch (e) {
      return "Recently";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back,{" "}
            {user?.displayName?.split(" ")[0] ||
              user?.email?.split("@")[0] ||
              "there"}
            . Here's what's happening in your area.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-4 pr-4 border-r">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
              City Health Score
            </span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${dashboardStats.total === 0 ? "bg-emerald-500" : dashboardStats.resolved / dashboardStats.total > 0.5 ? "bg-emerald-500" : dashboardStats.resolved / dashboardStats.total > 0.2 ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{
                    width: `${dashboardStats.total === 0 ? 100 : Math.max(15, Math.round((dashboardStats.resolved / dashboardStats.total) * 100))}%`,
                  }}
                />
              </div>
              <span className="font-bold text-xl">
                {dashboardStats.total === 0
                  ? 100
                  : Math.max(
                      15,
                      Math.round(
                        (dashboardStats.resolved / dashboardStats.total) * 100,
                      ),
                    )}
                /100
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="hidden md:flex"
          >
            Export PDF
          </Button>
          <Link to="/dashboard/report" className={buttonVariants()}>
            Report New Issue
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p
                className={`text-xs ${stat.changeType === "positive" ? "text-emerald-500" : stat.changeType === "negative" ? "text-rose-500" : "text-muted-foreground"}`}
              >
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest issues reported in your community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex p-4 border rounded-lg gap-4">
                    <Skeleton className="w-16 h-16 rounded-md shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-2 mt-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))
              ) : recentReports.length > 0 ? (
                recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                  >
                    {report.imageUrl && (
                      <Dialog>
                        <DialogTrigger className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity p-0 border-0 outline-none flex items-center justify-center">
                          <img
                            src={report.imageUrl}
                            alt="Report"
                            className="w-full h-full object-cover"
                          />
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl border-none bg-transparent shadow-none p-0 flex justify-center">
                          <img
                            src={report.imageUrl}
                            alt="Report Full Size"
                            className="w-full h-auto max-h-[80vh] rounded-md object-contain"
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                    <div className="space-y-1.5 flex-1 w-full overflow-hidden">
                      <p
                        className="font-medium leading-none truncate"
                        title={report.title || report.type || "Untitled"}
                      >
                        {report.title ||
                          (report.type
                            ? report.type.charAt(0).toUpperCase() +
                              report.type.slice(1).replace("-", " ")
                            : "Untitled Issue")}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {report.location &&
                        typeof report.location === "object" &&
                        "lat" in report.location
                          ? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`
                          : typeof report.location === "string"
                            ? report.location
                            : "Unknown location"}{" "}
                        • {formatDate(report.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpvote(report.id)}
                        className="h-6 px-2 text-xs"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {report.upvotes || 0}
                      </Button>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {report.category}
                      </Badge>
                      <Badge
                        className={`whitespace-nowrap ${
                          report.status === "resolved"
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white capitalize"
                            : report.status === "in progress"
                              ? "bg-amber-500 hover:bg-amber-600 text-white capitalize"
                              : "bg-rose-500 hover:bg-rose-600 text-white capitalize"
                        }`}
                      >
                        {report.status || "Open"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity found.
                </div>
              )}
            </div>
            <Link
              to="/dashboard/issues"
              className={buttonVariants({
                variant: "outline",
                className: "w-full mt-4",
              })}
            >
              View All Issues
            </Link>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Issue resolution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              ) : Object.keys(departmentStats).length > 0 ? (
                Object.entries(departmentStats)
                  .sort((a, b) => b[1].total - a[1].total)
                  .slice(0, 5)
                  .map(([dept, stats]) => {
                    const ratio =
                      stats.total > 0
                        ? Math.round((stats.resolved / stats.total) * 100)
                        : 0;
                    return (
                      <div key={dept} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium truncate pr-4">
                            {dept}
                          </span>
                          <span className="text-muted-foreground whitespace-nowrap">
                            {stats.resolved}/{stats.total} resolved
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${ratio > 70 ? "bg-emerald-500" : ratio > 30 ? "bg-amber-500" : "bg-rose-500"}`}
                            style={{ width: `${Math.max(5, ratio)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No department data available yet.
                </div>
              )}
            </div>
            <Link
              to="/dashboard/assistant"
              className={buttonVariants({
                variant: "ghost",
                className: "w-full mt-4 text-primary",
              })}
            >
              Ask AI Assistant
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
