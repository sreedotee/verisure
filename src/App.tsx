import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manufacturer" 
              element={
                <ProtectedRoute requiredRole="manufacturer">
                  <ManufacturerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer" 
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin', 'manufacturer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manufacturer']}>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
