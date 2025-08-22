
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, Play, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function SyncOperations() {
  const { data: operations, isLoading } = useQuery({
    queryKey: ["sync-operations"],
    queryFn: async () => {
      const response = await fetch("/api/sync-operations");
      return response.json();
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "running":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Sync Operations</h1>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Start New Sync
          </Button>
        </div>

        <div className="space-y-4">
          {operations?.map((operation: any) => (
            <Card key={operation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(operation.status)}
                    <div>
                      <CardTitle className="text-lg">
                        {operation.operation} - Database {operation.databaseId}
                      </CardTitle>
                      <CardDescription>
                        Started: {new Date(operation.startTime).toLocaleString()}
                        {operation.endTime && (
                          <span className="ml-4">
                            Completed: {new Date(operation.endTime).toLocaleString()}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(operation.status)}>
                    {operation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{operation.recordsProcessed} / {operation.totalRecords} records</span>
                  </div>
                  <Progress 
                    value={(operation.recordsProcessed / operation.totalRecords) * 100} 
                    className="h-2"
                  />
                  {operation.errorMessage && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Error: {operation.errorMessage}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!operations?.length && (
          <Card className="text-center py-12">
            <CardContent>
              <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">No Sync Operations</CardTitle>
              <CardDescription className="mb-4">
                No sync operations have been performed yet.
              </CardDescription>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Start Your First Sync
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
