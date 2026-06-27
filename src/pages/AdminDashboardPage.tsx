import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, ExternalLink } from "lucide-react";
import { useAppContext } from "@/components/app-provider";
import { useNavigate } from "react-router-dom";

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.email !== 'dhariwalraj37@gmail.com' && user.email !== 'admin@demo.com') {
      toast.error("Unauthorized access");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const fetchReports = async () => {
    try {
      const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedReports = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(fetchedReports);
    } catch (error: any) {
      console.error("Error fetching reports", error);
      toast.error(`Failed to load reports: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email === 'dhariwalraj37@gmail.com' || user?.email === 'admin@demo.com') {
      fetchReports();
    }
  }, [user]);

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, { status: newStatus });
      toast.success("Status updated");
      
      const report = reports.find(r => r.id === reportId);
      if (report && report.userEmail && report.userEmail !== 'anonymous') {
        await addDoc(collection(db, "notifications"), {
          userEmail: report.userEmail,
          title: `Report Status Updated`,
          message: `Your report "${report.title}" is now ${newStatus}.`,
          read: false,
          createdAt: serverTimestamp(),
          reportId: reportId
        });
      }
      
      setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error("Error updating status", error);
      toast.error("Failed to update status");
    }
  };

  if (!user || (user.email !== 'dhariwalraj37@gmail.com' && user.email !== 'admin@demo.com')) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">Manage and track all community reports across the platform.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>View and manage the status of user submitted reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No reports found in the system yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {report.imageUrl ? (
                          <Dialog>
                            <DialogTrigger className="w-12 h-12 rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity p-0 border-0 outline-none flex items-center justify-center">
                              <img src={report.imageUrl} alt="Report" className="w-full h-full object-cover" />
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl border-none bg-transparent shadow-none p-0 flex justify-center">
                                <img src={report.imageUrl} alt="Report Full Size" className="w-full h-auto max-h-[80vh] rounded-md object-contain" />
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {report.type?.charAt(0).toUpperCase() + report.type?.slice(1).replace('-', ' ')}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <Dialog>
                          <DialogTrigger className="truncate text-left block w-full hover:underline cursor-pointer outline-none p-0 border-0 bg-transparent">
                            {report.description}
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <div className="space-y-4 pt-4">
                              <h3 className="font-semibold text-lg leading-none tracking-tight">Issue Description</h3>
                              <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2">
                                {report.description}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {(report.location && typeof report.location === 'object' && 'lat' in report.location) ? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}` : (typeof report.location === 'string' ? report.location : 'Unknown location')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.location && typeof report.location === 'object' && 'lat' in report.location && (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${report.location.lat},${report.location.lng}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-muted hover:bg-muted/80 text-primary transition-colors"
                            title="View on Map"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={report.status || "open"}
                          onValueChange={(value) => handleStatusChange(report.id, value)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
