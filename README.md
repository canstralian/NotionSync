# NotionSync

A full-stack web application for synchronizing Notion databases with local data storage. This application provides real-time monitoring, management, and bidirectional synchronization of Notion workspaces.

[![GitHub Stars](https://img.shields.io/github/stars/canstralian/NotionSync?style=for-the-badge)](https://github.com/canstralian/NotionSync/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/canstralian/NotionSync?style=for-the-badge)](https://github.com/canstralian/NotionSync/forks)
[![Issues](https://img.shields.io/github/issues/canstralian/NotionSync?style=for-the-badge)](https://github.com/canstralian/NotionSync/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/canstralian/NotionSync?style=for-the-badge)](https://github.com/canstralian/NotionSync/pulls)
[![License](https://img.shields.io/github/license/canstralian/NotionSync?style=for-the-badge)](LICENSE)
[![CI Status](https://img.shields.io/github/actions/workflow/status/canstralian/NotionSync/ci.yml?style=for-the-badge&label=CI)](../../actions)

[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)
[![Join Discussions](https://img.shields.io/badge/GitHub-Discussions-blue?style=for-the-badge)](../../discussions)
[![Replit](https://img.shields.io/badge/Replit-Run%20Online-667881?style=for-the-badge&logo=replit&logoColor=white)](https://replit.com/@YOUR_USERNAME/YOUR_PROJECT)

## 🌟 Features

- **Real-time Sync**: Bidirectional synchronization between Notion databases and local storage
- **Database Management**: View, create, and manage Notion database connections
- **Sync Operations**: Track and monitor all synchronization operations
- **Data Change Tracking**: Monitor all data changes with detailed timestamps
- **Configurable Settings**: Customize sync intervals, cache size, and authentication
- **Modern UI**: Built with React and shadcn/ui components for a clean, responsive interface
- **Type-safe**: Full TypeScript implementation for both frontend and backend
- **RESTful API**: Well-structured API endpoints for all operations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v15 or higher) or access to a Neon Database instance
- **Notion Account** with API access

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/canstralian/NotionSync.git
cd NotionSync
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note**: The `--legacy-peer-deps` flag is required due to Vite version compatibility with the Tailwind CSS plugin.

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Notion OAuth Configuration
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=http://localhost:5000/auth/notion/callback

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Getting Notion API Credentials

1. Go to [Notion Developers](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Fill in the integration details
4. Copy your "Internal Integration Token" for `NOTION_CLIENT_ID`
5. Set up OAuth redirect URI in your integration settings

### 4. Database Setup

Initialize the database schema:

```bash
npm run db:push
```

This will create all necessary tables using Drizzle ORM.

### 5. Run the Application

#### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:5000` (or the port specified in your `.env` file).

#### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🏗️ Project Structure

```
NotionSync/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── sync-status-dashboard.tsx
│   │   │   ├── notion-connection-panel.tsx
│   │   │   └── data-preview.tsx
│   │   ├── pages/         # Page components
│   │   │   ├── dashboard.tsx
│   │   │   ├── databases.tsx
│   │   │   ├── sync-operations.tsx
│   │   │   ├── data-changes.tsx
│   │   │   └── settings.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── App.tsx        # Main application component
│   └── index.html
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── auth-routes.ts    # OAuth authentication routes
│   ├── storage.ts        # Database storage layer
│   ├── notion-service.ts # Notion API integration
│   └── types.ts          # TypeScript type definitions
├── shared/               # Shared code between client and server
│   └── schema.ts        # Database schema and types
├── migrations/          # Database migration files
├── .env                 # Environment variables (create this)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 📚 API Documentation

### Database Endpoints

#### Get All Databases
```http
GET /api/databases
```

#### Get Database by ID
```http
GET /api/databases/:id
```

#### Create Database
```http
POST /api/databases
Content-Type: application/json

{
  "notionId": "string",
  "name": "string",
  "syncDirection": "bidirectional" | "pull" | "push",
  "isActive": boolean
}
```

#### Update Database
```http
PATCH /api/databases/:id
Content-Type: application/json

{
  "name": "string",
  "syncDirection": "bidirectional" | "pull" | "push",
  "isActive": boolean
}
```

#### Delete Database
```http
DELETE /api/databases/:id
```

### Sync Operations Endpoints

#### Get All Sync Operations
```http
GET /api/sync-operations
```

#### Create Sync Operation
```http
POST /api/sync-operations
Content-Type: application/json

{
  "databaseId": "string",
  "operation": "sync" | "pull" | "push"
}
```

#### Start Immediate Sync
```http
POST /api/sync/now
Content-Type: application/json

{
  "databaseId": "string",
  "operation": "sync"
}
```

### Data Changes Endpoints

#### Get All Data Changes
```http
GET /api/data-changes?limit=50
```

#### Get Data Changes by Database
```http
GET /api/data-changes/database/:databaseId
```

### Settings Endpoints

#### Get Sync Settings
```http
GET /api/sync-settings
```

#### Update Sync Settings
```http
PATCH /api/sync-settings
Content-Type: application/json

{
  "autoSync": boolean,
  "syncInterval": number,
  "notionAccessToken": "string"
}
```

### Authentication Endpoints

#### Initiate Notion OAuth
```http
GET /auth/notion
```

#### OAuth Callback
```http
GET /auth/notion/callback?code=...
```

#### Get Auth Status
```http
GET /auth/notion/status
```

#### Logout
```http
POST /auth/notion/logout
```

### Statistics Endpoint

#### Get Dashboard Statistics
```http
GET /api/stats
```

Response:
```json
{
  "totalRecords": number,
  "recordsGrowth": string,
  "lastSync": string,
  "pendingSync": number,
  "cacheSize": string
}
```

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Wouter**: Lightweight client-side routing
- **TanStack Query**: Server state management
- **shadcn/ui**: Component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form management with Zod validation

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server code
- **Drizzle ORM**: Type-safe database toolkit
- **PostgreSQL**: Relational database
- **Notion API**: Official Notion SDK

### Development Tools
- **TSX**: TypeScript execution for development
- **ESBuild**: Fast JavaScript bundler
- **Drizzle Kit**: Database migration tool

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run type checking (`npm run check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- The sidebar component requires the `use-mobile` hook which should be implemented
- Session management needs to be properly configured with express-session middleware
- Notion API v5 search filter for databases may need adjustment based on your use case

## 🔮 Future Enhancements

- [ ] Real-time WebSocket updates for sync operations
- [ ] Conflict resolution UI for bidirectional sync
- [ ] Export/Import functionality for database configurations
- [ ] Advanced filtering and search for data changes
- [ ] Webhook support for Notion database changes
- [ ] Multi-workspace support
- [ ] Detailed logging and analytics dashboard

## 📞 Support

If you encounter any issues or have questions:

1. Check the [GitHub Issues](https://github.com/canstralian/NotionSync/issues)
2. Create a new issue if your problem isn't already reported
3. Provide as much detail as possible including:
   - Your environment (Node version, OS, etc.)
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages or logs

## 🙏 Acknowledgments

- [Notion API](https://developers.notion.com/)
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Drizzle ORM](https://orm.drizzle.team/) for the excellent database toolkit
- All contributors who have helped improve this project

---

**Note**: This project is under active development. Features and documentation may change.
