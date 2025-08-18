import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertVehicleSchema, 
  insertServiceOrderSchema, 
  insertAppointmentSchema, 
  insertInventorySchema, 
  insertFinancialTransactionSchema 
} from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Dashboard KPIs
  app.get("/api/dashboard/kpis", async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const kpis = await storage.getDashboardKPIs(unit);
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard KPIs" });
    }
  });

  // Clients routes
  app.get("/api/clients", async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const clients = await storage.getClients(unit);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ error: "Invalid client data" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, validatedData);
      res.json(client);
    } catch (error) {
      res.status(400).json({ error: "Invalid client data" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Vehicles routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const vehicles = await storage.getVehicles(unit);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(req.params.id, validatedData);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Service Orders routes
  app.get("/api/service-orders", async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const orders = await storage.getServiceOrders(unit);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service orders" });
    }
  });

  app.post("/api/service-orders", async (req, res) => {
    try {
      const validatedData = insertServiceOrderSchema.parse(req.body);
      // Generate OS number
      const osNumber = await storage.generateOSNumber(validatedData.unit);
      const orderWithNumber = { ...validatedData, osNumber };
      const order = await storage.createServiceOrder(orderWithNumber);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid service order data" });
    }
  });

  app.put("/api/service-orders/:id", async (req, res) => {
    try {
      const validatedData = insertServiceOrderSchema.partial().parse(req.body);
      const order = await storage.updateServiceOrder(req.params.id, validatedData);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid service order data" });
    }
  });

  app.delete("/api/service-orders/:id", async (req, res) => {
    try {
      await storage.deleteServiceOrder(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service order" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const appointments = await storage.getAppointments(unit);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ error: "Invalid appointment data" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(req.params.id, validatedData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ error: "Invalid appointment data" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      await storage.deleteAppointment(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const inventory = await storage.getInventory(unit);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/alerts", async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const critical = await storage.getCriticalStockItems(unit);
      const low = await storage.getLowStockItems(unit);
      res.json({ critical, low });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock alerts" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory data" });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const validatedData = insertInventorySchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(req.params.id, validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory data" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      await storage.deleteInventoryItem(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inventory item" });
    }
  });

  // Financial routes
  app.get("/api/financial", async (req, res) => {
    try {
      const unit = req.query.unit as string;
      const transactions = await storage.getFinancialTransactions(unit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch financial transactions" });
    }
  });

  app.post("/api/financial", async (req, res) => {
    try {
      const validatedData = insertFinancialTransactionSchema.parse(req.body);
      const transaction = await storage.createFinancialTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid financial transaction data" });
    }
  });

  app.put("/api/financial/:id", async (req, res) => {
    try {
      const validatedData = insertFinancialTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateFinancialTransaction(req.params.id, validatedData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid financial transaction data" });
    }
  });

  app.delete("/api/financial/:id", async (req, res) => {
    try {
      await storage.deleteFinancialTransaction(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete financial transaction" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
