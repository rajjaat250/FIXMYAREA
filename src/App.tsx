/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/components/app-provider";
import { Toaster } from "@/components/ui/sonner";

// Pages
import HomePage from "./pages/HomePage";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ReportIssuePage from "./pages/ReportIssuePage";
import MapCenterPage from "./pages/MapCenterPage";
import AssistantPage from "./pages/AssistantPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";

import AllIssuesPage from "./pages/AllIssuesPage";

import AdminDashboardPage from "./pages/AdminDashboardPage";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
      <AppProvider googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="report" element={<ReportIssuePage />} />
              <Route path="issues" element={<AllIssuesPage />} />
              <Route path="map" element={<MapCenterPage />} />
              <Route path="assistant" element={<AssistantPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={<AdminDashboardPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
}
