import { useQuery, useMutation } from "@tanstack/react-query";
import { FolderSync, Download, Upload, RefreshCw, Trash2, Check, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SyncSettings } from "@shared/schema";

interface ConfigurationPanelProps {
  onSyncStart: () => void;
}

export default function ConfigurationPanel({ onSyncStart }: ConfigurationPanelProps) {
  const { toast } = useToast();
  
  const { data: settings, isLoading } = useQuery<SyncSettings>({
    queryKey: ["/api/sync-settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SyncSettings>) => {
      const response = await fetch("/api/sync-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sync-settings"] });
      toast({
        title: "Settings updated",
        description: "Your sync settings have been saved.",
      });
    },
  });

  const syncNowMutation = useMutation({
    mutationFn: async (operation: string) => {
      const response = await fetch("/api/sync/now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation }),
      });
      if (!response.ok) throw new Error("Failed to start sync");
      return response.json();
    },
    onSuccess: () => {
      onSyncStart();
      queryClient.invalidateQueries({ queryKey: ["/api/databases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "FolderSync started",
        description: "Your data synchronization has begun.",
      });
    },
  });

  const handleAutoSyncToggle = (checked: boolean) => {
    updateSettingsMutation.mutate({ autoSync: checked });
  };

  const handleSyncNow = () => {
    syncNowMutation.mutate("sync");
  };

  const handlePull = () => {
    syncNowMutation.mutate("pull");
  };

  const handlePush = () => {
    syncNowMutation.mutate("push");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-12 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* FolderSync Controls */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="sync-controls-title">FolderSync Controls</h3>
          
          <div className="space-y-4">
            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
              onClick={handleSyncNow}
              disabled={syncNowMutation.isPending}
              data-testid="button-sync-now"
            >
              <FolderSync className="w-4 h-4 mr-2" />
              {syncNowMutation.isPending ? "Syncing..." : "FolderSync Now"}
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                className="bg-muted text-muted-foreground hover:bg-muted/80"
                onClick={handlePull}
                disabled={syncNowMutation.isPending}
                data-testid="button-pull"
              >
                <Download className="w-4 h-4 mr-1" />
                Pull
              </Button>
              <Button 
                variant="secondary" 
                className="bg-muted text-muted-foreground hover:bg-muted/80"
                onClick={handlePush}
                disabled={syncNowMutation.isPending}
                data-testid="button-push"
              >
                <Upload className="w-4 h-4 mr-1" />
                Push
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground" data-testid="auto-sync-label">Auto FolderSync</label>
              <Switch
                checked={settings?.autoSync || false}
                onCheckedChange={handleAutoSyncToggle}
                disabled={updateSettingsMutation.isPending}
                data-testid="switch-auto-sync"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically sync every {settings?.syncInterval || 5} minutes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Status */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="auth-title">Authentication</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-notion-dark rounded-lg flex items-center justify-center">
                  <Check className="text-white w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground" data-testid="notion-connection-status">Notion Connected</p>
                  <p className="text-sm text-muted-foreground">workspace@company.com</p>
                </div>
              </div>
              <Button variant="ghost" className="text-red-600 hover:text-red-700" data-testid="button-disconnect-notion">
                Disconnect
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Database className="text-white w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground" data-testid="local-db-status">Local DB Connected</p>
                  <p className="text-sm text-muted-foreground">PostgreSQL Active</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-success rounded-full" data-testid="db-status-indicator"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="cache-title">Cache Management</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Cache Size</p>
                <p className="text-sm text-muted-foreground" data-testid="cache-size">
                  {settings?.cacheSize || 0}.2 MB
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">1,247 records</p>
                <p className="text-sm text-muted-foreground">Cached locally</p>
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }} data-testid="cache-usage-bar"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                className="bg-muted text-muted-foreground hover:bg-muted/80"
                data-testid="button-refresh-cache"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                RefreshCw
              </Button>
              <Button 
                variant="secondary" 
                className="bg-red-100 text-red-700 hover:bg-red-200"
                data-testid="button-clear-cache"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
