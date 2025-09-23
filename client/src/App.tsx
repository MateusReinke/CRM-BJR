import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { UnitProvider } from "@/contexts/unit-context";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Vehicles from "@/pages/vehicles";
import ServiceOrders from "@/pages/service-orders";
import Appointments from "@/pages/appointments";
import Inventory from "@/pages/inventory";
import Financial from "@/pages/financial";
import Employees from "@/pages/employees";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/clients" component={Clients} />
      <ProtectedRoute path="/vehicles" component={Vehicles} />
      <ProtectedRoute path="/service-orders" component={ServiceOrders} />
      <ProtectedRoute path="/appointments" component={Appointments} />
      <ProtectedRoute path="/inventory" component={Inventory} />
      <ProtectedRoute path="/financial" component={Financial} />
      <ProtectedRoute path="/employees" component={Employees} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="bjr-theme">
        <AuthProvider>
          <UnitProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </UnitProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
