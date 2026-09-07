import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppToastProvider } from "@/components/ui/app-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Status from "./pages/Status.tsx";
import Admin from "./pages/Admin.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.5,
};

const AnimatedRoute = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

const App = () => {
  // Redirect any external links to use the new homepage design
  useEffect(() => {
    document.title = "BdLink - Home";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppToastProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ minHeight: "100vh" }}
            >
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<AnimatedRoute><Index /></AnimatedRoute>} />
                  <Route path="/auth" element={<AnimatedRoute><Auth /></AnimatedRoute>} />
                  <Route path="/status" element={<AnimatedRoute><Status /></AnimatedRoute>} />
                  <Route path="/admin" element={<AnimatedRoute><Admin /></AnimatedRoute>} />
                  <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
                </Routes>
              </AnimatePresence>
            </motion.div>
          </BrowserRouter>
        </AppToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;