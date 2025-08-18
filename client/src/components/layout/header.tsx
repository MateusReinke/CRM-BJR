import { Search, Bell, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/ui/theme-provider";

interface HeaderProps {
  selectedUnit: string;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({ selectedUnit, setMobileMenuOpen }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();

  const getUnitName = (unit: string) => {
    const unitNames = {
      'all': 'Todas as Unidades',
      'SP1': 'São Paulo SP1',
      'SP2': 'São Paulo SP2',
      'SOR': 'Sorocaba SOR'
    };
    return unitNames[unit as keyof typeof unitNames] || 'Todas as Unidades';
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-card shadow border-b border-border">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="border-r border-border text-muted-foreground md:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <Search className="h-4 w-4 ml-3 text-muted-foreground" />
              </div>
              <Input
                className="block w-full h-full pl-10 pr-3 py-2 bg-muted/50 border-0 focus:ring-0 focus:border-0"
                placeholder="Buscar clientes, veículos, serviços..."
                type="search"
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user ? getUserInitials(user.name) : 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-medium text-foreground">
                {user?.name || 'User'}
              </span>
              <div className="text-xs text-muted-foreground">
                {user?.role || 'Role'}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
