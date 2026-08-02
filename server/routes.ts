import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import {
  insertStoreSchema,
  insertClientSchema,
  insertVehicleSchema,
  insertServiceOrderSchema,
  insertAppointmentSchema,
  insertInventorySchema,
  insertFinancialCategorySchema,
  insertSupplierSchema,
  insertFinancialTransactionSchema,
  insertUserSchema,
  createInvoiceSchema,
} from "@shared/schema";
import { handleError, successResponse, AppError } from "./utils/errorHandler";

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Authorization middleware for roles
function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

// Store access middleware - ensures user can only access their store's data (unless admin)
function requireStoreAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const requestedStoreId = (req.query.storeId as string) || req.body.storeId;

  // Admins can access all stores
  if (req.user.role === 'admin') {
    return next();
  }

  // Other users can only access their own store or 'all' (which will be filtered down to their store)
  if (requestedStoreId && requestedStoreId !== 'all' && requestedStoreId !== req.user.storeId) {
    return res.status(403).json({ error: "Access denied to this store" });
  }

  next();
}

// Resolves the store scope a request should actually run under: admins may
// query any store (or all of them); everyone else is pinned to their own.
function effectiveStoreId(req: Request): string | undefined {
  const requested = req.query.storeId as string | undefined;
  return req.user?.role === 'admin' ? requested : req.user?.storeId;
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Dashboard KPIs
  app.get("/api/dashboard/kpis", requireAuth, requireStoreAccess, async (req, res) => {
    try {
      const kpis = await storage.getDashboardKPIs(effectiveStoreId(req));
      res.json(successResponse(kpis));
    } catch (error) {
      handleError(error, res);
    }
  });

  // Public, minimal store directory - used only by the self-registration
  // form so a new account can be assigned to a store before login. Exposes
  // no fiscal data (CNPJ, provider keys, etc.), unlike the authenticated
  // /api/stores route below.
  app.get("/api/stores/public", async (_req, res) => {
    try {
      const activeStores = await storage.getStores(false);
      const publicStores = activeStores.map(({ id, code, name, color }) => ({ id, code, name, color }));
      res.json(successResponse(publicStores));
    } catch (error) {
      handleError(error, res);
    }
  });

  // Stores (Lojas) routes
  app.get("/api/stores", requireAuth, async (req, res) => {
    try {
      const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true';
      const stores = await storage.getStores(includeInactive);
      res.json(successResponse(stores));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/stores", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const validatedData = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(validatedData);
      res.status(201).json(successResponse(store));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put("/api/stores/:id", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const validatedData = insertStoreSchema.partial().parse(req.body);
      const store = await storage.updateStore(req.params.id, validatedData);
      res.json(successResponse(store));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.delete("/api/stores/:id", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const store = await storage.deactivateStore(req.params.id);
      res.json(successResponse(store));
    } catch (error) {
      handleError(error, res);
    }
  });

  // Clients routes
  app.get("/api/clients", requireAuth, requireStoreAccess, async (req, res) => {
    try {
      const clients = await storage.getClients(effectiveStoreId(req));
      res.json(successResponse(clients));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/clients", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.storeId = req.user!.storeId;
      }
      const client = await storage.createClient(validatedData);
      res.status(201).json(successResponse(client));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put("/api/clients/:id", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = insertClientSchema.partial().parse(req.body);

      if (!validatedData || Object.keys(validatedData).length === 0) {
        throw new AppError("Nenhum dado fornecido para atualização", 400);
      }

      const client = await storage.updateClient(req.params.id, validatedData);

      if (!client) {
        throw new AppError("Cliente não encontrado", 404);
      }

      res.json(successResponse(client));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.delete("/api/clients/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const deleted = await storage.deleteClient(req.params.id);

      if (!deleted) {
        throw new AppError("Cliente não encontrado", 404);
      }

      res.json(successResponse({ message: "Cliente excluído com sucesso" }));
    } catch (error) {
      handleError(error, res);
    }
  });

  // Vehicles routes
  app.get("/api/vehicles", requireAuth, requireStoreAccess, async (req, res) => {
    try {
      const vehicles = await storage.getVehicles(effectiveStoreId(req));
      res.json(successResponse(vehicles));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/vehicles", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.storeId = req.user!.storeId;
      }
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(successResponse(vehicle));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put("/api/vehicles/:id", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(req.params.id, validatedData);
      res.json(successResponse(vehicle));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.delete("/api/vehicles/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Service Orders routes
  app.get("/api/service-orders", requireAuth, requireStoreAccess, async (req, res) => {
    try {
      const orders = await storage.getServiceOrders(effectiveStoreId(req));
      res.json(successResponse(orders));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.get("/api/service-orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getServiceOrder(req.params.id);
      if (!order) {
        throw new AppError("Ordem de serviço não encontrada", 404);
      }
      if (req.user?.role !== 'admin' && order.storeId !== req.user?.storeId) {
        throw new AppError("Acesso negado a esta loja", 403);
      }
      res.json(successResponse(order));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/service-orders", requireAuth, requireRole(['admin', 'manager', 'mechanic']), async (req, res) => {
    try {
      const validatedData = insertServiceOrderSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.storeId = req.user!.storeId;
      }
      const osNumber = await storage.generateOSNumber(validatedData.storeId);
      const orderWithNumber = { ...validatedData, osNumber };
      const order = await storage.createServiceOrder(orderWithNumber);
      res.status(201).json(successResponse(order));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put("/api/service-orders/:id", requireAuth, requireRole(['admin', 'manager', 'mechanic']), async (req, res) => {
    try {
      const validatedData = insertServiceOrderSchema.partial().parse(req.body);
      const order = await storage.updateServiceOrder(req.params.id, validatedData);
      res.json(successResponse(order));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.delete("/api/service-orders/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteServiceOrder(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Appointments routes
  app.get("/api/appointments", requireAuth, requireStoreAccess, async (req, res) => {
    try {
      const appointments = await storage.getAppointments(effectiveStoreId(req));
      res.json(successResponse(appointments));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/appointments", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.storeId = req.user!.storeId;
      }
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(successResponse(appointment));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put("/api/appointments/:id", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(req.params.id, validatedData);
      res.json(successResponse(appointment));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.delete("/api/appointments/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteAppointment(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Inventory routes
  app.get("/api/inventory", requireAuth, requireStoreAccess, async (req, res) => {
    try {
      const inventory = await storage.getInventory(effectiveStoreId(req));
      res.json(successResponse(inventory));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.get("/api/inventory/alerts", requireAuth, requireStoreAccess, async (req, res) => {
    try {
      const storeId = effectiveStoreId(req);
      const critical = await storage.getCriticalStockItems(storeId);
      const low = await storage.getLowStockItems(storeId);
      res.json(successResponse({ critical, low }));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/inventory", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.storeId = req.user!.storeId;
      }
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(successResponse(item));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put("/api/inventory/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertInventorySchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(req.params.id, validatedData);
      res.json(successResponse(item));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.delete("/api/inventory/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteInventoryItem(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Financial categories routes
  app.get("/api/financial-categories", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const categories = await storage.getFinancialCategories(req.user?.role === 'admin' && req.query.includeInactive === 'true');
      res.json(successResponse(categories));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/financial-categories", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertFinancialCategorySchema.parse(req.body);
      const category = await storage.createFinancialCategory(validatedData);
      res.status(201).json(successResponse(category));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put("/api/financial-categories/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertFinancialCategorySchema.partial().parse(req.body);
      const category = await storage.updateFinancialCategory(req.params.id, validatedData);
      res.json(successResponse(category));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.delete("/api/financial-categories/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteFinancialCategory(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Suppliers routes
  app.get("/api/suppliers", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers(req.user?.role === 'admin' && req.query.includeInactive === 'true');
      res.json(successResponse(suppliers));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/suppliers", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(successResponse(supplier));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put("/api/suppliers/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, validatedData);
      res.json(successResponse(supplier));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.delete("/api/suppliers/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteSupplier(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Financial (Despesas/Receitas) routes
  app.get("/api/financial", requireAuth, requireRole(['admin', 'manager']), requireStoreAccess, async (req, res) => {
    try {
      const transactions = await storage.getFinancialTransactions(effectiveStoreId(req));
      res.json(successResponse(transactions));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.get("/api/financial/by-store/:month", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const breakdown = await storage.getExpensesByStore(req.params.month);
      res.json(successResponse(breakdown));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/financial", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertFinancialTransactionSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.storeId = req.user!.storeId;
      }
      const transaction = await storage.createFinancialTransaction(validatedData);
      res.status(201).json(successResponse(transaction));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put("/api/financial/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertFinancialTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateFinancialTransaction(req.params.id, validatedData);
      res.json(successResponse(transaction));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.delete("/api/financial/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteFinancialTransaction(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Invoices (Notas Fiscais) routes
  app.get("/api/invoices", requireAuth, requireRole(['admin', 'manager', 'seller']), requireStoreAccess, async (req, res) => {
    try {
      const invoices = await storage.getInvoices(effectiveStoreId(req));
      res.json(successResponse(invoices));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.get("/api/invoices/:id", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        throw new AppError("Nota fiscal não encontrada", 404);
      }
      if (req.user?.role !== 'admin' && invoice.storeId !== req.user?.storeId) {
        throw new AppError("Acesso negado a esta loja", 403);
      }
      res.json(successResponse(invoice));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/invoices", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = createInvoiceSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.storeId = req.user!.storeId;
      }
      const invoice = await storage.createDraftInvoice(validatedData);
      res.status(201).json(successResponse(invoice));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/invoices/:id/issue", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const existing = await storage.getInvoice(req.params.id);
      if (!existing) {
        throw new AppError("Nota fiscal não encontrada", 404);
      }
      if (req.user?.role !== 'admin' && existing.storeId !== req.user?.storeId) {
        throw new AppError("Acesso negado a esta loja", 403);
      }
      const invoice = await storage.issueInvoice(req.params.id);
      res.json(successResponse(invoice));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/invoices/:id/cancel", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const existing = await storage.getInvoice(req.params.id);
      if (!existing) {
        throw new AppError("Nota fiscal não encontrada", 404);
      }
      if (req.user?.role !== 'admin' && existing.storeId !== req.user?.storeId) {
        throw new AppError("Acesso negado a esta loja", 403);
      }
      const reason = (req.body?.reason as string) || "Cancelada pelo usuário";
      const invoice = await storage.cancelInvoice(req.params.id, reason);
      res.json(successResponse(invoice));
    } catch (error) {
      handleError(error, res);
    }
  });

  // Employees routes
  app.get("/api/employees", requireAuth, requireRole(['admin', 'manager', 'hr']), async (req, res) => {
    try {
      const storeId = req.user?.role === 'admin' ? (req.query.storeId as string | undefined) : req.user?.storeId;
      const role = req.query.role as string | undefined;
      const employees = await storage.getEmployees(storeId, role === 'all' ? undefined : role);
      res.json(successResponse(employees));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/employees", requireAuth, requireRole(['admin', 'hr']), async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.storeId = req.user!.storeId;
      }
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(successResponse(employee));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put("/api/employees/:id", requireAuth, requireRole(['admin', 'hr']), async (req, res) => {
    try {
      const validatedData = insertUserSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(req.params.id, validatedData);
      res.json(successResponse(employee));
    } catch (error) {
      handleError(error, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
