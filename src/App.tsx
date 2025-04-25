
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
import { checkDatabaseConnection } from "./integrations/supabase/client";
import { Loader2 } from "lucide-react";
import ThemePreview from "./components/ThemePreview";

// Import theme styles
import "./styles/theme.css";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Map = lazy(() => import("./pages/Map"));
const About = lazy(() => import("./pages/About"));
const AdminPortal = lazy(() => import("./pages/AdminPortal"));
const RecordPage = lazy(() => import("./pages/RecordPage"));

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
    }
  })
  .catch(err => {
    console.error("Error checking database connection:", err);
  });

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      defaultTheme="dark" 
      storageKey="noise-sense-theme"
      attribute="data-theme"
      value={{ light: "light", dark: "dark" }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/map" element={<Map />} />
                <Route path="/about" element={<About />} />
                <Route path="/admin" element={<AdminPortal />} />
                <Route path="/record" element={<RecordPage />} />
                <Route path="/theme" element={<ThemePreview />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
