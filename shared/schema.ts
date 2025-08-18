import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const unitEnum = pgEnum('unit', ['SP1', 'SP2', 'SOR']);
export const roleEnum = pgEnum('role', ['admin', 'manager', 'mechanic', 'seller']);
export const osStatusEnum = pgEnum('os_status', ['open', 'in_progress', 'completed', 'billed']);
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);
export const paymentMethodEnum = pgEnum('payment_method', ['pix', 'card', 'cash', 'bank_slip']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: roleEnum("role").notNull().default('mechanic'),
  unit: unitEnum("unit").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cpfCnpj: text("cpf_cnpj").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  unit: unitEnum("unit").notNull(),
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
  unit: unitEnum("unit").notNull(),
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
  unit: unitEnum("unit").notNull(),
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
  unit: unitEnum("unit").notNull(),
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
  unit: unitEnum("unit").notNull(),
  currentQuantity: integer("current_quantity").notNull().default(0),
  minimumQuantity: integer("minimum_quantity").notNull().default(0),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  supplier: text("supplier"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Financial Transactions table
export const financialTransactions = pgTable("financial_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: transactionTypeEnum("type").notNull(),
  unit: unitEnum("unit").notNull(),
  clientSupplierId: varchar("client_supplier_id"),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  serviceOrderId: varchar("service_order_id").references(() => serviceOrders.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  serviceOrders: many(serviceOrders),
  appointments: many(appointments),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  vehicles: many(vehicles),
  serviceOrders: many(serviceOrders),
  appointments: many(appointments),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  client: one(clients, {
    fields: [vehicles.clientId],
    references: [clients.id],
  }),
  serviceOrders: many(serviceOrders),
  appointments: many(appointments),
}));

export const serviceOrdersRelations = relations(serviceOrders, ({ one }) => ({
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
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
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
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
