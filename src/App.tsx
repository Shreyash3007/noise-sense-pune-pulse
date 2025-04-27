import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import { checkDatabaseConnection } from "./integrations/supabase/client";
import LoadingLogo from "./components/LoadingLogo";
import { AnimatePresence } from "framer-motion";
import AIChatWidget from "./components/AIChatWidget";

// Import theme styles
import "./styles/theme.css";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const AnalyticsDashboard = lazy(() => import("./pages/Map"));
const About = lazy(() => import("./pages/About"));
const AdminPortal = lazy(() => import("./pages/AdminPortal"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const RecordPage = lazy(() => import("./pages/RecordPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ThemePreview = lazy(() => import("./components/ThemePreview"));
const AIChat = lazy(() => import("./pages/ai-chat"));
const ApiTest = lazy(() => import("./pages/ApiTest"));

// Add custom CSS for animations
import "./App.css";

// Set up React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Check database connection on app start
checkDatabaseConnection()
  .then(connected => {
    if (!connected) {
      console.warn("Database connection failed. Some features may not work properly.");
    } else {
      console.log("Database connection successful.");
    }
  })
  .catch(err => {
    console.error("Error checking database connection:", err);
  });

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <LoadingLogo />
  </div>
);

// Theme change event listener for analytics
if (typeof window !== "undefined") {
  window.addEventListener("theme-change", (event: any) => {
    // Log theme changes for analytics
    console.log("Theme changed:", event.detail);
    
    // You could send this to your analytics service
    // analytics.track("Theme Changed", {
    //   theme: event.detail.theme,
    //   previousTheme: event.detail.previousTheme,
    //   systemTheme: event.detail.systemTheme
    // });
  });
}

const App = () => {
  useEffect(() => {
    // Pre-load critical pages after initial render
    const preloadPages = () => {
      import("./pages/Map");
      import("./pages/RecordPage");
    };
    
    // Use requestIdleCallback for non-critical preloading
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloadPages);
    } else {
      setTimeout(preloadPages, 2000);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        defaultTheme="system" 
        storageKey="noise-sense-theme"
        attribute="data-theme"
        value={{ light: "light", dark: "dark" }}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout>
              <AnimatePresence mode="wait">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/map" element={<AnalyticsDashboard />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/admin" element={<AdminPortal />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/record" element={<RecordPage />} />
                    <Route path="/theme" element={<ThemePreview />} />
                    <Route path="/ai-chat" element={<AIChat />} />
                    <Route path="/api-test" element={<ApiTest />} />
                    <Route path="/analytics" element={<Navigate to="/map" replace />} />
                    <Route path="/dashboard" element={<Navigate to="/map" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AnimatePresence>
            </MainLayout>
            {/* <AIChatWidget /> */}
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
