# NotionSync API Documentation

This document provides detailed information about all API endpoints available in NotionSync.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Databases](#databases)
  - [Sync Operations](#sync-operations)
  - [Data Changes](#data-changes)
  - [Settings](#settings)
  - [Authentication](#authentication-endpoints)
  - [Statistics](#statistics)

## Overview

The NotionSync API is a RESTful API that uses JSON for request and response bodies. All endpoints are prefixed with `/api` except for authentication endpoints which use `/auth`.

**Base URL**: `http://localhost:5000` (configurable via `PORT` environment variable)

**Content-Type**: All POST/PATCH requests should include `Content-Type: application/json`

## Authentication

Some endpoints require authentication via Notion OAuth. After authenticating, the session stores your access token.

### OAuth Flow

1. Redirect user to `/auth/notion`
2. User authorizes on Notion
3. Notion redirects to `/auth/notion/callback`
4. Session is created with access token
5. User can access protected endpoints

## Error Handling

All errors follow this format:

```json
{
  "message": "Error description"
}
```

### HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Request succeeded, no response body
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently, there are no rate limits implemented. This may change in future versions.

## Endpoints

### Databases

Manage Notion database connections.

#### List All Databases

Retrieve all configured Notion databases.

**Endpoint**: `GET /api/databases`

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "notionId": "notion-database-id",
    "name": "My Database",
    "recordCount": 150,
    "lastSync": "2024-01-15T10:30:00.000Z",
    "syncDirection": "bidirectional",
    "status": "connected",
    "isActive": true
  }
]
```

**Fields**:
- `id`: Unique identifier (UUID)
- `notionId`: Notion database ID
- `name`: Display name
- `recordCount`: Number of records
- `lastSync`: Last sync timestamp (ISO 8601)
- `syncDirection`: Sync direction (`bidirectional`, `pull`, `push`)
- `status`: Current status (`connected`, `syncing`, `error`)
- `isActive`: Whether sync is active

---

#### Get Database by ID

Retrieve a specific database configuration.

**Endpoint**: `GET /api/databases/:id`

**Parameters**:
- `id` (path): Database UUID

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "notionId": "notion-database-id",
  "name": "My Database",
  "recordCount": 150,
  "lastSync": "2024-01-15T10:30:00.000Z",
  "syncDirection": "bidirectional",
  "status": "connected",
  "isActive": true
}
```

**Errors**:
- `404 Not Found`: Database not found

---

#### Create Database

Add a new Notion database configuration.

**Endpoint**: `POST /api/databases`

**Request Body**:
```json
{
  "notionId": "notion-database-id",
  "name": "My Database",
  "syncDirection": "bidirectional",
  "isActive": true
}
```

**Required Fields**:
- `notionId`: Notion database ID (string)
- `name`: Display name (string)

**Optional Fields**:
- `syncDirection`: Sync direction (default: `"bidirectional"`)
- `isActive`: Active status (default: `true`)
- `recordCount`: Initial record count (default: `0`)

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "notionId": "notion-database-id",
  "name": "My Database",
  "recordCount": 0,
  "lastSync": null,
  "syncDirection": "bidirectional",
  "status": "connected",
  "isActive": true
}
```

**Errors**:
- `400 Bad Request`: Invalid data

---

#### Update Database

Update an existing database configuration.

**Endpoint**: `PATCH /api/databases/:id`

**Parameters**:
- `id` (path): Database UUID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Name",
  "syncDirection": "pull",
  "isActive": false,
  "status": "connected"
}
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "notionId": "notion-database-id",
  "name": "Updated Name",
  "recordCount": 150,
  "lastSync": "2024-01-15T10:30:00.000Z",
  "syncDirection": "pull",
  "status": "connected",
  "isActive": false
}
```

**Errors**:
- `404 Not Found`: Database not found
- `500 Internal Server Error`: Update failed

---

#### Delete Database

Remove a database configuration.

**Endpoint**: `DELETE /api/databases/:id`

**Parameters**:
- `id` (path): Database UUID

**Response**: `204 No Content`

**Errors**:
- `404 Not Found`: Database not found
- `500 Internal Server Error`: Delete failed

---

### Sync Operations

Track and manage synchronization operations.

#### List All Sync Operations

Get all sync operations with their status.

**Endpoint**: `GET /api/sync-operations`

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "databaseId": "database-uuid",
    "operation": "sync",
    "status": "completed",
    "recordsProcessed": 100,
    "totalRecords": 100,
    "startTime": "2024-01-15T10:00:00.000Z",
    "endTime": "2024-01-15T10:05:00.000Z",
    "errorMessage": null
  }
]
```

**Operation Types**:
- `sync`: Bidirectional synchronization
- `pull`: Pull from Notion to local
- `push`: Push from local to Notion

**Status Values**:
- `pending`: Not started
- `running`: In progress
- `completed`: Successfully completed
- `failed`: Failed with error

---

#### Create Sync Operation

Manually create a sync operation record.

**Endpoint**: `POST /api/sync-operations`

**Request Body**:
```json
{
  "databaseId": "database-uuid",
  "operation": "sync",
  "totalRecords": 100
}
```

**Required Fields**:
- `databaseId`: Database UUID
- `operation`: Operation type

**Optional Fields**:
- `status`: Initial status (default: `"pending"`)
- `recordsProcessed`: Initial count (default: `0`)
- `totalRecords`: Total record count (default: `0`)

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "databaseId": "database-uuid",
  "operation": "sync",
  "status": "pending",
  "recordsProcessed": 0,
  "totalRecords": 100,
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": null,
  "errorMessage": null
}
```

**Errors**:
- `400 Bad Request`: Invalid data

---

#### Update Sync Operation

Update an existing sync operation (typically to update progress or status).

**Endpoint**: `PATCH /api/sync-operations/:id`

**Parameters**:
- `id` (path): Sync operation UUID

**Request Body** (all fields optional):
```json
{
  "status": "completed",
  "recordsProcessed": 100,
  "endTime": "2024-01-15T10:05:00.000Z",
  "errorMessage": null
}
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "databaseId": "database-uuid",
  "operation": "sync",
  "status": "completed",
  "recordsProcessed": 100,
  "totalRecords": 100,
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T10:05:00.000Z",
  "errorMessage": null
}
```

**Errors**:
- `404 Not Found`: Operation not found
- `500 Internal Server Error`: Update failed

---

#### Start Immediate Sync

Trigger an immediate synchronization operation.

**Endpoint**: `POST /api/sync/now`

**Request Body**:
```json
{
  "databaseId": "database-uuid",
  "operation": "sync"
}
```

**Required Fields**:
- `databaseId`: Database UUID (optional, syncs all if omitted)
- `operation`: Operation type (default: `"sync"`)

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "databaseId": "database-uuid",
  "operation": "sync",
  "status": "running",
  "recordsProcessed": 0,
  "totalRecords": 100,
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": null,
  "errorMessage": null
}
```

**Note**: This creates a sync operation and starts it asynchronously. The operation completes in the background.

**Errors**:
- `500 Internal Server Error`: Failed to start sync

---

### Data Changes

Track individual data changes during synchronization.

#### List All Data Changes

Get recent data changes with optional limit.

**Endpoint**: `GET /api/data-changes`

**Query Parameters**:
- `limit` (optional): Maximum number of results (default: unlimited)

**Example**: `GET /api/data-changes?limit=50`

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "databaseId": "database-uuid",
    "recordName": "Record Title",
    "action": "created",
    "timestamp": "2024-01-15T10:00:00.000Z",
    "status": "synced",
    "recordData": {
      "title": "Record Title",
      "properties": {}
    }
  }
]
```

**Action Types**:
- `created`: New record
- `updated`: Modified record
- `deleted`: Deleted record

**Status Values**:
- `pending`: Not yet synced
- `synced`: Successfully synced
- `failed`: Sync failed

---

#### Get Data Changes by Database

Get all data changes for a specific database.

**Endpoint**: `GET /api/data-changes/database/:databaseId`

**Parameters**:
- `databaseId` (path): Database UUID

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "databaseId": "database-uuid",
    "recordName": "Record Title",
    "action": "updated",
    "timestamp": "2024-01-15T10:00:00.000Z",
    "status": "synced",
    "recordData": {
      "title": "Record Title",
      "properties": {}
    }
  }
]
```

**Errors**:
- `500 Internal Server Error`: Fetch failed

---

#### Create Data Change

Record a new data change.

**Endpoint**: `POST /api/data-changes`

**Request Body**:
```json
{
  "databaseId": "database-uuid",
  "recordName": "Record Title",
  "action": "created",
  "recordData": {
    "title": "Record Title",
    "properties": {}
  }
}
```

**Required Fields**:
- `databaseId`: Database UUID
- `recordName`: Name of the record
- `action`: Change action type

**Optional Fields**:
- `status`: Change status (default: `"pending"`)
- `recordData`: Additional record data (JSONB)

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "databaseId": "database-uuid",
  "recordName": "Record Title",
  "action": "created",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "status": "pending",
  "recordData": {
    "title": "Record Title",
    "properties": {}
  }
}
```

**Errors**:
- `400 Bad Request`: Invalid data

---

### Settings

Manage synchronization settings.

#### Get Sync Settings

Retrieve current sync settings.

**Endpoint**: `GET /api/sync-settings`

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "autoSync": true,
  "syncInterval": 5,
  "cacheSize": 0,
  "notionAccessToken": "secret_...",
  "isAuthenticated": true
}
```

**Fields**:
- `autoSync`: Enable automatic synchronization
- `syncInterval`: Sync interval in minutes
- `cacheSize`: Cache size in MB
- `notionAccessToken`: Encrypted Notion access token
- `isAuthenticated`: Authentication status

**Errors**:
- `500 Internal Server Error`: Fetch failed

---

#### Update Sync Settings

Update synchronization settings.

**Endpoint**: `PATCH /api/sync-settings`

**Request Body** (all fields optional):
```json
{
  "autoSync": false,
  "syncInterval": 10,
  "notionAccessToken": "secret_...",
  "isAuthenticated": true
}
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "autoSync": false,
  "syncInterval": 10,
  "cacheSize": 0,
  "notionAccessToken": "secret_...",
  "isAuthenticated": true
}
```

**Errors**:
- `500 Internal Server Error`: Update failed

---

### Authentication Endpoints

Handle Notion OAuth authentication.

#### Initiate OAuth

Redirect user to Notion authorization page.

**Endpoint**: `GET /auth/notion`

**Response**: `302 Redirect` to Notion OAuth page

**OAuth Scopes Requested**:
- `user:read`: Read user information
- `content:read`: Read workspace content
- `content:write`: Modify workspace content
- `workspace:read`: Read workspace information

---

#### OAuth Callback

Handle OAuth callback from Notion.

**Endpoint**: `GET /auth/notion/callback`

**Query Parameters**:
- `code`: Authorization code from Notion

**Response**: `302 Redirect` to application dashboard

**Errors**:
- `400 Bad Request`: Missing authorization code
- `500 Internal Server Error`: Token exchange failed

---

#### Get Auth Status

Check current authentication status.

**Endpoint**: `GET /auth/notion/status`

**Response**: `200 OK`
```json
{
  "isAuthenticated": true,
  "workspaceId": "workspace-id"
}
```

---

#### Logout

Clear authentication session.

**Endpoint**: `POST /auth/notion/logout`

**Response**: `200 OK`
```json
{
  "success": true
}
```

---

### Statistics

Get dashboard statistics.

#### Get Dashboard Stats

Retrieve aggregated statistics for the dashboard.

**Endpoint**: `GET /api/stats`

**Response**: `200 OK`
```json
{
  "totalRecords": 1500,
  "recordsGrowth": "+12% from last sync",
  "lastSync": "2h ago",
  "pendingSync": 5,
  "cacheSize": "0.2 MB"
}
```

**Fields**:
- `totalRecords`: Total records across all databases
- `recordsGrowth`: Growth percentage (calculated)
- `lastSync`: Human-readable last sync time
- `pendingSync`: Number of pending changes
- `cacheSize`: Current cache size

**Errors**:
- `500 Internal Server Error`: Stats calculation failed

---

## Webhooks

Currently, webhooks are not implemented. Future versions may support:
- Notion database change notifications
- Sync completion notifications
- Error notifications

## Versioning

The API is currently unversioned. Breaking changes will be communicated via:
- GitHub releases
- Migration guides
- Changelog updates

## SDK Support

Currently, there is no official SDK. You can use the API directly with:
- `fetch` API (browser)
- `axios` or `node-fetch` (Node.js)
- Any HTTP client

### Example Usage (JavaScript)

```javascript
// Get all databases
const databases = await fetch('http://localhost:5000/api/databases')
  .then(res => res.json());

// Create a database
const newDb = await fetch('http://localhost:5000/api/databases', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    notionId: 'notion-db-id',
    name: 'My Database',
    syncDirection: 'bidirectional'
  })
}).then(res => res.json());

// Start sync
const syncOp = await fetch('http://localhost:5000/api/sync/now', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    databaseId: newDb.id,
    operation: 'sync'
  })
}).then(res => res.json());
```

---

## Support

For API-related questions or issues:
1. Check this documentation
2. Review [GitHub Issues](https://github.com/canstralian/NotionSync/issues)
3. Create a new issue with the `api` label

---

Last Updated: 2024-11-20
