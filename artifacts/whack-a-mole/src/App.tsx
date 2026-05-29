import { Switch, Route, Router as WouterRouter } from "wouter";
import { useBrowserLocation } from "wouter/use-browser-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmbeddedProvider } from "@/contexts/EmbeddedContext";
import NotFound from "@/pages/not-found";

import { Home } from "@/pages/Home";
import { Leaderboard } from "@/pages/Leaderboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

/** When embedded via iframe at .../index.html, wouter sees /index.html — normalize to / */
function useGameLocation(): ReturnType<typeof useBrowserLocation> {
  const [location, navigate] = useBrowserLocation();
  const normalized =
    location === "/index.html" || location.endsWith("/index.html")
      ? location.replace(/\/index\.html$/, "") || "/"
      : location;
  return [normalized, navigate];
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter
          base={import.meta.env.BASE_URL.replace(/\/$/, "")}
          hook={useGameLocation}
        >
          <EmbeddedProvider>
            <Router />
          </EmbeddedProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
