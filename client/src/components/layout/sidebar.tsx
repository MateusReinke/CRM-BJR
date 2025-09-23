import { Link, useLocation } from "wouter";
import { Car, Gauge, Users, Wrench, ClipboardList, Calendar, Package, DollarSign, Bus, BarChart3, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  selectedUnit: string;
  setSelectedUnit: (unit: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ selectedUnit, setSelectedUnit, mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Gauge },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Veículos", href: "/vehicles", icon: Car },
    { name: "Ordens de Serviço", href: "/service-orders", icon: ClipboardList },
    { name: "Agendamentos", href: "/appointments", icon: Calendar },
    { name: "Estoque", href: "/inventory", icon: Package },
    { name: "Financeiro", href: "/financial", icon: DollarSign },
  ];

  const adminNavigation = [
    { name: "Funcionários", href: "/employees", icon: Bus },
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  const unitOptions = [
    { value: "all", label: "🌐 Todas as Unidades" },
    { value: "SP1", label: "🔵 São Paulo SP1" },
    { value: "SP2", label: "⚫ São Paulo SP2" },
    { value: "SOR", label: "🟢 Sorocaba SOR" },
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

      {/* Unit Switcher */}
      <div className="px-4 mb-6">
        <label className="block text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wide mb-2">
          Unidade
        </label>
        <Select value={selectedUnit} onValueChange={setSelectedUnit} data-testid="select-unit">
          <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground" data-testid="trigger-unit-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent data-testid="content-unit-select">
            {unitOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} data-testid={`option-unit-${option.value}`}>
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
