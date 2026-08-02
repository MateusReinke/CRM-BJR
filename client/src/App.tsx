import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { StoreProvider } from "@/contexts/store-context";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Vehicles from "@/pages/vehicles";
import ServiceOrders from "@/pages/service-orders";
import Appointments from "@/pages/appointments";
import Inventory from "@/pages/inventory";
import Financial from "@/pages/financial";
import Invoices from "@/pages/invoices";
import Stores from "@/pages/stores";
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
      <ProtectedRoute path="/invoices" component={Invoices} />
      <ProtectedRoute path="/stores" component={Stores} />
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
          <StoreProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
