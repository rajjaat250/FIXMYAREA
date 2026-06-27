import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  MapPin,
  Upload,
  Loader2,
  Sparkles,
  Mic,
  MicOff,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { CustomMap } from "@/components/ui/map";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/components/app-provider";

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState({ lat: 37.7749, lng: -122.4194 });

  const [aiAnalysis, setAiAnalysis] = useState<{
    title: string;
    description: string;
    category: string;
    severity: string;
    priority: string;
    department: string;
    isEmergency: boolean;
    safetyPrecautions: string;
    actionPlan: string;
    confidence: number;
    summary: string;
  } | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const fallbackToIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setLocation({
            lat: data.latitude,
            lng: data.longitude,
          });
        }
      } catch (e) {
        console.warn("IP location fallback failed", e);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Error getting location silently on load:", error);
          fallbackToIP();
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      );
    } else {
      fallbackToIP();
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setDescription((prev) =>
          prev ? prev + " " + finalTranscript : finalTranscript,
        );
      }
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsRecording(false);
      toast.error("Microphone error: " + event.error);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
      setIsRecording(true);
      recognitionRef.current = recognition;
    } catch (e) {
      console.error(e);
      toast.error("Could not start microphone.");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          setImagePreview(compressedBase64);
          analyzeImage(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) throw new Error("Failed to analyze image");

      const data = await response.json();
      setAiAnalysis(data);

      if (data.category) setCategory(data.category);
      if (data.title && !title) setTitle(data.title);
      if (data.description && !description) setDescription(data.description);
      else if (data.summary && !description) setDescription(data.summary);

      toast.success("AI Analysis Complete", {
        description: `Identified as ${data.category} with ${data.confidence}% confidence.`,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze image with AI");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      toast.error("Please upload a photo of the issue");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reports"), {
        title,
        description,
        category,
        location,
        type: category.toLowerCase().replace(" ", "-"),
        status: "open",
        createdAt: serverTimestamp(),
        aiAnalysis,
        imageUrl: imagePreview,
        userEmail: user?.email || "anonymous",
      });

      // Play success sound
      try {
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioCtx.currentTime + 0.5,
        );
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.error("Audio play failed", e);
      }

      setIsSuccess(true);
      toast.success("Issue Reported Successfully", {
        description: "Thank you for helping improve your community!",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error submitting report", error);
      toast.error("Failed to submit report. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Report an Issue
        </h1>
        <p className="text-muted-foreground">
          Upload a photo and let our AI help categorize the problem.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>
              Provide information about the problem.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo">Upload Photo</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors overflow-hidden relative"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG or WEBP (MAX. 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Brief description (e.g., Deep pothole)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pothole">Pothole</SelectItem>
                    <SelectItem value="Garbage">
                      Garbage / Illegal Dumping
                    </SelectItem>
                    <SelectItem value="Water Leakage">Water Leakage</SelectItem>
                    <SelectItem value="Streetlight Damage">
                      Streetlight Damage
                    </SelectItem>
                    <SelectItem value="Road Damage">Road Damage</SelectItem>
                    <SelectItem value="Broken Infrastructure">
                      Broken Infrastructure
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleVoiceRecording}
                    className="h-8 px-2 lg:px-3"
                  >
                    {isRecording ? (
                      <MicOff className="w-4 h-4 mr-2" />
                    ) : (
                      <Mic className="w-4 h-4 mr-2" />
                    )}
                    {isRecording ? "Stop Recording" : "Record Voice"}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail..."
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className={`w-full transition-all duration-300 ${isSuccess ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
                disabled={isSubmitting || isAnalyzing || isSuccess}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 className="mr-2 h-5 w-5 animate-in zoom-in" />
                ) : null}
                {isSuccess ? "Submitted Successfully!" : "Submit Report"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>Powered by Gemini Vision</CardDescription>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Analyzing image and assessing severity...
                  </p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  {aiAnalysis.isEmergency && (
                    <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 mb-4 flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">
                          Emergency Detected
                        </p>
                        <p className="text-xs mt-1">
                          This issue has been flagged as a critical emergency
                          requiring immediate attention.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase">
                        Detected Category
                      </p>
                      <p className="font-medium">{aiAnalysis.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase">
                        Severity
                      </p>
                      <p
                        className={`font-medium ${aiAnalysis.severity === "Critical" || aiAnalysis.severity === "High" ? "text-destructive" : "text-amber-500"}`}
                      >
                        {aiAnalysis.severity}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase">
                        Responsible Dept
                      </p>
                      <p className="font-medium">{aiAnalysis.department}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase">
                        Confidence
                      </p>
                      <p className="font-medium text-emerald-500">
                        {aiAnalysis.confidence}%
                      </p>
                    </div>
                  </div>

                  {aiAnalysis.safetyPrecautions && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                        Safety Precautions
                      </p>
                      <p className="text-sm leading-relaxed text-amber-600 dark:text-amber-500">
                        {aiAnalysis.safetyPrecautions}
                      </p>
                    </div>
                  )}

                  {aiAnalysis.actionPlan && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                        Recommended Action Plan
                      </p>
                      <p className="text-sm leading-relaxed text-blue-600 dark:text-blue-400">
                        {aiAnalysis.actionPlan}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      AI Summary
                    </p>
                    <p className="text-sm leading-relaxed">
                      {aiAnalysis.summary}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <Camera className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Upload a photo to see AI insights.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Pinpoint the exact location of the issue.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.loading("Detecting location...", {
                    id: "location-detect",
                  });

                  const fallbackToIP = async () => {
                    try {
                      const res = await fetch("https://ipapi.co/json/");
                      const data = await res.json();
                      if (data.latitude && data.longitude) {
                        setLocation({
                          lat: data.latitude,
                          lng: data.longitude,
                        });
                        toast.success("Location detected (IP based)", {
                          id: "location-detect",
                        });
                      } else {
                        throw new Error("Invalid IP location data");
                      }
                    } catch (e) {
                      toast.error("Could not determine your location", {
                        id: "location-detect",
                      });
                    }
                  };

                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setLocation({
                          lat: position.coords.latitude,
                          lng: position.coords.longitude,
                        });
                        toast.success("Location detected", {
                          id: "location-detect",
                        });
                      },
                      (error) => {
                        console.warn("Error getting location", error);
                        fallbackToIP();
                      },
                      {
                        enableHighAccuracy: false,
                        timeout: 10000,
                        maximumAge: 60000,
                      },
                    );
                  } else {
                    fallbackToIP();
                  }
                }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Detect Location
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full rounded-md overflow-hidden border">
                <CustomMap
                  center={location}
                  defaultZoom={15}
                  mapId="REPORT_ISSUE_MAP"
                  internalUsageAttributionIds={[
                    "gmp_mcp_codeassist_v1_aistudio",
                  ]}
                  disableDefaultUI={true}
                  onCameraChanged={(e: any) => {
                    // Keep track of map movement if needed, but here we just follow location state
                  }}
                >
                  <AdvancedMarker
                    position={location}
                    draggable={true}
                    onDragEnd={(e) => {
                      if (e.latLng) {
                        try {
                          const newLat =
                            typeof e.latLng.lat === "function"
                              ? e.latLng.lat()
                              : (e.latLng as any).lat;
                          const newLng =
                            typeof e.latLng.lng === "function"
                              ? e.latLng.lng()
                              : (e.latLng as any).lng;
                          if (
                            newLat != null &&
                            newLng != null &&
                            !isNaN(newLat) &&
                            !isNaN(newLng)
                          ) {
                            setLocation({ lat: newLat, lng: newLng });
                          }
                        } catch (err) {
                          console.error("Error parsing drag end location", err);
                        }
                      }
                    }}
                  >
                    <Pin
                      background="#ea4335"
                      borderColor="#c5221f"
                      glyphColor="#fff"
                    />
                  </AdvancedMarker>
                </CustomMap>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Drag the pin to adjust location precisely.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
