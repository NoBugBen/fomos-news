// ============================================================
// FOMOS NEWS — App Root
// Design: Neural Cyberpunk — dark default, switchable to light
// Routes: Home, Briefing, Leaderboard, Ecosystem, Markets
// ============================================================

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BriefingPage from "./pages/BriefingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import EcosystemPage from "./pages/EcosystemPage";
import MarketsPage from "./pages/MarketsPage";
import Layout from "./components/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/briefing" component={BriefingPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/ecosystem" component={EcosystemPage} />
        <Route path="/markets" component={MarketsPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: 'var(--panel-bg)',
                border: '1px solid var(--panel-border)',
                color: 'var(--foreground)',
                fontFamily: 'JetBrains Mono, monospace',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
