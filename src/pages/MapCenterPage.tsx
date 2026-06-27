import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CustomMap } from "@/components/ui/map";
import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search } from "lucide-react";
import { useAppContext } from "@/components/app-provider";

export default function MapCenterPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const { googleMapsApiKey } = useAppContext();
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const q = query(collection(db, "reports"));
        const querySnapshot = await getDocs(q);
        const fetchedIssues = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as any)).filter(issue => issue.location && issue.location.lat != null && issue.location.lng != null && !isNaN(Number(issue.location.lat)) && !isNaN(Number(issue.location.lng)));
        setIssues(fetchedIssues);
      } catch (error) {
        console.error("Error fetching map issues:", error);
      }
    };
    fetchIssues();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    
    const applyLocation = (lat: number, lng: number) => {
      setMapCenter({ lat, lng });
      setMapZoom(14);
      // If the search term didn't match any issues but found a location, clear it so issues are visible
      const searchLower = searchTerm.toLowerCase();
      const hasMatches = issues.some(issue => 
        issue.title?.toLowerCase().includes(searchLower) ||
        issue.description?.toLowerCase().includes(searchLower) ||
        issue.type?.toLowerCase().includes(searchLower)
      );
      if (!hasMatches) {
        setSearchTerm('');
      }
    };

    const fallbackGeocode = async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        if (data && data.length > 0) {
          applyLocation(parseFloat(data[0].lat), parseFloat(data[0].lon));
        } else {
          console.warn("Location not found via fallback");
        }
      } catch (err) {
        console.error("Fallback geocoding error:", err);
      }
    };

    await fallbackGeocode();
  };

  const filteredIssues = issues.filter(issue => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      (issue.title && String(issue.title).toLowerCase().includes(searchLower)) || 
      (issue.description && String(issue.description).toLowerCase().includes(searchLower)) ||
      (issue.type && String(issue.type).toLowerCase().includes(searchLower));
    
    const matchesCategory = categoryFilter === "all" || (issue.category && String(issue.category).toLowerCase() === categoryFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || (issue.status && String(issue.status).toLowerCase() === statusFilter.toLowerCase());
    const matchesSeverity = severityFilter === "all" || (issue.severity && String(issue.severity).toLowerCase() === severityFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
  });

  return (
    <div className="container flex flex-col h-[calc(100vh-4rem)] p-4 max-w-7xl mx-auto">
      <div className="mb-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">Map Center</h1>
        <p className="text-muted-foreground">View and filter issues across the city.</p>
      </div>
      
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <form onSubmit={handleSearch} className="relative">
          <Input 
            placeholder="Search locations or issues... (Press Enter to map search)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" onClick={handleSearch} />
        </form>
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
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0">
          <CustomMap
            center={mapCenter}
            zoom={mapZoom}
            onCameraChanged={(e) => {
              setMapCenter(e.detail.center);
              setMapZoom(e.detail.zoom);
            }}
            mapId="MAP_CENTER_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {filteredIssues.map((issue) => (
              <AdvancedMarker key={issue.id} position={{ lat: Number(issue.location.lat), lng: Number(issue.location.lng) }} title={issue.title}>
                <Pin 
                  background={issue.status === 'resolved' ? '#10b981' : issue.status === 'urgent' ? '#ef4444' : '#f59e0b'} 
                  borderColor={issue.status === 'resolved' ? '#047857' : issue.status === 'urgent' ? '#b91c1c' : '#b45309'}
                  glyphColor="#fff" 
                />
              </AdvancedMarker>
            ))}
          </CustomMap>
        </div>
        
        {/* Floating Legend */}
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur border rounded-lg p-3 shadow-lg text-sm flex flex-col gap-2 pointer-events-none">
          <div className="font-semibold mb-1">Status Legend</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 border border-red-700"></div> Urgent / Critical</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 border border-amber-700"></div> Open / In Progress</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-700"></div> Resolved</div>
        </div>
      </Card>
    </div>
  );
}
