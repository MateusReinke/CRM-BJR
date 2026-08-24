import {
  stores,
  users,
  clients,
  vehicles,
  serviceOrders,
  appointments,
  inventory,
  financialCategories,
  suppliers,
  financialTransactions,
  invoices,
  invoiceItems,
  type Store,
  type InsertStore,
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
  type FinancialCategory,
  type InsertFinancialCategory,
  type Supplier,
  type InsertSupplier,
  type FinancialTransaction,
  type InsertFinancialTransaction,
  type Invoice,
  type InvoiceItem,
  type CreateInvoiceInput,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, asc, count, sum, lt, gt, sql, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { AppError } from "./utils/errorHandler";
import { getNFeProvider } from "./nfe";

const PostgresSessionStore = connectPg(session);

// Dashboard KPIs interface
export interface DashboardKPIs {
  openOrders: number;
  inProgressOrders: number;
  monthlyRevenue: number;
  criticalStock: number;
  lowStock: number;
  todayAppointments: number;
  monthlyExpenses: number;
  invoicesIssuedThisMonth: number;
}

export interface InvoiceWithRelations extends Invoice {
  items: InvoiceItem[];
  store: Store;
  client: Client;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  setPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  getUserByValidResetToken(tokenHash: string): Promise<User | undefined>;
  resetPassword(userId: string, hashedPassword: string): Promise<void>;

  // Stores (Lojas)
  getStores(includeInactive?: boolean): Promise<Store[]>;
  getStore(id: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, store: Partial<InsertStore>): Promise<Store>;
  deactivateStore(id: string): Promise<Store>;

  // Employees management
  getEmployees(storeId?: string, role?: string): Promise<User[]>;
  createEmployee(employee: InsertUser): Promise<User>;
  updateEmployee(id: string, employee: Partial<InsertUser>): Promise<User>;

  // Clients
  getClients(storeId?: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<boolean>;

  // Vehicles
  getVehicles(storeId?: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;

  // Service Orders
  getServiceOrders(storeId?: string): Promise<ServiceOrder[]>;
  getServiceOrder(id: string): Promise<ServiceOrder | undefined>;
  createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder>;
  updateServiceOrder(id: string, order: Partial<InsertServiceOrder>): Promise<ServiceOrder>;
  deleteServiceOrder(id: string): Promise<void>;
  generateOSNumber(storeId: string): Promise<string>;

  // Appointments
  getAppointments(storeId?: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;

  // Inventory
  getInventory(storeId?: string): Promise<Inventory[]>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventoryItem(id: string): Promise<void>;
  getLowStockItems(storeId?: string): Promise<Inventory[]>;
  getCriticalStockItems(storeId?: string): Promise<Inventory[]>;

  // Financial categories & suppliers
  getFinancialCategories(includeInactive?: boolean): Promise<FinancialCategory[]>;
  createFinancialCategory(category: InsertFinancialCategory): Promise<FinancialCategory>;
  updateFinancialCategory(id: string, category: Partial<InsertFinancialCategory>): Promise<FinancialCategory>;
  deleteFinancialCategory(id: string): Promise<void>;

  getSuppliers(includeInactive?: boolean): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;

  // Financial
  getFinancialTransactions(storeId?: string): Promise<FinancialTransaction[]>;
  createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction>;
  updateFinancialTransaction(id: string, transaction: Partial<InsertFinancialTransaction>): Promise<FinancialTransaction>;
  deleteFinancialTransaction(id: string): Promise<void>;
  getExpensesByStore(month: string): Promise<{ storeId: string; total: number }[]>;

  // Invoices (Notas Fiscais)
  getInvoices(storeId?: string): Promise<InvoiceWithRelations[]>;
  getInvoice(id: string): Promise<InvoiceWithRelations | undefined>;
  createDraftInvoice(input: CreateInvoiceInput): Promise<InvoiceWithRelations>;
  issueInvoice(id: string): Promise<InvoiceWithRelations>;
  cancelInvoice(id: string, reason: string): Promise<InvoiceWithRelations>;

  // Dashboard KPIs
  getDashboardKPIs(storeId?: string): Promise<DashboardKPIs>;

  sessionStore: session.Store;
}

function storeFilter(column: any, storeId?: string) {
  return storeId && storeId !== 'all' ? eq(column, storeId) : undefined;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async setPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await db
      .update(users)
      .set({ resetPasswordTokenHash: tokenHash, resetPasswordTokenExpiresAt: expiresAt })
      .where(eq(users.id, userId));
  }

  async getUserByValidResetToken(tokenHash: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.resetPasswordTokenHash, tokenHash), gt(users.resetPasswordTokenExpiresAt, new Date())));
    return user || undefined;
  }

  async resetPassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, resetPasswordTokenHash: null, resetPasswordTokenExpiresAt: null })
      .where(eq(users.id, userId));
  }

  // Stores (Lojas)
  async getStores(includeInactive = false): Promise<Store[]> {
    if (includeInactive) {
      return await db.select().from(stores).orderBy(asc(stores.name));
    }
    return await db.select().from(stores).where(eq(stores.isActive, true)).orderBy(asc(stores.name));
  }

  async getStore(id: string): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store || undefined;
  }

  async createStore(store: InsertStore): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }

  async updateStore(id: string, store: Partial<InsertStore>): Promise<Store> {
    const [updatedStore] = await db.update(stores).set(store).where(eq(stores.id, id)).returning();
    if (!updatedStore) {
      throw new AppError("Loja não encontrada", 404);
    }
    return updatedStore;
  }

  async deactivateStore(id: string): Promise<Store> {
    const [updatedStore] = await db.update(stores).set({ isActive: false }).where(eq(stores.id, id)).returning();
    if (!updatedStore) {
      throw new AppError("Loja não encontrada", 404);
    }
    return updatedStore;
  }

  // Employees management
  async getEmployees(storeId?: string, role?: string): Promise<User[]> {
    const conditions = [];
    const storeCond = storeFilter(users.storeId, storeId);
    if (storeCond) conditions.push(storeCond);
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
  async getClients(storeId?: string): Promise<Client[]> {
    const cond = storeFilter(clients.storeId, storeId);
    if (cond) {
      return await db.select().from(clients).where(cond).orderBy(desc(clients.createdAt));
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

  async deleteClient(id: string): Promise<boolean> {
    const deleted = await db.delete(clients).where(eq(clients.id, id)).returning({ id: clients.id });
    return deleted.length > 0;
  }

  // Vehicles
  async getVehicles(storeId?: string): Promise<Vehicle[]> {
    const cond = storeFilter(vehicles.storeId, storeId);
    if (cond) {
      return await db.select().from(vehicles).where(cond).orderBy(desc(vehicles.createdAt));
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
  async getServiceOrders(storeId?: string): Promise<ServiceOrder[]> {
    const cond = storeFilter(serviceOrders.storeId, storeId);
    if (cond) {
      return await db.select().from(serviceOrders).where(cond).orderBy(desc(serviceOrders.createdAt));
    }
    return await db.select().from(serviceOrders).orderBy(desc(serviceOrders.createdAt));
  }

  async getServiceOrder(id: string): Promise<ServiceOrder | undefined> {
    const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
    return order || undefined;
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

  async generateOSNumber(storeId: string): Promise<string> {
    const store = await this.getStore(storeId);
    if (!store) {
      throw new AppError("Loja não encontrada", 404);
    }
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const yearMonth = `${year}${month}`;

    const result = await db.select({ count: count() })
      .from(serviceOrders)
      .where(and(
        eq(serviceOrders.storeId, storeId),
        sql`EXTRACT(YEAR FROM created_at) = ${now.getFullYear()}`,
        sql`EXTRACT(MONTH FROM created_at) = ${now.getMonth() + 1}`
      ));

    const nextNumber = (result[0]?.count || 0) + 1;
    return `${store.code}-${yearMonth}-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Appointments
  async getAppointments(storeId?: string): Promise<Appointment[]> {
    const cond = storeFilter(appointments.storeId, storeId);
    if (cond) {
      return await db.select().from(appointments).where(cond).orderBy(asc(appointments.scheduledDate));
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
  async getInventory(storeId?: string): Promise<Inventory[]> {
    const cond = storeFilter(inventory.storeId, storeId);
    if (cond) {
      return await db.select().from(inventory).where(cond).orderBy(asc(inventory.name));
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

  async getLowStockItems(storeId?: string): Promise<Inventory[]> {
    const storeCond = storeFilter(inventory.storeId, storeId);
    const condition = storeCond
      ? and(storeCond, lt(inventory.currentQuantity, inventory.minimumQuantity))
      : lt(inventory.currentQuantity, inventory.minimumQuantity);

    return await db.select().from(inventory).where(condition);
  }

  async getCriticalStockItems(storeId?: string): Promise<Inventory[]> {
    const storeCond = storeFilter(inventory.storeId, storeId);
    const condition = storeCond
      ? and(storeCond, eq(inventory.currentQuantity, 0))
      : eq(inventory.currentQuantity, 0);

    return await db.select().from(inventory).where(condition);
  }

  // Financial categories & suppliers
  async getFinancialCategories(includeInactive = false): Promise<FinancialCategory[]> {
    if (includeInactive) {
      return await db.select().from(financialCategories).orderBy(asc(financialCategories.name));
    }
    return await db.select().from(financialCategories).where(eq(financialCategories.isActive, true)).orderBy(asc(financialCategories.name));
  }

  async createFinancialCategory(category: InsertFinancialCategory): Promise<FinancialCategory> {
    const [newCategory] = await db.insert(financialCategories).values(category).returning();
    return newCategory;
  }

  async updateFinancialCategory(id: string, category: Partial<InsertFinancialCategory>): Promise<FinancialCategory> {
    const [updated] = await db.update(financialCategories).set(category).where(eq(financialCategories.id, id)).returning();
    if (!updated) throw new AppError("Categoria não encontrada", 404);
    return updated;
  }

  async deleteFinancialCategory(id: string): Promise<void> {
    await db.update(financialCategories).set({ isActive: false }).where(eq(financialCategories.id, id));
  }

  async getSuppliers(includeInactive = false): Promise<Supplier[]> {
    if (includeInactive) {
      return await db.select().from(suppliers).orderBy(asc(suppliers.name));
    }
    return await db.select().from(suppliers).where(eq(suppliers.isActive, true)).orderBy(asc(suppliers.name));
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [updated] = await db.update(suppliers).set(supplier).where(eq(suppliers.id, id)).returning();
    if (!updated) throw new AppError("Fornecedor não encontrado", 404);
    return updated;
  }

  async deleteSupplier(id: string): Promise<void> {
    await db.update(suppliers).set({ isActive: false }).where(eq(suppliers.id, id));
  }

  // Financial
  async getFinancialTransactions(storeId?: string): Promise<FinancialTransaction[]> {
    const cond = storeFilter(financialTransactions.storeId, storeId);
    if (cond) {
      return await db.select().from(financialTransactions).where(cond).orderBy(desc(financialTransactions.transactionDate));
    }
    return await db.select().from(financialTransactions).orderBy(desc(financialTransactions.transactionDate));
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

  async getExpensesByStore(month: string): Promise<{ storeId: string; total: number }[]> {
    const [year, monthNum] = month.split('-').map(Number);
    const rows = await db.select({ storeId: financialTransactions.storeId, total: sum(financialTransactions.amount) })
      .from(financialTransactions)
      .where(and(
        eq(financialTransactions.type, 'expense'),
        sql`EXTRACT(YEAR FROM transaction_date) = ${year}`,
        sql`EXTRACT(MONTH FROM transaction_date) = ${monthNum}`
      ))
      .groupBy(financialTransactions.storeId);
    return rows.map(r => ({ storeId: r.storeId, total: Number(r.total || 0) }));
  }

  // Invoices (Notas Fiscais)
  private async attachInvoiceRelations(invoiceRows: Invoice[]): Promise<InvoiceWithRelations[]> {
    if (invoiceRows.length === 0) return [];
    const ids = invoiceRows.map(i => i.id);
    const items = await db.select().from(invoiceItems).where(inArray(invoiceItems.invoiceId, ids));
    const storeIds = Array.from(new Set(invoiceRows.map(i => i.storeId)));
    const clientIds = Array.from(new Set(invoiceRows.map(i => i.clientId)));
    const storeRows = storeIds.length ? await db.select().from(stores).where(inArray(stores.id, storeIds)) : [];
    const clientRows = clientIds.length ? await db.select().from(clients).where(inArray(clients.id, clientIds)) : [];
    const storeMap = new Map(storeRows.map(s => [s.id, s]));
    const clientMap = new Map(clientRows.map(c => [c.id, c]));

    return invoiceRows.map(invoice => ({
      ...invoice,
      items: items.filter(it => it.invoiceId === invoice.id),
      store: storeMap.get(invoice.storeId)!,
      client: clientMap.get(invoice.clientId)!,
    }));
  }

  async getInvoices(storeId?: string): Promise<InvoiceWithRelations[]> {
    const cond = storeFilter(invoices.storeId, storeId);
    const rows = cond
      ? await db.select().from(invoices).where(cond).orderBy(desc(invoices.createdAt))
      : await db.select().from(invoices).orderBy(desc(invoices.createdAt));
    return this.attachInvoiceRelations(rows);
  }

  async getInvoice(id: string): Promise<InvoiceWithRelations | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;
    const [withRelations] = await this.attachInvoiceRelations([invoice]);
    return withRelations;
  }

  async createDraftInvoice(input: CreateInvoiceInput): Promise<InvoiceWithRelations> {
    const store = await this.getStore(input.storeId);
    if (!store) throw new AppError("Loja não encontrada", 404);

    const [client] = await db.select().from(clients).where(eq(clients.id, input.clientId));
    if (!client) throw new AppError("Cliente não encontrado", 404);

    if (input.type !== 'nfse' && !store.inscricaoEstadual) {
      throw new AppError("Configure a Inscrição Estadual da loja antes de emitir NF-e/NFC-e de produtos.", 400);
    }

    const itemsSubtotal = input.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);
    const discount = Number(input.discount || '0');
    const totalAmount = itemsSubtotal - discount;
    if (totalAmount < 0) {
      throw new AppError("O desconto não pode ser maior que o subtotal dos itens", 400);
    }

    const invoice = await db.transaction(async (tx) => {
      const [newInvoice] = await tx.insert(invoices).values({
        storeId: store.id,
        type: input.type,
        status: 'draft',
        clientId: client.id,
        serviceOrderId: input.serviceOrderId,
        description: input.description,
        itemsSubtotal: itemsSubtotal.toFixed(2),
        discount: discount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        taxRegimeSnapshot: store.taxRegime,
        issRate: input.type === 'nfse' ? store.issRate : null,
        provider: store.nfeProvider,
        environment: store.nfeEnvironment,
      }).returning();

      await tx.insert(invoiceItems).values(input.items.map(item => ({
        invoiceId: newInvoice.id,
        inventoryItemId: item.inventoryItemId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: (Number(item.quantity) * Number(item.unitPrice)).toFixed(2),
        ncm: item.ncm,
        cfop: item.cfop,
      })));

      return newInvoice;
    });

    const withRelations = await this.getInvoice(invoice.id);
    return withRelations!;
  }

  async issueInvoice(id: string): Promise<InvoiceWithRelations> {
    const existing = await this.getInvoice(id);
    if (!existing) throw new AppError("Nota fiscal não encontrada", 404);
    if (existing.status !== 'draft' && existing.status !== 'error') {
      throw new AppError(`Nota fiscal já está com status "${existing.status}" e não pode ser reemitida`, 400);
    }

    const seriesColumn = existing.type === 'nfse' ? existing.store.nfseSeries : existing.store.nfeSeries;

    const assigned = await db.transaction(async (tx) => {
      // Atomically increment the store's counter for this document type and
      // read back the pre-increment value as the assigned number.
      const [storeRow] = existing.type === 'nfse'
        ? await tx.update(stores)
            .set({ nfseNextNumber: sql`${stores.nfseNextNumber} + 1` })
            .where(eq(stores.id, existing.storeId))
            .returning({ nextNumber: stores.nfseNextNumber })
        : await tx.update(stores)
            .set({ nfeNextNumber: sql`${stores.nfeNextNumber} + 1` })
            .where(eq(stores.id, existing.storeId))
            .returning({ nextNumber: stores.nfeNextNumber });

      const assignedNumber = storeRow.nextNumber - 1;

      const [updatedInvoice] = await tx.update(invoices).set({
        series: seriesColumn,
        number: assignedNumber,
        status: 'processing',
      }).where(eq(invoices.id, id)).returning();

      return updatedInvoice;
    });

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    const provider = getNFeProvider(existing.store.nfeProvider);
    const result = await provider.issueInvoice({
      invoice: assigned,
      items,
      store: existing.store,
      client: existing.client,
    });

    const [finalInvoice] = await db.update(invoices).set({
      status: result.status,
      accessKey: result.accessKey ?? null,
      externalId: result.externalId ?? null,
      errorMessage: result.errorMessage ?? null,
      issueDate: result.status === 'issued' ? new Date() : null,
    }).where(eq(invoices.id, id)).returning();

    if (result.status === 'error') {
      throw new AppError(result.errorMessage || "Falha ao emitir nota fiscal", 502);
    }

    const withRelations = await this.getInvoice(finalInvoice.id);
    return withRelations!;
  }

  async cancelInvoice(id: string, reason: string): Promise<InvoiceWithRelations> {
    const existing = await this.getInvoice(id);
    if (!existing) throw new AppError("Nota fiscal não encontrada", 404);
    if (existing.status !== 'issued') {
      throw new AppError("Apenas notas emitidas podem ser canceladas", 400);
    }

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    const provider = getNFeProvider(existing.store.nfeProvider);
    const result = await provider.cancelInvoice({
      invoice: existing,
      items,
      store: existing.store,
      client: existing.client,
    }, reason);

    if (result.status === 'error') {
      throw new AppError(result.errorMessage || "Falha ao cancelar nota fiscal", 502);
    }

    const [cancelled] = await db.update(invoices).set({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: reason,
    }).where(eq(invoices.id, id)).returning();

    const withRelations = await this.getInvoice(cancelled.id);
    return withRelations!;
  }

  // Dashboard KPIs
  async getDashboardKPIs(storeId?: string): Promise<DashboardKPIs> {
    const whereCondition = storeFilter(serviceOrders.storeId, storeId);

    const openOrders = await db.select({ count: count() })
      .from(serviceOrders)
      .where(whereCondition ? and(whereCondition, eq(serviceOrders.status, 'open')) : eq(serviceOrders.status, 'open'));

    const inProgressOrders = await db.select({ count: count() })
      .from(serviceOrders)
      .where(whereCondition ? and(whereCondition, eq(serviceOrders.status, 'in_progress')) : eq(serviceOrders.status, 'in_progress'));

    const monthlyRevenue = await db.select({ total: sum(serviceOrders.totalValue) })
      .from(serviceOrders)
      .where(whereCondition);

    const criticalStock = await this.getCriticalStockItems(storeId);
    const lowStock = await this.getLowStockItems(storeId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointmentStoreCond = storeFilter(appointments.storeId, storeId);
    const todayAppointments = await db.select({ count: count() })
      .from(appointments)
      .where(appointmentStoreCond
        ? and(appointmentStoreCond, sql`DATE(scheduled_date) = DATE(${today.toISOString()})`)
        : sql`DATE(scheduled_date) = DATE(${today.toISOString()})`);

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const expensesByStore = await this.getExpensesByStore(currentMonth);
    const monthlyExpenses = storeId && storeId !== 'all'
      ? expensesByStore.find(e => e.storeId === storeId)?.total || 0
      : expensesByStore.reduce((sum, e) => sum + e.total, 0);

    const invoiceStoreCond = storeFilter(invoices.storeId, storeId);
    const invoicesIssued = await db.select({ count: count() })
      .from(invoices)
      .where(invoiceStoreCond
        ? and(invoiceStoreCond, eq(invoices.status, 'issued'), sql`EXTRACT(YEAR FROM issue_date) = ${now.getFullYear()}`, sql`EXTRACT(MONTH FROM issue_date) = ${now.getMonth() + 1}`)
        : and(eq(invoices.status, 'issued'), sql`EXTRACT(YEAR FROM issue_date) = ${now.getFullYear()}`, sql`EXTRACT(MONTH FROM issue_date) = ${now.getMonth() + 1}`));

    return {
      openOrders: openOrders[0]?.count || 0,
      inProgressOrders: inProgressOrders[0]?.count || 0,
      monthlyRevenue: Number(monthlyRevenue[0]?.total || 0),
      criticalStock: criticalStock.length,
      lowStock: lowStock.length,
      todayAppointments: todayAppointments[0]?.count || 0,
      monthlyExpenses,
      invoicesIssuedThisMonth: invoicesIssued[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
