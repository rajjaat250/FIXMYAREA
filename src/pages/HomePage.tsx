import { Link, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { MapPin, ShieldAlert, Bot } from "lucide-react";
import { useAppContext } from "@/components/app-provider";
import { TypeAnimation } from "react-type-animation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, isLoading } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center gap-2" to="/">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-xl">FIXMYAREA <span className="text-primary">AI</span></span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:text-primary underline-offset-4 hover:underline hidden sm:block" href="#features">
            Features
          </a>
          <a className="text-sm font-medium hover:text-primary underline-offset-4 hover:underline hidden sm:block" href="#how-it-works">
            How it Works
          </a>
          {user ? (
            <Link to="/dashboard" className={buttonVariants({ size: "sm" })}>Go to Dashboard</Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className={buttonVariants({ size: "sm", variant: "ghost" })}>Sign In</Link>
              <Link to="/register" className={buttonVariants({ size: "sm" })}>Sign Up</Link>
            </div>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full min-h-[calc(100vh-4rem)] flex items-center bg-slate-50 dark:bg-slate-900/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="font-display text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none min-h-[140px] md:min-h-[180px] lg:min-h-[220px] flex flex-col justify-center items-center text-center w-full">
                  <span>Fix Local Problems</span>
                  <div className="mt-2 flex items-center justify-center">
                    <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 inline-flex justify-center text-center">
                      <TypeAnimation
                        sequence={[
                          'Faster With AI',
                          1000,
                          'Together',
                          1000,
                          'Effectively',
                          1000,
                          'Easily',
                          1000
                        ]}
                        wrapper="span"
                        speed={50}
                        repeat={Infinity}
                      />
                    </span>
                  </div>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl pt-4">
                  Report issues, track progress, and help improve your community. Powered by Google Gemini and Google Maps.
                </p>
              </div>
              <div className="space-x-4 pt-6">
                <Link to="/dashboard/report" className={buttonVariants({ size: "lg", className: "h-12 px-8" })}>Report an Issue</Link>
                <Link to="/dashboard" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 px-8" })}>Explore Platform</Link>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">Latest Features</div>
                <h2 className="font-display text-3xl font-bold tracking-tighter md:text-5xl">
                  Everything you need to improve your city
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto pt-4">
                  We've combined advanced AI with community reporting to streamline the resolution of civic issues.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-slate-900/50 dark:border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 flex flex-col h-full space-y-6">
                  <div className="rounded-2xl bg-primary/10 p-4 w-16 h-16 flex items-center justify-center">
                    <ShieldAlert className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Smart AI Reporting</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Upload a photo and let Gemini AI automatically categorize and assess the severity of the issue in seconds.
                    </p>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-slate-900/50 dark:border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 flex flex-col h-full space-y-6">
                  <div className="rounded-2xl bg-blue-500/10 p-4 w-16 h-16 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Precise Location Tracking</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Pinpoint issues accurately using Google Maps integration with automatic address validation and geospatial queries.
                    </p>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-slate-900/50 dark:border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 flex flex-col h-full space-y-6">
                  <div className="rounded-2xl bg-emerald-500/10 p-4 w-16 h-16 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Intelligent Assistant</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Chat with our context-aware intelligent assistant to get updates, report summaries, or find nearby issues instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">How it Works</div>
                <h2 className="font-display text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Three simple steps to a better community
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform makes it easy to report issues and track their progress until they are resolved.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">1</div>
                <h3 className="font-bold text-xl">Spot an Issue</h3>
                <p className="text-muted-foreground">Take a photo of a pothole, broken streetlight, or any other civic issue.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">2</div>
                <h3 className="font-bold text-xl">Report with AI</h3>
                <p className="text-muted-foreground">Upload it to the app. Our AI automatically analyzes the image and fills in details.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">3</div>
                <h3 className="font-bold text-xl">Track Progress</h3>
                <p className="text-muted-foreground">Monitor the status of your report and see when the city resolves it.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 FIXMYAREA AI. A civic engagement platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
