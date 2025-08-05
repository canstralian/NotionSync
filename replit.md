# Overview

This is a Notion FolderSync application - a full-stack web application that provides synchronization between Notion databases and local data storage. The application allows users to monitor, manage, and sync their Notion databases with features like real-time progress tracking, data change monitoring, and bidirectional synchronization capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Notion-inspired design tokens
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints following conventional patterns
- **Development Server**: Custom Vite integration for hot module replacement
- **Error Handling**: Centralized error handling middleware with structured responses

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **In-Memory Storage**: Fallback MemStorage implementation for development/testing
- **Data Models**: Four main entities - NotionDatabases, SyncOperations, DataChanges, and SyncSettings

## Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **API Security**: Express session middleware with secure cookie configuration
- **Access Control**: Basic authentication status tracking in sync settings

## External Dependencies
- **Notion Integration**: @neondatabase/serverless for database connectivity
- **Database**: PostgreSQL via Neon Database (serverless)
- **Session Store**: PostgreSQL-backed sessions via connect-pg-simple
- **Development Tools**: Replit-specific plugins for cartographer and runtime error overlay
- **Validation**: Zod schema validation throughout the application stack
- **Date Handling**: date-fns for consistent date manipulation
- **UI Animations**: Embla Carousel for interactive components