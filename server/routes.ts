import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertVehicleSchema, 
  insertServiceOrderSchema, 
  insertAppointmentSchema, 
  insertInventorySchema, 
  insertFinancialTransactionSchema,
  insertUserSchema
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

// Unit access middleware - ensures user can only access their unit data (unless admin)
function requireUnitAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const requestedUnit = req.query.unit as string || req.body.unit;
  
  // Admins can access all units
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Other users can only access their own unit or 'all' (which will be filtered by their unit)
  if (requestedUnit && requestedUnit !== 'all' && requestedUnit !== req.user.unit) {
    return res.status(403).json({ error: "Access denied to this unit" });
  }
  
  next();
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Dashboard KPIs
  app.get("/api/dashboard/kpis", requireAuth, requireUnitAccess, async (req, res) => {
    try {
      const unit = req.query.unit as string;
      // Non-admins can only see their own unit data
      const effectiveUnit = req.user?.role === 'admin' ? unit : req.user?.unit;
      const kpis = await storage.getDashboardKPIs(effectiveUnit);
      res.json(successResponse(kpis));
    } catch (error) {
      handleError(error, res);
    }
  });

  // Clients routes
  app.get("/api/clients", requireAuth, requireUnitAccess, async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const effectiveUnit = req.user?.role === 'admin' ? unit : req.user?.unit;
      const clients = await storage.getClients(effectiveUnit);
      res.json(successResponse(clients));
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/clients", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      // Non-admins can only create clients for their unit
      if (req.user?.role !== 'admin') {
        validatedData.unit = req.user?.unit as any;
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
  app.get("/api/vehicles", requireAuth, requireUnitAccess, async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const effectiveUnit = req.user?.role === 'admin' ? unit : req.user?.unit;
      const vehicles = await storage.getVehicles(effectiveUnit);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.unit = req.user?.unit as any;
      }
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });

  app.put("/api/vehicles/:id", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(req.params.id, validatedData);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });

  app.delete("/api/vehicles/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Service Orders routes
  app.get("/api/service-orders", requireAuth, requireUnitAccess, async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const effectiveUnit = req.user?.role === 'admin' ? unit : req.user?.unit;
      const orders = await storage.getServiceOrders(effectiveUnit);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service orders" });
    }
  });

  app.post("/api/service-orders", requireAuth, requireRole(['admin', 'manager', 'mechanic']), async (req, res) => {
    try {
      const validatedData = insertServiceOrderSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.unit = req.user?.unit as any;
      }
      // Generate OS number
      const osNumber = await storage.generateOSNumber(validatedData.unit);
      const orderWithNumber = { ...validatedData, osNumber };
      const order = await storage.createServiceOrder(orderWithNumber);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid service order data" });
    }
  });

  app.put("/api/service-orders/:id", requireAuth, requireRole(['admin', 'manager', 'mechanic']), async (req, res) => {
    try {
      const validatedData = insertServiceOrderSchema.partial().parse(req.body);
      const order = await storage.updateServiceOrder(req.params.id, validatedData);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid service order data" });
    }
  });

  app.delete("/api/service-orders/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteServiceOrder(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service order" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", requireAuth, requireUnitAccess, async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const effectiveUnit = req.user?.role === 'admin' ? unit : req.user?.unit;
      const appointments = await storage.getAppointments(effectiveUnit);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.unit = req.user?.unit as any;
      }
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ error: "Invalid appointment data" });
    }
  });

  app.put("/api/appointments/:id", requireAuth, requireRole(['admin', 'manager', 'seller']), async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(req.params.id, validatedData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ error: "Invalid appointment data" });
    }
  });

  app.delete("/api/appointments/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteAppointment(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", requireAuth, requireUnitAccess, async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const effectiveUnit = req.user?.role === 'admin' ? unit : req.user?.unit;
      const inventory = await storage.getInventory(effectiveUnit);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/alerts", requireAuth, requireUnitAccess, async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const effectiveUnit = req.user?.role === 'admin' ? unit : req.user?.unit;
      const critical = await storage.getCriticalStockItems(effectiveUnit);
      const low = await storage.getLowStockItems(effectiveUnit);
      res.json({ critical, low });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock alerts" });
    }
  });

  app.post("/api/inventory", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.unit = req.user?.unit as any;
      }
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory data" });
    }
  });

  app.put("/api/inventory/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertInventorySchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(req.params.id, validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory data" });
    }
  });

  app.delete("/api/inventory/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteInventoryItem(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inventory item" });
    }
  });

  // Financial routes
  app.get("/api/financial", requireAuth, requireRole(['admin', 'manager']), requireUnitAccess, async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const effectiveUnit = req.user?.role === 'admin' ? unit : req.user?.unit;
      const transactions = await storage.getFinancialTransactions(effectiveUnit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch financial transactions" });
    }
  });

  app.post("/api/financial", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertFinancialTransactionSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.unit = req.user?.unit as any;
      }
      const transaction = await storage.createFinancialTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid financial transaction data" });
    }
  });

  app.put("/api/financial/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const validatedData = insertFinancialTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateFinancialTransaction(req.params.id, validatedData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid financial transaction data" });
    }
  });

  app.delete("/api/financial/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteFinancialTransaction(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete financial transaction" });
    }
  });

  // Employees routes
  app.get("/api/employees/:unit/:role", requireAuth, requireRole(['admin', 'manager', 'hr']), async (req, res) => {
    try {
      const { unit, role } = req.params;
      const effectiveUnit = req.user?.role === 'admin' ? (unit === 'all' ? undefined : unit) : req.user?.unit;
      const employees = await storage.getEmployees(
        effectiveUnit,
        role === 'all' ? undefined : role
      );
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", requireAuth, requireRole(['admin', 'hr']), async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      if (req.user?.role !== 'admin') {
        validatedData.unit = req.user?.unit as any;
      }
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ error: "Invalid employee data" });
    }
  });

  app.put("/api/employees/:id", requireAuth, requireRole(['admin', 'hr']), async (req, res) => {
    try {
      const validatedData = insertUserSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(req.params.id, validatedData);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ error: "Invalid employee data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
