import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { insertNotionDatabaseSchema, insertSyncOperationSchema, insertDataChangeSchema } from "@shared/schema";
import { registerAuthRoutes } from "./auth-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // General API rate limiter - prevents resource exhaustion (CWE-400, CWE-770)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
  });

  // Apply rate limiting to all API routes
  app.use("/api", apiLimiter);

  // Register authentication routes with their own stricter rate limiting
  registerAuthRoutes(app);

  // Notion Databases routes
  app.get("/api/databases", async (req, res) => {
    try {
      const databases = await storage.getNotionDatabases();
      res.json(databases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch databases" });
    }
  });

  app.get("/api/databases/:id", async (req, res) => {
    try {
      const database = await storage.getNotionDatabase(req.params.id);
      if (!database) {
        return res.status(404).json({ message: "Database not found" });
      }
      res.json(database);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch database" });
    }
  });

  app.post("/api/databases", async (req, res) => {
    try {
      const validatedData = insertNotionDatabaseSchema.parse(req.body);
      const database = await storage.createNotionDatabase(validatedData);
      res.status(201).json(database);
    } catch (error) {
      res.status(400).json({ message: "Invalid database data" });
    }
  });

  app.patch("/api/databases/:id", async (req, res) => {
    try {
      const database = await storage.updateNotionDatabase(req.params.id, req.body);
      if (!database) {
        return res.status(404).json({ message: "Database not found" });
      }
      res.json(database);
    } catch (error) {
      res.status(500).json({ message: "Failed to update database" });
    }
  });

  app.delete("/api/databases/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteNotionDatabase(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Database not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete database" });
    }
  });

  // Sync Operations routes
  app.get("/api/sync-operations", async (req, res) => {
    try {
      const operations = await storage.getSyncOperations();
      res.json(operations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sync operations" });
    }
  });

  app.post("/api/sync-operations", async (req, res) => {
    try {
      const validatedData = insertSyncOperationSchema.parse(req.body);
      const operation = await storage.createSyncOperation(validatedData);
      res.status(201).json(operation);
    } catch (error) {
      res.status(400).json({ message: "Invalid sync operation data" });
    }
  });

  app.patch("/api/sync-operations/:id", async (req, res) => {
    try {
      const operation = await storage.updateSyncOperation(req.params.id, req.body);
      if (!operation) {
        return res.status(404).json({ message: "Sync operation not found" });
      }
      res.json(operation);
    } catch (error) {
      res.status(500).json({ message: "Failed to update sync operation" });
    }
  });

  // Data Changes routes
  app.get("/api/data-changes", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const changes = await storage.getDataChanges(limit);
      res.json(changes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data changes" });
    }
  });

  app.get("/api/data-changes/database/:databaseId", async (req, res) => {
    try {
      const changes = await storage.getDataChangesByDatabase(req.params.databaseId);
      res.json(changes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data changes" });
    }
  });

  app.post("/api/data-changes", async (req, res) => {
    try {
      const validatedData = insertDataChangeSchema.parse(req.body);
      const change = await storage.createDataChange(validatedData);
      res.status(201).json(change);
    } catch (error) {
      res.status(400).json({ message: "Invalid data change" });
    }
  });

  // Sync Settings routes
  app.get("/api/sync-settings", async (req, res) => {
    try {
      const settings = await storage.getSyncSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sync settings" });
    }
  });

  app.patch("/api/sync-settings", async (req, res) => {
    try {
      const settings = await storage.updateSyncSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update sync settings" });
    }
  });

  // Sync Actions
  app.post("/api/sync/now", async (req, res) => {
    try {
      const { databaseId, operation = "sync" } = req.body;
      
      // Create sync operation record
      const syncOp = await storage.createSyncOperation({
        databaseId,
        operation,
        status: "running",
        recordsProcessed: 0,
        totalRecords: 100,
        errorMessage: null,
      });

      // Simulate sync process (in real app, this would be actual sync)
      setTimeout(async () => {
        await storage.updateSyncOperation(syncOp.id, {
          status: "completed",
          recordsProcessed: 100,
          endTime: new Date(),
        });
      }, 2000);

      res.json(syncOp);
    } catch (error) {
      res.status(500).json({ message: "Failed to start sync operation" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const databases = await storage.getNotionDatabases();
      const changes = await storage.getDataChanges();
      const settings = await storage.getSyncSettings();
      
      const totalRecords = databases.reduce((sum, db) => sum + (db.recordCount || 0), 0);
      const pendingChanges = changes.filter(c => c.status === "pending").length;
      const lastSync = databases.reduce((latest, db) => {
        if (!db.lastSync) return latest;
        return !latest || db.lastSync > latest ? db.lastSync : latest;
      }, null as Date | null);

      const stats = {
        totalRecords,
        recordsGrowth: "+12% from last sync",
        lastSync: lastSync ? formatRelativeTime(lastSync) : "Never",
        pendingSync: pendingChanges,
        cacheSize: `${settings?.cacheSize || 0}.2 MB`,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
