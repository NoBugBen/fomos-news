// ============================================================
// FOMOS NEWS — Home Page
// Design: Neural Cyberpunk — asymmetric layout, hero + news grid
// Sections: Hero, Market Signal Bar, News Feed, Featured Briefing
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { categoryLabels, categoryColors, marketSignal, type NewsItem } from "@/lib/sampleData";
import { fetchLatestBriefing, fetchNews } from "@/lib/api";
import { ArrowRight, Star, Flame, Clock, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663295056596/5yGwWBPmUEGL4RxsXqWZbC/fomos-hero-banner-b7MJLgvRcHYhURXyuv2BxS.webp";

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={10}
          className={s <= stars ? "star-filled fill-current" : "star-empty"}
        />
      ))}
    </span>
  );
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const categoryLabel = categoryLabels[item.category] ?? item.category;
  const categoryColor = categoryColors[item.category] ?? "text-[var(--muted-foreground)]";

  return (
    <article
      className="neon-card p-4 group cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`terminal-text text-xs font-medium ${categoryColor}`}>
          [{categoryLabel}]
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {item.isHot && (
            <span className="flex items-center gap-0.5 terminal-text text-xs text-[var(--cyber-orange)]">
              <Flame size={10} />
              HOT
            </span>
          )}
          <StarRating stars={item.stars} />
        </div>
      </div>

      <h3 className="text-sm font-semibold text-[var(--foreground)] leading-snug mb-2 group-hover:text-[var(--neon)] transition-colors">
        {item.title}
      </h3>

      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3 line-clamp-2">
        {item.summary}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 terminal-text text-xs text-[var(--muted-foreground)]">
            <Clock size={10} />
            {item.date}
          </span>
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 terminal-text text-xs text-[var(--cyber-blue)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {item.source}
            <ExternalLink size={9} />
          </a>
        </div>
        <div className="flex gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="data-badge text-[0.6rem]">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function MarketSignalBar() {
  const bullW = marketSignal.bullProbability;
  const bearW = marketSignal.bearProbability;
  const fgi = marketSignal.fearGreedIndex;

  const fgiColor =
    fgi >= 75 ? "text-[var(--cyber-orange)]" :
    fgi >= 50 ? "text-[var(--neon)]" :
    fgi >= 25 ? "text-yellow-400" :
    "text-[var(--cyber-red)]";

  return (
    <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="terminal-text text-xs text-[var(--neon)]">// MARKET_SIGNAL_LIVE</span>
        <span className="terminal-text text-xs text-[var(--muted-foreground)]">{marketSignal.lastUpdated}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Bull/Bear */}
        <div>
          <div className="terminal-text text-xs text-[var(--muted-foreground)] mb-1">多空概率</div>
          <div className="flex h-2 rounded-none overflow-hidden mb-1">
            <div className="bg-[var(--neon)] transition-all" style={{ width: `${bullW}%` }} />
            <div className="bg-[var(--cyber-red)] transition-all" style={{ width: `${bearW}%` }} />
          </div>
          <div className="flex justify-between terminal-text text-xs">
            <span className="bull-color">多 {bullW}%</span>
            <span className="bear-color">空 {bearW}%</span>
          </div>
        </div>
        {/* Fear & Greed */}
        <div>
          <div className="terminal-text text-xs text-[var(--muted-foreground)] mb-1">恐慌贪婪指数</div>
          <div className={`font-['JetBrains_Mono'] text-xl font-bold ${fgiColor}`}>{fgi}</div>
          <div className={`terminal-text text-xs ${fgiColor}`}>{marketSignal.fearGreedLabel}</div>
        </div>
        {/* AI Sentiment */}
        <div>
          <div className="terminal-text text-xs text-[var(--muted-foreground)] mb-1">AI 情绪指数</div>
          <div className="font-['JetBrains_Mono'] text-xl font-bold text-[var(--cyber-blue)]">{marketSignal.aiSentiment}</div>
          <div className="terminal-text text-xs text-[var(--cyber-blue)]">极度乐观</div>
        </div>
        {/* BTC Dominance */}
        <div>
          <div className="terminal-text text-xs text-[var(--muted-foreground)] mb-1">BTC 主导率</div>
          <div className="font-['JetBrains_Mono'] text-xl font-bold text-[var(--cyber-orange)]">{marketSignal.btcDominance}%</div>
          <div className="terminal-text text-xs text-[var(--cyber-orange)]">↑ 上升趋势</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [briefing, setBriefing] = useState<Awaited<ReturnType<typeof fetchLatestBriefing>> | null>(null);
  const [newsLoading, setNewsLoading] = useState(true);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [briefingError, setBriefingError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setNewsLoading(true);
    setBriefingLoading(true);
    setNewsError(null);
    setBriefingError(null);

    fetchNews()
      .then((items) => {
        if (!cancelled) {
          setNewsItems(items);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setNewsError(error instanceof Error ? error.message : "新闻加载失败");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setNewsLoading(false);
        }
      });

    fetchLatestBriefing()
      .then((payload) => {
        if (!cancelled) {
          setBriefing(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBriefingError(error instanceof Error ? error.message : "简报加载失败");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBriefingLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = [
    { key: "all", label: "全部" },
    ...Object.entries(categoryLabels).map(([key, label]) => ({ key, label })),
  ];

  const filtered = activeCategory === "all"
    ? newsItems
    : newsItems.filter((n) => n.category === activeCategory);

  const hotNews = newsItems.filter((n) => n.isHot).slice(0, 3);
  const previewItems = briefing?.sections[0]?.items.slice(0, 3) ?? [];

  return (
    <div className="scanlines">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden" style={{ height: "320px" }}>
        <img
          src={HERO_IMG}
          alt="Fomos News Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/90 via-[var(--background)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
        <div className="relative h-full container flex flex-col justify-center">
          <div className="terminal-text text-xs text-[var(--neon)] mb-2 animate-slide-in-left">
            // FOMOS_NEWS_TERMINAL v2.0 · {new Date().toLocaleDateString("zh-CN")}
          </div>
          <h1 className="font-['JetBrains_Mono'] text-3xl md:text-4xl font-bold neon-text mb-2 animate-fade-in-up cursor-blink">
            AI & Crypto Intelligence
          </h1>
          <p className="text-sm text-[var(--foreground)]/80 max-w-md mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            每日 AI 产品洞察 · 加密市场信号 · Agent 生态追踪
          </p>
          <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/briefing">
              <Button size="sm" className="bg-[var(--neon)] text-[var(--terminal-bg)] hover:bg-[var(--neon-dim)] terminal-text text-xs font-bold h-8">
                查看今日简报 <ArrowRight size={12} className="ml-1" />
              </Button>
            </Link>
            <Link href="/markets">
              <Button size="sm" variant="outline" className="border-[var(--neon)] text-[var(--neon)] hover:bg-[var(--neon-glow)] terminal-text text-xs h-8">
                市场信号
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container py-6">
        {/* ── Market Signal Bar ── */}
        <MarketSignalBar />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main News Feed ── */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`shrink-0 px-3 py-1 terminal-text text-xs border transition-all duration-200 ${
                    activeCategory === key
                      ? "border-[var(--neon)] text-[var(--neon)] bg-[var(--neon-glow)]"
                      : "border-[var(--panel-border)] text-[var(--muted-foreground)] hover:border-[var(--neon)] hover:text-[var(--neon)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* News Grid */}
            {newsLoading ? (
              <div className="cyber-panel p-4 terminal-text text-xs text-[var(--muted-foreground)]">
                // 正在加载新闻数据...
              </div>
            ) : newsError ? (
              <div className="cyber-panel p-4 terminal-text text-xs text-[var(--cyber-red)]">
                // 新闻加载失败: {newsError}
              </div>
            ) : filtered.length === 0 ? (
              <div className="cyber-panel p-4 terminal-text text-xs text-[var(--muted-foreground)]">
                // 当前分类下暂无新闻
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((item, i) => (
                  <NewsCard key={item.id} item={item} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-4">
            {/* Hot News */}
            <div className="cyber-panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={13} className="text-[var(--cyber-orange)]" />
                <span className="terminal-text text-xs text-[var(--neon)]">// HOT_SIGNALS</span>
              </div>
              <div className="space-y-3">
                {newsLoading ? (
                  <div className="terminal-text text-xs text-[var(--muted-foreground)]">
                    正在同步热点新闻...
                  </div>
                ) : newsError ? (
                  <div className="terminal-text text-xs text-[var(--cyber-red)]">
                    热点新闻暂不可用
                  </div>
                ) : hotNews.length === 0 ? (
                  <div className="terminal-text text-xs text-[var(--muted-foreground)]">
                    暂无热点新闻
                  </div>
                ) : (
                  hotNews.map((item, i) => (
                    <div key={item.id} className="flex gap-2 group cursor-pointer">
                      <span className="terminal-text text-lg font-bold text-[var(--panel-border)] shrink-0 leading-tight">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-xs text-[var(--foreground)] leading-snug group-hover:text-[var(--neon)] transition-colors">
                          {item.title}
                        </p>
                        <span className={`terminal-text text-xs ${categoryColors[item.category] ?? "text-[var(--muted-foreground)]"}`}>
                          {categoryLabels[item.category] ?? item.category}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today's Briefing Preview */}
            <div className="cyber-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="terminal-text text-xs text-[var(--neon)]">// DAILY_BRIEFING</span>
                <Link href="/briefing">
                  <button className="terminal-text text-xs text-[var(--muted-foreground)] hover:text-[var(--neon)] flex items-center gap-0.5">
                    全文 <ChevronRight size={11} />
                  </button>
                </Link>
              </div>
              <div className="terminal-text text-xs text-[var(--muted-foreground)] mb-3">
                💡 产品洞察日报 · {briefing?.date ?? "最新简报"}
              </div>
              {briefingLoading ? (
                <div className="terminal-text text-xs text-[var(--muted-foreground)]">
                  正在加载简报预览...
                </div>
              ) : briefingError ? (
                <div className="terminal-text text-xs text-[var(--cyber-red)]">
                  简报预览加载失败: {briefingError}
                </div>
              ) : previewItems.length === 0 ? (
                <div className="terminal-text text-xs text-[var(--muted-foreground)]">
                  暂无简报内容
                </div>
              ) : (
                previewItems.map((item, i) => (
                  <div key={item.id} className="mb-2 pb-2 border-b border-[var(--panel-border)] last:border-0 last:mb-0 last:pb-0">
                    <div className="flex items-start gap-1.5">
                      <span className="terminal-text text-xs text-[var(--neon)] shrink-0">{["❶","❷","❸"][i] ?? `${i+1}.`}</span>
                      <div>
                        <span className="text-xs font-medium text-[var(--foreground)]">{item.title}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={8} className={s <= item.stars ? "star-filled fill-current" : "star-empty"} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Links */}
            <div className="cyber-panel p-4">
              <div className="terminal-text text-xs text-[var(--neon)] mb-3">// QUICK_ACCESS</div>
              <div className="space-y-2">
                {[
                  { href: "/leaderboard", label: "AI 模型排行榜", badge: "TOP 8" },
                  { href: "/leaderboard", label: "Agent 排行榜", badge: "NEW" },
                  { href: "/leaderboard", label: "TradingAgent 排名", badge: "LIVE" },
                  { href: "/ecosystem", label: "Agent 生态图", badge: "MAP" },
                ].map(({ href, label, badge }) => (
                  <Link key={label} href={href}>
                    <div className="flex items-center justify-between group cursor-pointer py-1 border-b border-[var(--panel-border)] last:border-0">
                      <span className="terminal-text text-xs text-[var(--muted-foreground)] group-hover:text-[var(--neon)] transition-colors">
                        ▸ {label}
                      </span>
                      <span className="data-badge">{badge}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
