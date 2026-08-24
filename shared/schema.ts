import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['admin', 'manager', 'mechanic', 'seller', 'hr']);
export const osStatusEnum = pgEnum('os_status', ['open', 'in_progress', 'completed', 'billed']);
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);
export const paymentMethodEnum = pgEnum('payment_method', ['pix', 'card', 'cash', 'bank_slip']);
export const taxRegimeEnum = pgEnum('tax_regime', ['simples_nacional', 'lucro_presumido', 'lucro_real', 'mei']);

// Nota fiscal issuing: "simulado" is a local, non-transmitting issuer used until a store configures
// a real provider account + digital certificate. See server/nfe/README.md for what's implemented.
export const nfeProviderEnum = pgEnum('nfe_provider', ['simulado', 'focus_nfe', 'plugnotas', 'enotas', 'nfeio']);
export const nfeEnvironmentEnum = pgEnum('nfe_environment', ['homologacao', 'producao']);
export const invoiceTypeEnum = pgEnum('invoice_type', ['nfse', 'nfe', 'nfce']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'processing', 'issued', 'cancelled', 'error']);

// Stores (Lojas) - each is a legally distinct establishment of the group.
// Replaces the old hardcoded unit enum (SP1/SP2/SOR) so stores can be
// added/edited/deactivated at runtime instead of requiring a schema migration.
export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  color: text("color").notNull().default('#2563eb'),
  isActive: boolean("is_active").notNull().default(true),

  // Address
  cep: text("cep"),
  logradouro: text("logradouro"),
  numero: text("numero"),
  complemento: text("complemento"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  uf: text("uf"),
  phone: text("phone"),
  email: text("email"),

  // Fiscal identity - required to issue real nota fiscal documents
  cnpj: text("cnpj"),
  razaoSocial: text("razao_social"),
  nomeFantasia: text("nome_fantasia"),
  inscricaoEstadual: text("inscricao_estadual"),
  inscricaoMunicipal: text("inscricao_municipal"),
  taxRegime: taxRegimeEnum("tax_regime").notNull().default('simples_nacional'),

  // Nota fiscal issuing configuration (per store, since each CNPJ issues independently)
  nfeProvider: nfeProviderEnum("nfe_provider").notNull().default('simulado'),
  nfeEnvironment: nfeEnvironmentEnum("nfe_environment").notNull().default('homologacao'),
  nfeApiKeyEncrypted: text("nfe_api_key_encrypted"),
  nfseSeries: text("nfse_series").notNull().default('1'),
  nfseNextNumber: integer("nfse_next_number").notNull().default(1),
  nfeSeries: text("nfe_series").notNull().default('1'),
  nfeNextNumber: integer("nfe_next_number").notNull().default(1),
  issRate: decimal("iss_rate", { precision: 5, scale: 2 }).notNull().default('5.00'),

  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: roleEnum("role").notNull().default('mechanic'),
  storeId: varchar("store_id").notNull().references(() => stores.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  // "Esqueci minha senha": tokenHash stores a SHA-256 of the token e-mailed
  // to the user, never the raw token, so a DB read alone can't be used to
  // take over the account. Cleared on use or superseded by a fresh request.
  resetPasswordTokenHash: text("reset_password_token_hash"),
  resetPasswordTokenExpiresAt: timestamp("reset_password_token_expires_at"),
});

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cpfCnpj: text("cpf_cnpj").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  storeId: varchar("store_id").notNull().references(() => stores.id),
  observations: text("observations"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plate: text("plate").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  color: text("color").notNull(),
  chassis: text("chassis"),
  mileage: integer("mileage"),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  storeId: varchar("store_id").notNull().references(() => stores.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Service Orders table
export const serviceOrders = pgTable("service_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  osNumber: text("os_number").notNull().unique(),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  mechanicId: varchar("mechanic_id").notNull().references(() => users.id),
  services: text("services").notNull(),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  status: osStatusEnum("status").notNull().default('open'),
  storeId: varchar("store_id").notNull().references(() => stores.id),
  observations: text("observations"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  mechanicId: varchar("mechanic_id").notNull().references(() => users.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  service: text("service").notNull(),
  storeId: varchar("store_id").notNull().references(() => stores.id),
  observations: text("observations"),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  storeId: varchar("store_id").notNull().references(() => stores.id),
  currentQuantity: integer("current_quantity").notNull().default(0),
  minimumQuantity: integer("minimum_quantity").notNull().default(0),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  ncm: text("ncm"),
  supplier: text("supplier"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Financial Categories (Categorias) - shared taxonomy across the whole group
export const financialCategories = pgTable("financial_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: transactionTypeEnum("type").notNull().default('expense'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Suppliers (Fornecedores) - shared across the whole group
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cpfCnpj: text("cpf_cnpj"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  observations: text("observations"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Invoices (Notas Fiscais) - NFS-e for service orders, NF-e/NFC-e for parts sales
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").notNull().references(() => stores.id),
  type: invoiceTypeEnum("type").notNull(),
  status: invoiceStatusEnum("status").notNull().default('draft'),
  // series/number are only assigned when the invoice is actually issued (kept
  // NULL while in draft) - Postgres treats each NULL as distinct, so drafts
  // never collide on the unique index below.
  series: text("series"),
  number: integer("number"),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  serviceOrderId: varchar("service_order_id").references(() => serviceOrders.id),
  description: text("description").notNull(),
  itemsSubtotal: decimal("items_subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  taxRegimeSnapshot: taxRegimeEnum("tax_regime_snapshot").notNull(),
  issRate: decimal("iss_rate", { precision: 5, scale: 2 }),
  estimatedTaxAmount: decimal("estimated_tax_amount", { precision: 10, scale: 2 }),
  provider: nfeProviderEnum("provider").notNull(),
  environment: nfeEnvironmentEnum("environment").notNull(),
  accessKey: text("access_key"),
  externalId: text("external_id"),
  errorMessage: text("error_message"),
  issueDate: timestamp("issue_date"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => ({
  numberPerStoreIdx: uniqueIndex("invoices_store_type_series_number_idx").on(table.storeId, table.type, table.series, table.number),
}));

// Invoice line items
export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  inventoryItemId: varchar("inventory_item_id").references(() => inventory.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default('1'),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  ncm: text("ncm"),
  cfop: text("cfop"),
});

// Financial Transactions table
export const financialTransactions = pgTable("financial_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: transactionTypeEnum("type").notNull(),
  storeId: varchar("store_id").notNull().references(() => stores.id),
  categoryId: varchar("category_id").references(() => financialCategories.id),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  clientId: varchar("client_id").references(() => clients.id),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  transactionDate: timestamp("transaction_date").notNull().default(sql`now()`),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  serviceOrderId: varchar("service_order_id").references(() => serviceOrders.id),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Relations
export const storesRelations = relations(stores, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  vehicles: many(vehicles),
  serviceOrders: many(serviceOrders),
  appointments: many(appointments),
  inventory: many(inventory),
  financialTransactions: many(financialTransactions),
  invoices: many(invoices),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  store: one(stores, {
    fields: [users.storeId],
    references: [stores.id],
  }),
  serviceOrders: many(serviceOrders),
  appointments: many(appointments),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  store: one(stores, {
    fields: [clients.storeId],
    references: [stores.id],
  }),
  vehicles: many(vehicles),
  serviceOrders: many(serviceOrders),
  appointments: many(appointments),
  invoices: many(invoices),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  client: one(clients, {
    fields: [vehicles.clientId],
    references: [clients.id],
  }),
  store: one(stores, {
    fields: [vehicles.storeId],
    references: [stores.id],
  }),
  serviceOrders: many(serviceOrders),
  appointments: many(appointments),
}));

export const serviceOrdersRelations = relations(serviceOrders, ({ one, many }) => ({
  client: one(clients, {
    fields: [serviceOrders.clientId],
    references: [clients.id],
  }),
  vehicle: one(vehicles, {
    fields: [serviceOrders.vehicleId],
    references: [vehicles.id],
  }),
  mechanic: one(users, {
    fields: [serviceOrders.mechanicId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [serviceOrders.storeId],
    references: [stores.id],
  }),
  invoices: many(invoices),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  vehicle: one(vehicles, {
    fields: [appointments.vehicleId],
    references: [vehicles.id],
  }),
  mechanic: one(users, {
    fields: [appointments.mechanicId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [appointments.storeId],
    references: [stores.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  store: one(stores, {
    fields: [inventory.storeId],
    references: [stores.id],
  }),
}));

export const financialCategoriesRelations = relations(financialCategories, ({ many }) => ({
  transactions: many(financialTransactions),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  transactions: many(financialTransactions),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  store: one(stores, {
    fields: [invoices.storeId],
    references: [stores.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  serviceOrder: one(serviceOrders, {
    fields: [invoices.serviceOrderId],
    references: [serviceOrders.id],
  }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  inventoryItem: one(inventory, {
    fields: [invoiceItems.inventoryItemId],
    references: [inventory.id],
  }),
}));

export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  store: one(stores, {
    fields: [financialTransactions.storeId],
    references: [stores.id],
  }),
  category: one(financialCategories, {
    fields: [financialTransactions.categoryId],
    references: [financialCategories.id],
  }),
  supplier: one(suppliers, {
    fields: [financialTransactions.supplierId],
    references: [suppliers.id],
  }),
  client: one(clients, {
    fields: [financialTransactions.clientId],
    references: [clients.id],
  }),
  invoice: one(invoices, {
    fields: [financialTransactions.invoiceId],
    references: [invoices.id],
  }),
}));

// Insert schemas
export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
  nfseNextNumber: true,
  nfeNextNumber: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  resetPasswordTokenHash: true,
  resetPasswordTokenExpiresAt: true,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// JSON can't carry a real Date instance - it always arrives over the wire as
// an ISO string, so timestamp columns that aren't omitted need z.coerce.date()
// instead of drizzle-zod's default z.date() (which rejects plain strings).
export const insertAppointmentSchema = createInsertSchema(appointments, {
  scheduledDate: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialCategorySchema = createInsertSchema(financialCategories).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions, {
  transactionDate: z.coerce.date(),
  dueDate: z.coerce.date().nullable().optional(),
  paidDate: z.coerce.date().nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
});

// Invoice creation is a workflow (draft -> issue), not a raw table insert: the
// series/number/status/access key are assigned server-side when issued, and
// items belong to a separate child table. This is the contract used by the API.
export const invoiceItemInputSchema = z.object({
  description: z.string().min(1),
  quantity: z.union([z.string(), z.number()]).transform(String).default('1'),
  unitPrice: z.union([z.string(), z.number()]).transform(String),
  inventoryItemId: z.string().optional(),
  ncm: z.string().optional(),
  cfop: z.string().optional(),
});

export const createInvoiceSchema = z.object({
  storeId: z.string().min(1),
  type: z.enum(['nfse', 'nfe', 'nfce']),
  clientId: z.string().min(1),
  serviceOrderId: z.string().optional(),
  description: z.string().min(1),
  discount: z.union([z.string(), z.number()]).transform(String).optional().default('0'),
  items: z.array(invoiceItemInputSchema).min(1),
});

// Types
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type FinancialCategory = typeof financialCategories.$inferSelect;
export type InsertFinancialCategory = z.infer<typeof insertFinancialCategorySchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemInputSchema>;
