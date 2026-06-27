import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import {
  MapPin,
  AlertCircle,
  ThumbsUp,
  AlertTriangle,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/components/app-provider";

export default function AllIssuesPage() {
  const { user } = useAppContext();
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const q = query(
          collection(db, "reports"),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const fetchedIssues = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setIssues(fetchedIssues);
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIssues();
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
      setIssues(
        issues.map((issue) =>
          issue.id === reportId
            ? { ...issue, upvotes: (issue.upvotes || 0) + 1 }
            : issue,
        ),
      );
      toast.success("Thanks for upvoting!");
    } catch (error) {
      console.error("Error upvoting:", error);
      toast.error("Failed to upvote");
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      (issue.title &&
        String(issue.title).toLowerCase().includes(searchLower)) ||
      (issue.description &&
        String(issue.description).toLowerCase().includes(searchLower)) ||
      (issue.type && String(issue.type).toLowerCase().includes(searchLower));

    const matchesCategory =
      categoryFilter === "all" ||
      (issue.category &&
        String(issue.category).toLowerCase() === categoryFilter.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (issue.status &&
        String(issue.status).toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          All Issues
        </h1>
        <p className="text-muted-foreground mt-1">
          View and support issues reported by the community.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Input
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="infrastructure">Infrastructure</SelectItem>
            <SelectItem value="sanitation">Sanitation</SelectItem>
            <SelectItem value="lighting">Lighting</SelectItem>
            <SelectItem value="water">Water</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="flex flex-col">
                <Skeleton className="h-48 w-full rounded-t-lg rounded-b-none" />
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))
          : filteredIssues.map((issue) => (
              <Card key={issue.id} className="flex flex-col">
                {issue.imageUrl && (
                  <Dialog>
                    <DialogTrigger className="h-48 w-full overflow-hidden rounded-t-lg cursor-pointer hover:opacity-80 transition-opacity p-0 border-0 outline-none flex items-center justify-center">
                      <img
                        src={issue.imageUrl}
                        alt={issue.title}
                        className="w-full h-full object-cover"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl border-none bg-transparent shadow-none p-0 flex justify-center">
                      <img
                        src={issue.imageUrl}
                        alt="Report Full Size"
                        className="w-full h-auto max-h-[80vh] rounded-md object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      className={
                        issue.status === "resolved"
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : issue.status === "in progress"
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "bg-rose-500 hover:bg-rose-600 text-white"
                      }
                    >
                      {issue.status?.toUpperCase() || "OPEN"}
                    </Badge>
                    <Badge variant="outline">{issue.category}</Badge>
                  </div>
                  <CardTitle className="text-xl">{issue.title}</CardTitle>
                  <CardDescription>
                    {issue.createdAt
                      ? formatDistanceToNow(
                          issue.createdAt.toDate
                            ? issue.createdAt.toDate()
                            : new Date(issue.createdAt),
                          { addSuffix: true },
                        )
                      : "Unknown date"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div>
                    <Dialog>
                      <DialogTrigger className="text-sm text-muted-foreground mb-4 line-clamp-3 text-left hover:underline cursor-pointer outline-none p-0 border-0 bg-transparent block w-full">
                        {issue.description}
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <div
                          className="space-y-4 pt-4 max-h-[80vh] overflow-y-auto pr-2"
                          id={`print-area-${issue.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg leading-none tracking-tight">
                              Issue Details
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const printContent = document.getElementById(
                                  `print-area-${issue.id}`,
                                );
                                if (printContent) {
                                  const win = window.open("", "_blank");
                                  if (win) {
                                    win.document.write(`
                                <html>
                                  <head>
                                    <title>Authority Report - ${issue.title}</title>
                                    <style>
                                      body { font-family: system-ui, sans-serif; padding: 2rem; line-height: 1.5; }
                                      .text-destructive { color: #ef4444; }
                                      .bg-destructive\\/10 { background-color: #fef2f2; }
                                      .text-blue-600 { color: #2563eb; }
                                      .text-amber-600 { color: #d97706; }
                                      .border { border: 1px solid #e5e7eb; }
                                      .rounded-md { border-radius: 0.375rem; }
                                      .p-3 { padding: 0.75rem; }
                                      .mb-1 { margin-bottom: 0.25rem; }
                                      .pt-2 { padding-top: 0.5rem; }
                                      .border-t { border-top: 1px solid #e5e7eb; }
                                      .whitespace-pre-wrap { white-space: pre-wrap; }
                                      button { display: none !important; }
                                    </style>
                                  </head>
                                  <body>
                                    <h1>${issue.title}</h1>
                                    <p><strong>Status:</strong> ${issue.status} | <strong>Category:</strong> ${issue.category} | <strong>Severity:</strong> ${issue.severity}</p>
                                    <hr />
                                    ${printContent.innerHTML}
                                  </body>
                                </html>
                              `);
                                    win.document.close();
                                    win.focus();
                                    // Small delay to allow styles to parse
                                    setTimeout(() => {
                                      win.print();
                                      win.close();
                                    }, 250);
                                  }
                                }
                              }}
                            >
                              <Printer className="w-4 h-4 mr-2" />
                              Authority Report
                            </Button>
                          </div>

                          {issue.aiAnalysis?.isEmergency && (
                            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 flex items-start space-x-2">
                              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-sm">
                                  Emergency Detected
                                </p>
                                <p className="text-xs mt-1">
                                  This issue was flagged by AI as a critical
                                  emergency.
                                </p>
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-sm mb-1">
                              Description
                            </p>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {issue.description}
                            </div>
                          </div>

                          {issue.aiAnalysis?.actionPlan && (
                            <div className="pt-2 border-t">
                              <p className="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-1">
                                AI Recommended Action Plan
                              </p>
                              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {issue.aiAnalysis.actionPlan}
                              </div>
                            </div>
                          )}

                          {issue.aiAnalysis?.safetyPrecautions && (
                            <div className="pt-2 border-t">
                              <p className="font-semibold text-sm text-amber-600 dark:text-amber-500 mb-1">
                                Safety Precautions
                              </p>
                              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {issue.aiAnalysis.safetyPrecautions}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      {issue.location &&
                      typeof issue.location === "object" &&
                      "lat" in issue.location
                        ? `${Number(issue.location.lat).toFixed(4)}, ${Number(issue.location.lng).toFixed(4)}`
                        : typeof issue.location === "string"
                          ? issue.location
                          : "Unknown location"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t mt-4">
                    <span className="text-sm font-medium">
                      Severity: {issue.severity || "Medium"}
                    </span>
                    <button
                      onClick={() => handleUpvote(issue.id)}
                      className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors bg-muted/50 px-3 py-1.5 rounded-full"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {issue.upvotes || 0}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
        {!isLoading && filteredIssues.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No issues found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
