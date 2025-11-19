import { useQuery } from "@tanstack/react-query";
import { Database, RefreshCw, Clock, Server, TrendingUp, CheckCircle, AlertTriangle, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  totalRecords: number;
  recordsGrowth: string;
  lastSync: string;
  pendingSync: number;
  cacheSize: string;
}

export default function SyncStatusDashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">FolderSync Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage your Notion database synchronization</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statusCards = [
    {
      icon: Database,
      title: "Total Records",
      value: stats?.totalRecords?.toLocaleString() || "0",
      subtitle: stats?.recordsGrowth || "+0% from last sync",
      iconBg: "bg-success/10",
      iconColor: "text-success",
      subtitleIcon: TrendingUp,
      subtitleColor: "text-success"
    },
    {
      icon: RefreshCw,
      title: "Last FolderSync",
      value: stats?.lastSync || "Never",
      subtitle: "Successful",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      subtitleIcon: CheckCircle,
      subtitleColor: "text-success"
    },
    {
      icon: Clock,
      title: "Pending Changes",
      value: stats?.pendingSync?.toString() || "0",
      subtitle: "Requires attention",
      iconBg: "bg-coral/10",
      iconColor: "text-coral",
      subtitleIcon: AlertTriangle,
      subtitleColor: "text-coral"
    },
    {
      icon: Server,
      title: "Cache Size",
      value: stats?.cacheSize || "0 MB",
      subtitle: "Optimized",
      iconBg: "bg-notion-dark/10",
      iconColor: "text-notion-dark",
      subtitleIcon: ArrowDown,
      subtitleColor: "text-success"
    }
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2" data-testid="dashboard-title">FolderSync Dashboard</h2>
        <p className="text-muted-foreground">Monitor and manage your Notion database synchronization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statusCards.map((card, index) => (
          <Card key={index} className="shadow-sm" data-testid={`status-card-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <card.icon className={`${card.iconColor} w-6 h-6`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-foreground" data-testid={`stat-value-${index}`}>
                    {card.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                </div>
              </div>
              <div className={`flex items-center text-sm ${card.subtitleColor}`}>
                <card.subtitleIcon className="w-4 h-4 mr-1" />
                <span>{card.subtitle}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}