import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import Databases from "@/pages/databases";
import SyncOperations from "@/pages/sync-operations";
import Settings from "@/pages/settings";
import DataChanges from "@/pages/data-changes";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/databases" component={Databases} />
      <Route path="/sync-operations" component={SyncOperations} />
      <Route path="/data-changes" component={DataChanges} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
