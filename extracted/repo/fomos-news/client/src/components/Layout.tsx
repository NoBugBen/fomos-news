// ============================================================
// FOMOS NEWS — Layout Component
// Design: Neural Cyberpunk — fixed top navbar, ticker, footer
// Features: Theme toggle, mobile menu, neon nav links
// ============================================================

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sun, Moon, Menu, Zap, TrendingUp, BarChart3, Network, Newspaper, Mail } from "lucide-react";
import { marketSignal } from "@/lib/sampleData";
import SubscribeModal from "./SubscribeModal";

const navItems = [
  { href: "/", label: "首页", icon: Newspaper },
  { href: "/briefing", label: "每日简报", icon: Zap },
  { href: "/markets", label: "市场信号", icon: TrendingUp },
  { href: "/leaderboard", label: "排行榜", icon: BarChart3 },
  { href: "/ecosystem", label: "生态图", icon: Network },
];

const tickerItems = [
  `BTC $119,420 ▲2.3%`,
  `ETH $4,821 ▲1.8%`,
  `SOL $312 ▲5.1%`,
  `BNB $687 ▲0.9%`,
  `恐慌贪婪指数: ${marketSignal.fearGreedIndex} ${marketSignal.fearGreedLabel}`,
  `多头概率: ${marketSignal.bullProbability}%`,
  `AI情绪指数: ${marketSignal.aiSentiment}`,
  `BTC 主导率: ${marketSignal.btcDominance}%`,
  `GPT-5 Turbo 发布 · 推理速度 ▲300%`,
  `Eliza Protocol 日活突破 100万`,
  `Claude Enterprise Agents 正式上线`,
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Ticker Tape ── */}
      <div className="bg-[var(--terminal-bg)] border-b border-[var(--panel-border)] py-1 overflow-hidden">
        <div className="ticker-wrap">
          <div className="ticker-content terminal-text text-xs text-[var(--neon)]">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="mx-6">
                <span className="opacity-40 mr-1">▸</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navbar ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--terminal-bg)]/95 backdrop-blur-sm border-b border-[var(--panel-border)] shadow-[0_0_20px_var(--neon-glow)]"
            : "bg-[var(--terminal-bg)] border-b border-[var(--panel-border)]"
        }`}
      >
        <div className="container flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-7 h-7 border border-[var(--neon)] flex items-center justify-center animate-glow-pulse">
                <span className="terminal-text text-xs font-bold neon-text">F</span>
              </div>
              <span className="font-['JetBrains_Mono'] font-bold text-base neon-text tracking-wider">
                FOMOS<span className="text-[var(--muted-foreground)] font-normal">.NEWS</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = location === href;
              return (
                <Link key={href} href={href}>
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 terminal-text text-xs font-medium transition-all duration-200 border ${
                      isActive
                        ? "border-[var(--neon)] text-[var(--neon)] bg-[var(--neon-glow)]"
                        : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--neon)] hover:border-[var(--panel-border)]"
                    }`}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubscribeOpen(true)}
              className="hidden sm:flex items-center gap-1.5 terminal-text text-xs border-[var(--neon)] text-[var(--neon)] hover:bg-[var(--neon-glow)] h-7 px-3"
            >
              <Mail size={11} />
              订阅简报
            </Button>

            <button
              onClick={toggleTheme}
              className="w-7 h-7 flex items-center justify-center border border-[var(--panel-border)] text-[var(--muted-foreground)] hover:text-[var(--neon)] hover:border-[var(--neon)] transition-all duration-200"
            >
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </button>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden w-7 h-7 flex items-center justify-center border border-[var(--panel-border)] text-[var(--muted-foreground)]">
                  <Menu size={14} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[var(--terminal-bg)] border-[var(--panel-border)] w-64">
                <div className="flex flex-col gap-2 mt-8">
                  <div className="terminal-text text-xs text-[var(--muted-foreground)] mb-4 pb-2 border-b border-[var(--panel-border)]">
                    // NAVIGATION_MENU
                  </div>
                  {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = location === href;
                    return (
                      <Link key={href} href={href}>
                        <button
                          onClick={() => setMobileOpen(false)}
                          className={`w-full flex items-center gap-2 px-3 py-2 terminal-text text-sm transition-all ${
                            isActive
                              ? "text-[var(--neon)] border-l-2 border-[var(--neon)] pl-2"
                              : "text-[var(--muted-foreground)] hover:text-[var(--neon)]"
                          }`}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => { setSubscribeOpen(true); setMobileOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 terminal-text text-sm text-[var(--neon)] border border-[var(--neon)] mt-4"
                  >
                    <Mail size={14} />
                    订阅每日简报
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[var(--terminal-bg)] border-t border-[var(--panel-border)] py-8 mt-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 border border-[var(--neon)] flex items-center justify-center">
                  <span className="terminal-text text-xs font-bold neon-text">F</span>
                </div>
                <span className="font-['JetBrains_Mono'] font-bold text-sm neon-text">FOMOS.NEWS</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                AI 与加密货币领域每日洞察平台。<br />
                Architecting Intelligent Financial Decisions.
              </p>
            </div>
            <div>
              <div className="terminal-text text-xs text-[var(--neon)] mb-3">// LINKS</div>
              <div className="flex flex-col gap-1">
                {navItems.map(({ href, label }) => (
                  <Link key={href} href={href}>
                    <span className="text-xs text-[var(--muted-foreground)] hover:text-[var(--neon)] transition-colors terminal-text cursor-pointer">
                      ▸ {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="terminal-text text-xs text-[var(--neon)] mb-3">// SYSTEM_STATUS</div>
              <div className="space-y-1">
                {[
                  { label: 'DATA_FEED', status: 'ONLINE' },
                  { label: 'AI_ANALYSIS', status: 'ACTIVE' },
                  { label: 'MARKET_SIGNAL', status: 'RUNNING' },
                ].map(({ label, status }) => (
                  <div key={label} className="flex items-center justify-between terminal-text text-xs">
                    <span className="text-[var(--muted-foreground)]">{label}</span>
                    <span className="text-[var(--neon)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse inline-block" />
                      {status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-[var(--muted-foreground)] terminal-text">
                © 2026 Fomos Inc. MIT License
              </div>
            </div>
          </div>
        </div>
      </footer>

      <SubscribeModal open={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
}
