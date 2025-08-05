import { useQuery } from "@tanstack/react-query";
import { User, Briefcase, Plus, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DataChange } from "@shared/schema";

export default function DataPreview() {
  const { data: changes, isLoading } = useQuery<DataChange[]>({
    queryKey: ["/api/data-changes"],
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return Plus;
      case 'updated': return Edit;
      default: return Edit;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-yellow-100 text-yellow-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordIcon = (recordName: string) => {
    if (recordName.includes('Smith') || recordName.includes('User')) return User;
    return Briefcase;
  };

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return 'Unknown';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Unknown';
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground" data-testid="data-preview-title">Recent Data Changes</h3>
          <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="button-view-all-changes">
            View All Changes
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Record</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Database</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Action</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Time</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {changes?.map((change) => {
                const ActionIcon = getActionIcon(change.action);
                const RecordIcon = getRecordIcon(change.recordName);
                
                return (
                  <tr key={change.id} data-testid={`change-row-${change.id}`}>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                          <RecordIcon className="text-purple-600 w-4 h-4" />
                        </div>
                        <span className="font-medium text-foreground" data-testid={`change-record-name-${change.id}`}>
                          {change.recordName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground" data-testid={`change-database-${change.id}`}>
                      {change.databaseId?.includes('customer') ? 'Customer Database' : 'Project Tracker'}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getActionColor(change.action)}`} data-testid={`change-action-${change.id}`}>
                        <ActionIcon className="w-3 h-3 mr-1" />
                        {change.action.charAt(0).toUpperCase() + change.action.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground" data-testid={`change-time-${change.id}`}>
                      {formatTimeAgo(change.timestamp)}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(change.status)}`} data-testid={`change-status-${change.id}`}>
                        {change.status === 'synced' ? '✓' : change.status === 'pending' ? '⏳' : '✗'} {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
