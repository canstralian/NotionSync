import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { insertNotionDatabaseSchema, insertSyncOperationSchema, insertDataChangeSchema } from "@shared/schema";
import { registerAuthRoutes } from "./auth-routes";

// CWE-400: Uncontrolled Resource Consumption
// CWE-770: Allocation of Resources Without Limits or Throttling
// General API rate limiter for read operations
const apiReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 read requests per window
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for write operations
const apiWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 write requests per window
  message: "Too many write requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict rate limiter for resource-intensive operations
const syncOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 sync operations per window
  message: "Too many sync operations from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// CWE-770: Maximum allowed values for query parameters
const MAX_QUERY_LIMIT = 1000; // Maximum records that can be requested at once
const DEFAULT_QUERY_LIMIT = 100; // Default limit if not specified

// CWE-770: Timeout for async operations (30 seconds)
const ASYNC_OPERATION_TIMEOUT = 30000;

// Helper function to validate and bound query parameters
function validateQueryLimit(limit: any): number {
  if (!limit) {
    return DEFAULT_QUERY_LIMIT;
  }

  const parsed = parseInt(limit as string, 10);

  // Validate the parsed value
  if (isNaN(parsed) || parsed < 1) {
    return DEFAULT_QUERY_LIMIT;
  }

  // Apply maximum bound
  return Math.min(parsed, MAX_QUERY_LIMIT);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  registerAuthRoutes(app);

  // Notion Databases routes
  app.get("/api/databases", apiReadLimiter, async (req, res) => {
    try {
      const databases = await storage.getNotionDatabases();
      res.json(databases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch databases" });
    }
  });

  app.get("/api/databases/:id", apiReadLimiter, async (req, res) => {
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

  app.post("/api/databases", apiWriteLimiter, async (req, res) => {
    try {
      const validatedData = insertNotionDatabaseSchema.parse(req.body);
      const database = await storage.createNotionDatabase(validatedData);
      res.status(201).json(database);
    } catch (error) {
      res.status(400).json({ message: "Invalid database data" });
    }
  });

  app.patch("/api/databases/:id", apiWriteLimiter, async (req, res) => {
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

  app.delete("/api/databases/:id", apiWriteLimiter, async (req, res) => {
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
  app.get("/api/sync-operations", apiReadLimiter, async (req, res) => {
    try {
      const operations = await storage.getSyncOperations();
      res.json(operations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sync operations" });
    }
  });

  app.post("/api/sync-operations", apiWriteLimiter, async (req, res) => {
    try {
      const validatedData = insertSyncOperationSchema.parse(req.body);
      const operation = await storage.createSyncOperation(validatedData);
      res.status(201).json(operation);
    } catch (error) {
      res.status(400).json({ message: "Invalid sync operation data" });
    }
  });

  app.patch("/api/sync-operations/:id", apiWriteLimiter, async (req, res) => {
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
  app.get("/api/data-changes", apiReadLimiter, async (req, res) => {
    try {
      // CWE-770: Validate and bound query parameters
      const limit = validateQueryLimit(req.query.limit);
      const changes = await storage.getDataChanges(limit);
      res.json(changes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data changes" });
    }
  });

  app.get("/api/data-changes/database/:databaseId", apiReadLimiter, async (req, res) => {
    try {
      const changes = await storage.getDataChangesByDatabase(req.params.databaseId);
      res.json(changes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data changes" });
    }
  });

  app.post("/api/data-changes", apiWriteLimiter, async (req, res) => {
    try {
      const validatedData = insertDataChangeSchema.parse(req.body);
      const change = await storage.createDataChange(validatedData);
      res.status(201).json(change);
    } catch (error) {
      res.status(400).json({ message: "Invalid data change" });
    }
  });

  // Sync Settings routes
  app.get("/api/sync-settings", apiReadLimiter, async (req, res) => {
    try {
      const settings = await storage.getSyncSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sync settings" });
    }
  });

  app.patch("/api/sync-settings", apiWriteLimiter, async (req, res) => {
    try {
      const settings = await storage.updateSyncSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update sync settings" });
    }
  });

  // Sync Actions
  app.post("/api/sync/now", syncOperationLimiter, async (req, res) => {
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

      // CWE-770: Implement timeout management for async operations
      // Simulate sync process (in real app, this would be actual sync)
      const timeoutId = setTimeout(async () => {
        try {
          await storage.updateSyncOperation(syncOp.id, {
            status: "completed",
            recordsProcessed: 100,
            endTime: new Date(),
          });
        } catch (error) {
          console.error("Failed to update sync operation:", error);
          // Attempt to mark as failed
          try {
            await storage.updateSyncOperation(syncOp.id, {
              status: "failed",
              errorMessage: "Sync operation failed",
              endTime: new Date(),
            });
          } catch (updateError) {
            console.error("Failed to mark sync operation as failed:", updateError);
          }
        }
      }, 2000);

      // Set a maximum timeout to prevent resource leaks
      const maxTimeout = setTimeout(async () => {
        clearTimeout(timeoutId);
        try {
          const currentOp = await storage.getSyncOperations();
          const op = currentOp.find(o => o.id === syncOp.id);
          if (op && op.status === "running") {
            await storage.updateSyncOperation(syncOp.id, {
              status: "failed",
              errorMessage: "Sync operation timed out",
              endTime: new Date(),
            });
          }
        } catch (error) {
          console.error("Failed to handle sync timeout:", error);
        }
      }, ASYNC_OPERATION_TIMEOUT);

      // Clean up the max timeout when operation completes normally
      setTimeout(() => clearTimeout(maxTimeout), 2500);

      res.json(syncOp);
    } catch (error) {
      res.status(500).json({ message: "Failed to start sync operation" });
    }
  });

  app.get("/api/stats", apiReadLimiter, async (req, res) => {
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
