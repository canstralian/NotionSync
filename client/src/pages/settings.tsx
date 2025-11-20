
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Save, Key, Database, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function Settings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    notionApiKey: "",
    autoSyncEnabled: false,
    syncInterval: 60,
    cacheSize: 512,
    enableNotifications: true,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["sync-settings"],
    queryFn: async () => {
      const response = await fetch("/api/sync-settings");
      return response.json();
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/sync-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync-settings"] });
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        notionApiKey: settings.notionApiKey || "",
        autoSyncEnabled: settings.autoSyncEnabled || false,
        syncInterval: settings.syncInterval || 60,
        cacheSize: settings.cacheSize || 512,
        enableNotifications: settings.enableNotifications || true,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Notion Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-500" />
                <CardTitle>Notion Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure your Notion API connection and authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notion-api-key">Notion API Key</Label>
                <Input
                  id="notion-api-key"
                  type="password"
                  value={formData.notionApiKey}
                  onChange={(e) => setFormData({...formData, notionApiKey: e.target.value})}
                  placeholder="secret_..."
                />
                <p className="text-sm text-gray-500">
                  Your Notion integration token. Keep this secure and never share it.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sync Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-green-500" />
                <CardTitle>Sync Settings</CardTitle>
              </div>
              <CardDescription>
                Configure how and when data synchronization occurs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto Sync</Label>
                  <p className="text-sm text-gray-500">
                    Automatically sync data at regular intervals
                  </p>
                </div>
                <Switch
                  checked={formData.autoSyncEnabled}
                  onCheckedChange={(checked) => setFormData({...formData, autoSyncEnabled: checked})}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                <Input
                  id="sync-interval"
                  type="number"
                  min="5"
                  max="1440"
                  value={formData.syncInterval}
                  onChange={(e) => setFormData({...formData, syncInterval: parseInt(e.target.value)})}
                />
                <p className="text-sm text-gray-500">
                  How often to automatically sync data (5-1440 minutes)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-500" />
                <CardTitle>Performance Settings</CardTitle>
              </div>
              <CardDescription>
                Configure caching and performance optimization settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cache-size">Cache Size (MB)</Label>
                <Input
                  id="cache-size"
                  type="number"
                  min="64"
                  max="2048"
                  value={formData.cacheSize}
                  onChange={(e) => setFormData({...formData, cacheSize: parseInt(e.target.value)})}
                />
                <p className="text-sm text-gray-500">
                  Maximum cache size for improved performance (64-2048 MB)
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Show notifications for sync completion and errors
                  </p>
                </div>
                <Switch
                  checked={formData.enableNotifications}
                  onCheckedChange={(checked) => setFormData({...formData, enableNotifications: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
