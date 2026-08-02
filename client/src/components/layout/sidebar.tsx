import { Link, useLocation } from "wouter";
import { Car, Gauge, Users, Wrench, ClipboardList, Calendar, Package, DollarSign, Bus, BarChart3, Settings, Receipt, Store as StoreIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/contexts/store-context";
import { useAuth } from "@/hooks/use-auth";
import { canManageStores, canManageInvoices, canManageEmployees } from "@/lib/permissions";

interface SidebarProps {
  selectedStoreId: string;
  setSelectedStoreId: (storeId: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ selectedStoreId, setSelectedStoreId, mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const [location] = useLocation();
  const { stores } = useStore();
  const { user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Gauge },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Veículos", href: "/vehicles", icon: Car },
    { name: "Ordens de Serviço", href: "/service-orders", icon: ClipboardList },
    { name: "Agendamentos", href: "/appointments", icon: Calendar },
    { name: "Estoque", href: "/inventory", icon: Package },
    { name: "Despesas", href: "/financial", icon: DollarSign },
    ...(canManageInvoices(user) ? [{ name: "Notas Fiscais", href: "/invoices", icon: Receipt }] : []),
  ];

  const adminNavigation = [
    ...(canManageEmployees(user) ? [{ name: "Funcionários", href: "/employees", icon: Bus }] : []),
    ...(canManageStores(user) ? [{ name: "Lojas", href: "/stores", icon: StoreIcon }] : []),
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
  ];

  const storeOptions = [
    { value: "all", label: "🌐 Todas as Lojas", color: undefined as string | undefined },
    ...stores.map(store => ({ value: store.id, label: `${store.name}`, color: store.color })),
  ];

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="flex items-center flex-shrink-0 px-4 mb-6">
        <div className="flex items-center">
          <img
            src="https://static.wixstatic.com/media/c97016_f40c4aa13f3045d580bd10f6983b15be~mv2.png/v1/fill/w_325,h_147,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image-removebg-preview%20-%202024-11-05T142157_349.png"
            alt="BJR Centro Automotivo"
            className="h-12 w-auto mr-3"
          />

        </div>
      </div>

      {/* Store Switcher */}
      <div className="px-4 mb-6">
        <label className="block text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wide mb-2">
          Loja
        </label>
        <Select value={selectedStoreId} onValueChange={setSelectedStoreId} data-testid="select-store">
          <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground" data-testid="trigger-store-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent data-testid="content-store-select">
            {storeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} data-testid={`option-store-${option.value}`}>
                {option.color && (
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: option.color }} />
                )}
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 space-y-1" data-testid="nav-main">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}

        {/* Admin Section */}
        {adminNavigation.length > 0 && (
          <div className="pt-4" data-testid="nav-admin-section">
            <p className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wide px-2 mb-2">
              Administração
            </p>
            <div className="space-y-1">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;

                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`nav-admin-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-sidebar border-r border-sidebar-border">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-sidebar">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                ×
              </Button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
