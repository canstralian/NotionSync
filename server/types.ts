import "express-session";

declare module "express-session" {
  interface SessionData {
    notionAccessToken?: string;
    notionWorkspaceId?: string;
    notionBotId?: string;
  }
}
