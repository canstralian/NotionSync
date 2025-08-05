import { useQuery } from "@tanstack/react-query";
import { Plus, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NotionDatabase } from "@shared/schema";

interface NotionConnectionPanelProps {
  onSyncStart: () => void;
}

export default function NotionConnectionPanel({ onSyncStart }: NotionConnectionPanelProps) {
  const { data: databases, isLoading } = useQuery<NotionDatabase[]>({
    queryKey: ["/api/databases"],
  });

  const getDatabaseIcon = (name: string) => {
    if (name.toLowerCase().includes('customer')) return '👥';
    if (name.toLowerCase().includes('project')) return '📋';
    return '📊';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'syncing': return 'text-coral';
      case 'error': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Synced';
      case 'syncing': return 'Syncing';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return 'Never';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground" data-testid="databases-title">Notion Databases</h3>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-connect-database">
            <Plus className="w-4 h-4 mr-2" />
            Connect Database
          </Button>
        </div>

        <div className="space-y-4">
          {databases?.map((database) => (
            <div key={database.id} className="border border-border rounded-lg p-4" data-testid={`database-${database.id}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-lg">
                    {getDatabaseIcon(database.name)}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground" data-testid={`database-name-${database.id}`}>
                      {database.name}
                    </h4>
                    <p className="text-sm text-muted-foreground font-mono" data-testid={`database-id-${database.id}`}>
                      {database.notionId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      database.status === 'syncing' ? 'bg-coral animate-pulse' : 
                      database.status === 'connected' ? 'bg-success' : 'bg-red-500'
                    }`}></div>
                    <span className={getStatusColor(database.status)} data-testid={`database-status-${database.id}`}>
                      {getStatusText(database.status)}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-database-menu-${database.id}`}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    Records: <span className="font-medium text-foreground" data-testid={`database-records-${database.id}`}>
                      {database.recordCount?.toLocaleString() || '0'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    Last Sync: <span className="font-medium text-foreground" data-testid={`database-last-sync-${database.id}`}>
                      {formatTimeAgo(database.lastSync)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    Direction: <span className="font-medium text-foreground" data-testid={`database-direction-${database.id}`}>
                      {database.syncDirection === 'bidirectional' ? 'Bidirectional' : 
                       database.syncDirection === 'pull' ? 'Pull Only' : 'Push Only'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
