import { FolderSync, Settings, Database } from "lucide-react";
import SyncStatusDashboard from "../components/sync-status-dashboard";
import NotionConnectionPanel from "../components/notion-connection-panel";
import DataPreview from "../components/data-preview";
import ConfigurationPanel from "../components/configuration-panel";
import SyncProgressModal from "../components/sync-progress-modal";
import { useState } from "react";

export default function Dashboard() {
  const [showSyncModal, setShowSyncModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-notion-dark rounded-lg flex items-center justify-center" data-testid="logo">
                  <FolderSync className="text-white text-sm" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground" data-testid="title">Notion FolderSync</h1>
                  <p className="text-xs text-muted-foreground">Replit Extension</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full" data-testid="status-indicator"></div>
                <span data-testid="connection-status">Connected</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground" data-testid="button-settings">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* FolderSync Status Dashboard */}
        <SyncStatusDashboard />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <NotionConnectionPanel onSyncStart={() => setShowSyncModal(true)} />
            <DataPreview />
          </div>

          {/* Sidebar */}
          <div>
            <ConfigurationPanel onSyncStart={() => setShowSyncModal(true)} />
          </div>
        </div>
      </div>

      {/* FolderSync Progress Modal */}
      <SyncProgressModal 
        isOpen={showSyncModal} 
        onClose={() => setShowSyncModal(false)} 
      />
    </div>
  );
}
