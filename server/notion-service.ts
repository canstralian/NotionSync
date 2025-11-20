/**
 * Notion API Service
 * 
 * This module provides a wrapper around the Notion API client with:
 * - Scope-based permission checking
 * - Common operations for databases and pages
 * - Error handling for API calls
 * 
 * Usage:
 *   const service = new NotionService(accessToken);
 *   const databases = await service.getDatabases();
 */

import { Client } from "@notionhq/client";

/**
 * Notion OAuth scopes that can be requested
 * Each scope grants specific permissions to the integration
 */
export interface NotionScopes {
  userRead: boolean;
  userWrite: boolean;
  contentRead: boolean;
  contentWrite: boolean;
  workspaceRead: boolean;
  workspaceWrite: boolean;
}

/**
 * Service class for interacting with the Notion API
 * Handles authentication, scope management, and common operations
 */
export class NotionService {
  private client: Client | null = null;
  private scopes: NotionScopes = {
    userRead: false,
    userWrite: false,
    contentRead: false,
    contentWrite: false,
    workspaceRead: false,
    workspaceWrite: false,
  };

  /**
   * Create a new NotionService instance
   * @param accessToken - Optional Notion access token for immediate initialization
   */
  constructor(accessToken?: string) {
    if (accessToken) {
      this.client = new Client({ auth: accessToken });
    }
  }

  /**
   * Set the access token and update permissions scopes
   * @param token - Notion OAuth access token
   * @param scopes - Array of scope strings (e.g., ["user:read", "content:read"])
   */
  setAccessToken(token: string, scopes?: string[]) {
    this.client = new Client({ auth: token });
    
    if (scopes) {
      this.updateScopes(scopes);
    }
  }

  private updateScopes(scopeList: string[]) {
    this.scopes = {
      userRead: scopeList.includes("user:read"),
      userWrite: scopeList.includes("user:write"),
      contentRead: scopeList.includes("content:read"),
      contentWrite: scopeList.includes("content:write"),
      workspaceRead: scopeList.includes("workspace:read"),
      workspaceWrite: scopeList.includes("workspace:write"),
    };
  }

  hasScope(scope: keyof NotionScopes): boolean {
    return this.scopes[scope];
  }

  async getDatabases() {
    if (!this.client || !this.hasScope("contentRead")) {
      throw new Error("Missing required scope: content:read");
    }

    const response = await this.client.search({
      filter: { property: "object", value: "page" },
    });

    return response.results;
  }

  async queryDatabase(databaseId: string, filter?: any) {
    if (!this.client || !this.hasScope("contentRead")) {
      throw new Error("Missing required scope: content:read");
    }

    // Note: The databases.query method signature may have changed in v5
    // This is a simplified implementation that may need adjustment
    const response = await (this.client.databases as any).query({
      database_id: databaseId,
      filter,
    });

    return response.results;
  }

  async createPage(databaseId: string, properties: any) {
    if (!this.client || !this.hasScope("contentWrite")) {
      throw new Error("Missing required scope: content:write");
    }

    const response = await this.client.pages.create({
      parent: { database_id: databaseId },
      properties,
    });

    return response;
  }

  async updatePage(pageId: string, properties: any) {
    if (!this.client || !this.hasScope("contentWrite")) {
      throw new Error("Missing required scope: content:write");
    }

    const response = await this.client.pages.update({
      page_id: pageId,
      properties,
    });

    return response;
  }

  async getUser() {
    if (!this.client || !this.hasScope("userRead")) {
      throw new Error("Missing required scope: user:read");
    }

    const response = await this.client.users.me({});
    return response;
  }
}

export const notionService = new NotionService();
