import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { useAppContext } from "@/components/app-provider";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, setDemoUser } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error("Email/Password sign-in is not enabled. Please enable it in your Firebase Console under Authentication > Sign-in method.");
      } else {
        toast.error(error.message || "Failed to log in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Logged in successfully with Google");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to log in with Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'user') => {
    setIsLoading(true);
    const demoEmail = role === 'admin' ? 'admin@demo.com' : 'user@demo.com';
    const demoPassword = 'demoPassword123';
    
    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      toast.success(`Logged in as Demo ${role === 'admin' ? 'Admin' : 'User'}`);
      navigate("/dashboard");
    } catch (error: any) {
      // If user doesn't exist, try creating it, or mock if operation not allowed
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials' || error.code === 'auth/operation-not-allowed') {
        
        if (error.code === 'auth/operation-not-allowed') {
            const mockUser = {
              uid: role === 'admin' ? 'admin-mock-123' : 'user-mock-123',
              email: demoEmail,
              displayName: role === 'admin' ? 'Demo Admin' : 'Demo User',
              photoURL: '',
            };
            setDemoUser(mockUser);
            navigate("/dashboard");
            return;
        }

        try {
          const { createUserWithEmailAndPassword } = await import("firebase/auth");
          await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
          toast.success(`Created and logged in as Demo ${role === 'admin' ? 'Admin' : 'User'}`);
          navigate("/dashboard");
        } catch (createError: any) {
          if (createError.code === 'auth/operation-not-allowed') {
            const mockUser = {
              uid: role === 'admin' ? 'admin-mock-123' : 'user-mock-123',
              email: demoEmail,
              displayName: role === 'admin' ? 'Demo Admin' : 'Demo User',
              photoURL: '',
            };
            setDemoUser(mockUser);
            navigate("/dashboard");
            return;
          }
          toast.error("Failed to create demo account. " + createError.message);
        }
      } else {
        toast.error(error.message || "Failed to log in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/40">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <MapPin className="h-8 w-8 text-primary" />
        <span className="font-display font-bold text-2xl">FIXMYAREA <span className="text-primary">AI</span></span>
      </Link>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
            )}
            Google (Gmail)
          </Button>

          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center pt-2">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase pt-2">
              <span className="bg-background px-2 text-muted-foreground">
                Hackathon Demo
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" type="button" onClick={() => handleDemoLogin('user')} disabled={isLoading || isGoogleLoading}>
              Demo User
            </Button>
            <Button variant="default" type="button" onClick={() => handleDemoLogin('admin')} disabled={isLoading || isGoogleLoading}>
              Demo Admin
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
