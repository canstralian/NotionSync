
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, Settings, Sync } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Databases() {
  const { data: databases, isLoading } = useQuery({
    queryKey: ["databases"],
    queryFn: async () => {
      const response = await fetch("/api/databases");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-4">
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notion Databases</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Database
          </Button>
        </div>

        <div className="grid gap-4">
          {databases?.map((db: any) => (
            <Card key={db.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-6 w-6 text-blue-500" />
                    <div>
                      <CardTitle className="text-lg">{db.name}</CardTitle>
                      <CardDescription>{db.id}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={db.syncEnabled ? "default" : "secondary"}>
                      {db.syncEnabled ? "Sync Enabled" : "Sync Disabled"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm">
                      <Sync className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Records:</span>
                    <span className="ml-2 font-medium">{db.recordCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Sync:</span>
                    <span className="ml-2 font-medium">
                      {db.lastSync ? new Date(db.lastSync).toLocaleString() : "Never"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium">{db.status || "Active"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!databases?.length && (
          <Card className="text-center py-12">
            <CardContent>
              <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">No Databases Found</CardTitle>
              <CardDescription className="mb-4">
                Connect your first Notion database to get started with syncing.
              </CardDescription>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Database
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
