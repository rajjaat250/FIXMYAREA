import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Define some nice colors for the bar chart
  const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const q = query(collection(db, "reports"));
        const querySnapshot = await getDocs(q);
        
        const monthlyStats: Record<string, { issues: number, resolved: number }> = {};
        const categoryStats: Record<string, number> = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Category logic
          const category = data.category || 'Other';
          categoryStats[category] = (categoryStats[category] || 0) + 1;

          // Trend logic (by month)
          if (data.createdAt) {
            let date;
            if (data.createdAt.toDate) {
               date = data.createdAt.toDate();
            } else {
               date = new Date(data.createdAt);
            }
            const monthStr = format(date, 'MMM yyyy');
            
            if (!monthlyStats[monthStr]) {
              monthlyStats[monthStr] = { issues: 0, resolved: 0 };
            }
            
            monthlyStats[monthStr].issues += 1;
            if (data.status === 'resolved') {
              monthlyStats[monthStr].resolved += 1;
            }
          }
        });

        // Format for Recharts
        const formattedTrendData = Object.entries(monthlyStats)
          .map(([name, stats]) => ({ name, ...stats }))
          // Very simple chronological sort isn't perfect with string 'MMM yyyy' but good enough for demo if they are recent
          // To do properly, we can parse it back, but let's just keep the order they were inserted (or reverse)
          .reverse(); 

        const formattedCategoryData = Object.entries(categoryStats)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value); // Sort highest first

        setTrendData(formattedTrendData);
        setCategoryData(formattedCategoryData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Analytics & Insights</h1>
        <p className="text-muted-foreground">Community reporting trends and resolution metrics.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Loading analytics data...
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Reporting vs. Resolution Trends</CardTitle>
                <CardDescription>Number of issues reported and resolved over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                        <Legend />
                        <Area type="monotone" dataKey="issues" name="Reported" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorIssues)" />
                        <Area type="monotone" dataKey="resolved" name="Resolved" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorResolved)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">No trend data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>Distribution of report categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} cursor={{ fill: 'hsl(var(--muted))' }} />
                        <Bar dataKey="value" name="Reports" radius={[0, 4, 4, 0]} barSize={24}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">No category data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Insights</CardTitle>
              <CardDescription>Based on community reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg border-l-4 border-amber-500">
                    <h4 className="font-semibold text-amber-500 mb-1">Top Issue: {categoryData[0].name}</h4>
                    <p className="text-sm">With {categoryData[0].value} reports, <strong>{categoryData[0].name}</strong> is the most reported issue in the community. Prioritizing this category will resolve the most common concerns.</p>
                  </div>
                )}
                {trendData.length > 0 && trendData[0].resolved > 0 && (
                  <div className="p-4 bg-muted rounded-lg border-l-4 border-emerald-500">
                    <h4 className="font-semibold text-emerald-500 mb-1">Resolution Progress</h4>
                    <p className="text-sm">In the latest period ({trendData[0].name}), {trendData[0].resolved} issues were resolved out of {trendData[0].issues} reported. Continue pushing for timely resolutions.</p>
                  </div>
                )}
                {categoryData.length === 0 && trendData.length === 0 && (
                   <div className="text-sm text-muted-foreground">Not enough data to generate insights.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
