
import { Client } from "@notionhq/client";

export interface NotionScopes {
  userRead: boolean;
  userWrite: boolean;
  contentRead: boolean;
  contentWrite: boolean;
  workspaceRead: boolean;
  workspaceWrite: boolean;
}

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

  constructor(accessToken?: string) {
    if (accessToken) {
      this.client = new Client({ auth: accessToken });
    }
  }

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
      filter: { property: "object", value: "database" },
    });

    return response.results;
  }

  async queryDatabase(databaseId: string, filter?: any) {
    if (!this.client || !this.hasScope("contentRead")) {
      throw new Error("Missing required scope: content:read");
    }

    const response = await this.client.databases.query({
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
