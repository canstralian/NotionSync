/**
 * Storage Layer for NotionSync Application
 * 
 * This module provides a storage abstraction layer for persisting application data.
 * It defines interfaces and implementations for data access operations.
 * 
 * Currently implements:
 * - MemStorage: In-memory storage for development/testing
 * 
 * Future implementations may include:
 * - PostgresStorage: Production database storage using Drizzle ORM
 */

import { 
  type NotionDatabase, 
  type InsertNotionDatabase,
  type SyncOperation,
  type InsertSyncOperation,
  type DataChange,
  type InsertDataChange,
  type SyncSettings,
  type InsertSyncSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

/**
 * Storage interface defining all data access operations
 * Implementations must provide these methods for database operations
 */
export interface IStorage {
  // Notion Databases
  getNotionDatabases(): Promise<NotionDatabase[]>;
  getNotionDatabase(id: string): Promise<NotionDatabase | undefined>;
  createNotionDatabase(database: InsertNotionDatabase): Promise<NotionDatabase>;
  updateNotionDatabase(id: string, updates: Partial<NotionDatabase>): Promise<NotionDatabase | undefined>;
  deleteNotionDatabase(id: string): Promise<boolean>;

  // Sync Operations
  getSyncOperations(): Promise<SyncOperation[]>;
  getSyncOperation(id: string): Promise<SyncOperation | undefined>;
  createSyncOperation(operation: InsertSyncOperation): Promise<SyncOperation>;
  updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<SyncOperation | undefined>;

  // Data Changes
  getDataChanges(limit?: number): Promise<DataChange[]>;
  getDataChangesByDatabase(databaseId: string): Promise<DataChange[]>;
  createDataChange(change: InsertDataChange): Promise<DataChange>;

  // Sync Settings
  getSyncSettings(): Promise<SyncSettings | undefined>;
  updateSyncSettings(settings: Partial<SyncSettings>): Promise<SyncSettings>;
}

/**
 * In-Memory Storage Implementation
 * 
 * This is a simple in-memory storage implementation used for development and testing.
 * Data is stored in memory and will be lost when the server restarts.
 * 
 * For production use, replace this with a persistent storage implementation
 * using Drizzle ORM and PostgreSQL.
 */
export class MemStorage implements IStorage {
  private notionDatabases: Map<string, NotionDatabase>;
  private syncOperations: Map<string, SyncOperation>;
  private dataChanges: Map<string, DataChange>;
  private syncSettings: SyncSettings;

  constructor() {
    this.notionDatabases = new Map();
    this.syncOperations = new Map();
    this.dataChanges = new Map();
    
    // Initialize with default settings
    this.syncSettings = {
      id: randomUUID(),
      autoSync: true,
      syncInterval: 5,
      cacheSize: 45,
      notionAccessToken: null,
      isAuthenticated: true,
    };

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample databases
    const customerDb: NotionDatabase = {
      id: randomUUID(),
      notionId: "db_abc123def456",
      name: "Customer Database",
      recordCount: 847,
      lastSync: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      syncDirection: "bidirectional",
      status: "connected",
      isActive: true,
    };

    const projectDb: NotionDatabase = {
      id: randomUUID(),
      notionId: "db_xyz789uvw012",
      name: "Project Tracker",
      recordCount: 156,
      lastSync: new Date(),
      syncDirection: "pull",
      status: "syncing",
      isActive: true,
    };

    this.notionDatabases.set(customerDb.id, customerDb);
    this.notionDatabases.set(projectDb.id, projectDb);

    // Sample data changes
    const changes: DataChange[] = [
      {
        id: randomUUID(),
        databaseId: customerDb.id,
        recordName: "John Smith",
        action: "created",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        status: "synced",
        recordData: { email: "john@example.com", type: "customer" },
      },
      {
        id: randomUUID(),
        databaseId: projectDb.id,
        recordName: "Website Redesign",
        action: "updated",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: "pending",
        recordData: { status: "in-progress", priority: "high" },
      },
    ];

    changes.forEach(change => this.dataChanges.set(change.id, change));
  }

  async getNotionDatabases(): Promise<NotionDatabase[]> {
    return Array.from(this.notionDatabases.values());
  }

  async getNotionDatabase(id: string): Promise<NotionDatabase | undefined> {
    return this.notionDatabases.get(id);
  }

  async createNotionDatabase(insertDatabase: InsertNotionDatabase): Promise<NotionDatabase> {
    const id = randomUUID();
    const database: NotionDatabase = { 
      ...insertDatabase, 
      id,
      lastSync: null,
      status: insertDatabase.status || "connected",
      recordCount: insertDatabase.recordCount || 0,
      syncDirection: insertDatabase.syncDirection || "bidirectional",
      isActive: insertDatabase.isActive !== undefined ? insertDatabase.isActive : true,
    };
    this.notionDatabases.set(id, database);
    return database;
  }

  async updateNotionDatabase(id: string, updates: Partial<NotionDatabase>): Promise<NotionDatabase | undefined> {
    const existing = this.notionDatabases.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.notionDatabases.set(id, updated);
    return updated;
  }

  async deleteNotionDatabase(id: string): Promise<boolean> {
    return this.notionDatabases.delete(id);
  }

  async getSyncOperations(): Promise<SyncOperation[]> {
    return Array.from(this.syncOperations.values());
  }

  async getSyncOperation(id: string): Promise<SyncOperation | undefined> {
    return this.syncOperations.get(id);
  }

  async createSyncOperation(insertOperation: InsertSyncOperation): Promise<SyncOperation> {
    const id = randomUUID();
    const operation: SyncOperation = {
      ...insertOperation,
      id,
      startTime: new Date(),
      endTime: null,
      status: insertOperation.status || "pending",
      databaseId: insertOperation.databaseId || null,
      recordsProcessed: insertOperation.recordsProcessed || 0,
      totalRecords: insertOperation.totalRecords || 0,
      errorMessage: insertOperation.errorMessage || null,
    };
    this.syncOperations.set(id, operation);
    return operation;
  }

  async updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<SyncOperation | undefined> {
    const existing = this.syncOperations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.syncOperations.set(id, updated);
    return updated;
  }

  async getDataChanges(limit = 50): Promise<DataChange[]> {
    const changes = Array.from(this.dataChanges.values());
    return changes
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async getDataChangesByDatabase(databaseId: string): Promise<DataChange[]> {
    return Array.from(this.dataChanges.values())
      .filter(change => change.databaseId === databaseId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async createDataChange(insertChange: InsertDataChange): Promise<DataChange> {
    const id = randomUUID();
    const change: DataChange = {
      ...insertChange,
      id,
      timestamp: new Date(),
      status: insertChange.status || "pending",
      databaseId: insertChange.databaseId || null,
      recordData: insertChange.recordData || null,
    };
    this.dataChanges.set(id, change);
    return change;
  }

  async getSyncSettings(): Promise<SyncSettings | undefined> {
    return this.syncSettings;
  }

  async updateSyncSettings(updates: Partial<SyncSettings>): Promise<SyncSettings> {
    this.syncSettings = { ...this.syncSettings, ...updates };
    return this.syncSettings;
  }
}

export const storage = new MemStorage();
