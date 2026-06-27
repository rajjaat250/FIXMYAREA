"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { APIProvider } from "@vis.gl/react-google-maps";

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  googleMapsApiKey: string;
  logout: () => Promise<void>;
  setDemoUser: (user: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children, googleMapsApiKey }: { children: React.ReactNode, googleMapsApiKey: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if there is a mock demo user in localStorage
    const demoUserStr = localStorage.getItem('demo_user');
    if (demoUserStr) {
      setUser(JSON.parse(demoUserStr) as any);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Only set from firebase if no demo user exists
      if (!localStorage.getItem('demo_user')) {
        setUser(currentUser);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      localStorage.removeItem('demo_user');
      await auth.signOut();
    } catch (e) {
      console.error("Firebase sign out error", e);
    } finally {
      setUser(null);
    }
  };

  const setDemoUser = (demoUser: any) => {
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  return (
    <AppContext.Provider value={{ user, isLoading, googleMapsApiKey, logout, setDemoUser }}>
      {googleMapsApiKey ? (
        <APIProvider apiKey={googleMapsApiKey} version="weekly" libraries={['core', 'places']}>
          {children}
        </APIProvider>
      ) : (
        children
      )}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
