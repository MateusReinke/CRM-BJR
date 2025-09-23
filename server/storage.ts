import { 
  users, 
  clients, 
  vehicles, 
  serviceOrders, 
  appointments, 
  inventory, 
  financialTransactions,
  type User, 
  type InsertUser,
  type Client,
  type InsertClient,
  type Vehicle,
  type InsertVehicle,
  type ServiceOrder,
  type InsertServiceOrder,
  type Appointment,
  type InsertAppointment,
  type Inventory,
  type InsertInventory,
  type FinancialTransaction,
  type InsertFinancialTransaction
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, asc, count, sum, lt, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

// Dashboard KPIs interface
export interface DashboardKPIs {
  openOrders: number;
  inProgressOrders: number;
  monthlyRevenue: number;
  criticalStock: number;
  lowStock: number;
  todayAppointments: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Employees management
  getEmployees(unit?: string, role?: string): Promise<User[]>;
  createEmployee(employee: InsertUser): Promise<User>;
  updateEmployee(id: string, employee: Partial<InsertUser>): Promise<User>;
  
  // Clients
  getClients(unit?: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  
  // Vehicles
  getVehicles(unit?: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;
  
  // Service Orders
  getServiceOrders(unit?: string): Promise<ServiceOrder[]>;
  createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder>;
  updateServiceOrder(id: string, order: Partial<InsertServiceOrder>): Promise<ServiceOrder>;
  deleteServiceOrder(id: string): Promise<void>;
  generateOSNumber(unit: string): Promise<string>;
  
  // Appointments
  getAppointments(unit?: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;
  
  // Inventory
  getInventory(unit?: string): Promise<Inventory[]>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventoryItem(id: string): Promise<void>;
  getLowStockItems(unit?: string): Promise<Inventory[]>;
  getCriticalStockItems(unit?: string): Promise<Inventory[]>;
  
  // Financial
  getFinancialTransactions(unit?: string): Promise<FinancialTransaction[]>;
  createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction>;
  updateFinancialTransaction(id: string, transaction: Partial<InsertFinancialTransaction>): Promise<FinancialTransaction>;
  deleteFinancialTransaction(id: string): Promise<void>;
  
  // Dashboard KPIs
  getDashboardKPIs(unit?: string): Promise<DashboardKPIs>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Employees management
  async getEmployees(unit?: string, role?: string): Promise<User[]> {
    const conditions = [];
    if (unit && unit !== 'all') {
      conditions.push(eq(users.unit, unit as any));
    }
    if (role && role !== 'all') {
      conditions.push(eq(users.role, role as any));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(users).where(and(...conditions)).orderBy(desc(users.createdAt));
    }
    
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createEmployee(insertEmployee: InsertUser): Promise<User> {
    const [employee] = await db
      .insert(users)
      .values(insertEmployee)
      .returning();
    return employee;
  }

  async updateEmployee(id: string, employee: Partial<InsertUser>): Promise<User> {
    const [updatedEmployee] = await db
      .update(users)
      .set(employee)
      .where(eq(users.id, id))
      .returning();
    return updatedEmployee;
  }

  // Clients
  async getClients(unit?: string): Promise<Client[]> {
    if (unit && unit !== 'all') {
      return await db.select().from(clients).where(eq(clients.unit, unit as any)).orderBy(desc(clients.createdAt));
    }
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db.update(clients).set(client).where(eq(clients.id, id)).returning();
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Vehicles
  async getVehicles(unit?: string): Promise<Vehicle[]> {
    if (unit && unit !== 'all') {
      return await db.select().from(vehicles).where(eq(vehicles.unit, unit as any)).orderBy(desc(vehicles.createdAt));
    }
    return await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle> {
    const [updatedVehicle] = await db.update(vehicles).set(vehicle).where(eq(vehicles.id, id)).returning();
    return updatedVehicle;
  }

  async deleteVehicle(id: string): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Service Orders
  async getServiceOrders(unit?: string): Promise<ServiceOrder[]> {
    if (unit && unit !== 'all') {
      return await db.select().from(serviceOrders).where(eq(serviceOrders.unit, unit as any)).orderBy(desc(serviceOrders.createdAt));
    }
    return await db.select().from(serviceOrders).orderBy(desc(serviceOrders.createdAt));
  }

  async createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder> {
    const [newOrder] = await db.insert(serviceOrders).values(order).returning();
    return newOrder;
  }

  async updateServiceOrder(id: string, order: Partial<InsertServiceOrder>): Promise<ServiceOrder> {
    const [updatedOrder] = await db.update(serviceOrders).set(order).where(eq(serviceOrders.id, id)).returning();
    return updatedOrder;
  }

  async deleteServiceOrder(id: string): Promise<void> {
    await db.delete(serviceOrders).where(eq(serviceOrders.id, id));
  }

  async generateOSNumber(unit: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const yearMonth = `${year}${month}`;
    
    // Count orders for this unit and this year-month
    const result = await db.select({ count: count() })
      .from(serviceOrders)
      .where(and(
        eq(serviceOrders.unit, unit as any),
        sql`EXTRACT(YEAR FROM created_at) = ${now.getFullYear()}`,
        sql`EXTRACT(MONTH FROM created_at) = ${now.getMonth() + 1}`
      ));
    
    const nextNumber = (result[0]?.count || 0) + 1;
    return `${unit}-${yearMonth}-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Appointments
  async getAppointments(unit?: string): Promise<Appointment[]> {
    if (unit && unit !== 'all') {
      return await db.select().from(appointments).where(eq(appointments.unit, unit as any)).orderBy(asc(appointments.scheduledDate));
    }
    return await db.select().from(appointments).orderBy(asc(appointments.scheduledDate));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const [updatedAppointment] = await db.update(appointments).set(appointment).where(eq(appointments.id, id)).returning();
    return updatedAppointment;
  }

  async deleteAppointment(id: string): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  // Inventory
  async getInventory(unit?: string): Promise<Inventory[]> {
    if (unit && unit !== 'all') {
      return await db.select().from(inventory).where(eq(inventory.unit, unit as any)).orderBy(asc(inventory.name));
    }
    return await db.select().from(inventory).orderBy(asc(inventory.name));
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory> {
    const [updatedItem] = await db.update(inventory).set(item).where(eq(inventory.id, id)).returning();
    return updatedItem;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  async getLowStockItems(unit?: string): Promise<Inventory[]> {
    const condition = unit && unit !== 'all' 
      ? and(eq(inventory.unit, unit as any), lt(inventory.currentQuantity, inventory.minimumQuantity))
      : lt(inventory.currentQuantity, inventory.minimumQuantity);
    
    return await db.select().from(inventory).where(condition);
  }

  async getCriticalStockItems(unit?: string): Promise<Inventory[]> {
    const condition = unit && unit !== 'all' 
      ? and(eq(inventory.unit, unit as any), eq(inventory.currentQuantity, 0))
      : eq(inventory.currentQuantity, 0);
    
    return await db.select().from(inventory).where(condition);
  }

  // Financial
  async getFinancialTransactions(unit?: string): Promise<FinancialTransaction[]> {
    if (unit && unit !== 'all') {
      return await db.select().from(financialTransactions).where(eq(financialTransactions.unit, unit as any)).orderBy(desc(financialTransactions.createdAt));
    }
    return await db.select().from(financialTransactions).orderBy(desc(financialTransactions.createdAt));
  }

  async createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction> {
    const [newTransaction] = await db.insert(financialTransactions).values(transaction).returning();
    return newTransaction;
  }

  async updateFinancialTransaction(id: string, transaction: Partial<InsertFinancialTransaction>): Promise<FinancialTransaction> {
    const [updatedTransaction] = await db.update(financialTransactions).set(transaction).where(eq(financialTransactions.id, id)).returning();
    return updatedTransaction;
  }

  async deleteFinancialTransaction(id: string): Promise<void> {
    await db.delete(financialTransactions).where(eq(financialTransactions.id, id));
  }

  // Dashboard KPIs
  async getDashboardKPIs(unit?: string): Promise<DashboardKPIs> {
    const whereCondition = unit && unit !== 'all' ? eq(serviceOrders.unit, unit as any) : undefined;
    
    // Open orders
    const openOrders = await db.select({ count: count() })
      .from(serviceOrders)
      .where(whereCondition ? and(whereCondition, eq(serviceOrders.status, 'open')) : eq(serviceOrders.status, 'open'));
    
    // In progress orders
    const inProgressOrders = await db.select({ count: count() })
      .from(serviceOrders)
      .where(whereCondition ? and(whereCondition, eq(serviceOrders.status, 'in_progress')) : eq(serviceOrders.status, 'in_progress'));
    
    // Monthly revenue
    const monthlyRevenue = await db.select({ total: sum(serviceOrders.totalValue) })
      .from(serviceOrders)
      .where(whereCondition);
    
    // Critical stock
    const criticalStock = await this.getCriticalStockItems(unit);
    const lowStock = await this.getLowStockItems(unit);
    
    // Today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await db.select({ count: count() })
      .from(appointments)
      .where(unit && unit !== 'all' 
        ? and(eq(appointments.unit, unit as any), eq(appointments.scheduledDate, today))
        : eq(appointments.scheduledDate, today));

    return {
      openOrders: openOrders[0]?.count || 0,
      inProgressOrders: inProgressOrders[0]?.count || 0,
      monthlyRevenue: Number(monthlyRevenue[0]?.total || 0),
      criticalStock: criticalStock.length,
      lowStock: lowStock.length,
      todayAppointments: todayAppointments[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
