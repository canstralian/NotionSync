
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Database, 
  RefreshCw, 
  Activity, 
  Settings 
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Databases",
    href: "/databases",
    icon: Database,
  },
  {
    label: "Sync Operations",
    href: "/sync-operations",
    icon: RefreshCw,
  },
  {
    label: "Data Changes",
    href: "/data-changes",
    icon: Activity,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Database className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Notion Sync</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "flex items-center gap-2",
                      isActive && "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
