
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Search, Filter, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function DataChanges() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [operationFilter, setOperationFilter] = useState("all");

  const { data: changes, isLoading } = useQuery({
    queryKey: ["data-changes"],
    queryFn: async () => {
      const response = await fetch("/api/data-changes");
      return response.json();
    },
  });

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredChanges = changes?.filter((change: any) => {
    const matchesSearch = change.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         change.databaseId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || change.status === statusFilter;
    const matchesOperation = operationFilter === "all" || change.operation === operationFilter;
    
    return matchesSearch && matchesStatus && matchesOperation;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-16 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Data Changes</h1>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by record ID or database..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Operation</label>
                <Select value={operationFilter} onValueChange={setOperationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All operations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Operations</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes List */}
        <div className="space-y-4">
          {filteredChanges?.map((change: any) => (
            <Card key={change.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOperationColor(change.operation)}`}>
                          {change.operation}
                        </span>
                        <Badge variant={getStatusColor(change.status)}>
                          {change.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Record: <span className="font-mono">{change.recordId}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Database: <span className="font-mono">{change.databaseId}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <div>{new Date(change.timestamp).toLocaleString()}</div>
                    {change.errorMessage && (
                      <div className="text-red-600 text-xs mt-1">
                        Error: {change.errorMessage}
                      </div>
                    )}
                  </div>
                </div>

                {change.changeData && (
                  <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                    <strong>Changes:</strong>
                    <pre className="mt-1 text-xs overflow-x-auto">
                      {JSON.stringify(change.changeData, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {!filteredChanges?.length && (
          <Card className="text-center py-12">
            <CardContent>
              <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">No Data Changes Found</CardTitle>
              <CardDescription>
                {searchTerm || statusFilter !== "all" || operationFilter !== "all" 
                  ? "No changes match your current filters."
                  : "No data changes have been recorded yet."
                }
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
