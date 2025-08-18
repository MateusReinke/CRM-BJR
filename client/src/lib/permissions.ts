import type { User } from "@shared/schema";

export type Permission = 
  | 'view_dashboard'
  | 'manage_clients'
  | 'manage_vehicles'
  | 'manage_service_orders'
  | 'manage_inventory'
  | 'manage_appointments'
  | 'manage_financial'
  | 'manage_employees'
  | 'view_reports'
  | 'system_admin';

export const rolePermissions: Record<string, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_clients',
    'manage_vehicles', 
    'manage_service_orders',
    'manage_inventory',
    'manage_appointments',
    'manage_financial',
    'manage_employees',
    'view_reports',
    'system_admin'
  ],
  manager: [
    'view_dashboard',
    'manage_clients',
    'manage_vehicles',
    'manage_service_orders', 
    'manage_inventory',
    'manage_appointments',
    'manage_financial',
    'view_reports'
  ],
  hr: [
    'view_dashboard',
    'manage_employees',
    'view_reports'
  ],
  seller: [
    'view_dashboard',
    'manage_clients',
    'manage_vehicles',
    'manage_service_orders',
    'manage_inventory'
  ],
  mechanic: [
    'view_dashboard',
    'manage_service_orders' // Can only edit service orders and add comments/photos
  ]
};

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  return rolePermissions[user.role]?.includes(permission) || false;
}

export function canManageEmployees(user: User | null): boolean {
  return hasPermission(user, 'manage_employees');
}

export function canEditServiceOrder(user: User | null): boolean {
  return hasPermission(user, 'manage_service_orders');
}

export function canManageInventory(user: User | null): boolean {
  return hasPermission(user, 'manage_inventory');
}

export function canManageClients(user: User | null): boolean {
  return hasPermission(user, 'manage_clients');
}

export function canViewReports(user: User | null): boolean {
  return hasPermission(user, 'view_reports');
}

export function canManageFinancial(user: User | null): boolean {
  return hasPermission(user, 'manage_financial');
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

export function isManager(user: User | null): boolean {
  return user?.role === 'manager';
}

export function getRoleName(role: string): string {
  const roleNames: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente', 
    hr: 'Recursos Humanos',
    seller: 'Vendedor',
    mechanic: 'Mecânico'
  };
  return roleNames[role] || role;
}