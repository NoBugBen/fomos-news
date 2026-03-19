// ============================================================
// FOMOS NEWS — Leaderboard Page
// Design: Neural Cyberpunk — arena-style rankings
// Tabs: AI Models, Agents, TradingAgents
// ============================================================

import { useState } from "react";
import { aiModelRankings, agentRankings, tradingAgentRankings } from "@/lib/sampleData";
import type { LeaderboardItem } from "@/lib/sampleData";
import { TrendingUp, TrendingDown, Minus, Trophy, Zap, BarChart3 } from "lucide-react";

const tabs = [
  { key: "ai", label: "AI 模型排行", icon: Zap, data: aiModelRankings },
  { key: "agent", label: "Agent 排行", icon: Trophy, data: agentRankings },
  { key: "trading", label: "TradingAgent 排行", icon: BarChart3, data: tradingAgentRankings },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="font-['JetBrains_Mono'] text-lg font-bold" style={{ color: "#FFD700" }}>01</span>;
  if (rank === 2) return <span className="font-['JetBrains_Mono'] text-lg font-bold" style={{ color: "#C0C0C0" }}>02</span>;
  if (rank === 3) return <span className="font-['JetBrains_Mono'] text-lg font-bold" style={{ color: "#CD7F32" }}>03</span>;
  return <span className="font-['JetBrains_Mono'] text-lg font-bold text-[var(--muted-foreground)]">{String(rank).padStart(2, "0")}</span>;
}

function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) return (
    <span className="flex items-center gap-0.5 terminal-text text-xs bull-color">
      <TrendingUp size={10} />+{change}
    </span>
  );
  if (change < 0) return (
    <span className="flex items-center gap-0.5 terminal-text text-xs bear-color">
      <TrendingDown size={10} />{change}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 terminal-text text-xs text-[var(--muted-foreground)]">
      <Minus size={10} />0
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[var(--panel-bg)] border border-[var(--panel-border)] overflow-hidden">
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${score}%`, background: "linear-gradient(90deg, var(--neon-dim), var(--neon))" }}
        />
      </div>
      <span className="terminal-text text-xs text-[var(--neon)] w-10 text-right">{score}</span>
    </div>
  );
}

function LeaderboardRow({ item, index }: { item: LeaderboardItem; index: number }) {
  const isTop3 = item.rank <= 3;

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 border-b border-[var(--panel-border)] last:border-0 transition-all duration-200 hover:bg-[var(--panel-bg)] group animate-fade-in-up ${
        isTop3 ? "bg-[var(--neon-glow)]" : ""
      }`}
      style={{ animationDelay: `${index * 0.04}s`, animationFillMode: "both" }}
    >
      {/* Rank */}
      <div className="w-8 shrink-0 text-center">
        <RankBadge rank={item.rank} />
      </div>

      {/* Name & Company */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--neon)] transition-colors">
            {item.name}
          </span>
          {item.isNew && (
            <span className="data-badge text-[0.6rem] text-[var(--cyber-orange)] border-[var(--cyber-orange)]">NEW</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="terminal-text text-xs text-[var(--muted-foreground)]">{item.company}</span>
          <span className="terminal-text text-xs text-[var(--muted-foreground)] hidden sm:block">·</span>
          <span className="terminal-text text-xs text-[var(--muted-foreground)] hidden sm:block truncate">{item.description}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        {item.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="data-badge text-[0.6rem]">{tag}</span>
        ))}
      </div>

      {/* Score Bar */}
      <div className="w-32 shrink-0 hidden sm:block">
        <ScoreBar score={item.score} />
      </div>

      {/* Change */}
      <div className="w-12 shrink-0 text-right">
        <ChangeIndicator change={item.change} />
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("ai");
  const currentTab = tabs.find((t) => t.key === activeTab)!;

  return (
    <div className="scanlines">
      {/* Header */}
      <div className="bg-[var(--terminal-bg)] border-b border-[var(--panel-border)] py-8">
        <div className="container">
          <div className="terminal-text text-xs text-[var(--neon)] mb-1">// LEADERBOARD_SYSTEM</div>
          <h1 className="font-['JetBrains_Mono'] text-2xl md:text-3xl font-bold neon-text">排行榜</h1>
          <p className="terminal-text text-sm text-[var(--muted-foreground)] mt-1">
            AI 模型 · Agent · TradingAgent 综合评分排名
          </p>
        </div>
      </div>

      <div className="container py-6">
        {/* Tab Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 terminal-text text-xs font-medium border transition-all duration-200 shrink-0 ${
                activeTab === key
                  ? "border-[var(--neon)] text-[var(--neon)] bg-[var(--neon-glow)]"
                  : "border-[var(--panel-border)] text-[var(--muted-foreground)] hover:border-[var(--neon)] hover:text-[var(--neon)]"
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="cyber-panel">
          {/* Table Header */}
          <div className="flex items-center gap-4 px-4 py-2 border-b border-[var(--panel-border)] bg-[var(--panel-bg)]">
            <div className="w-8 terminal-text text-xs text-[var(--muted-foreground)] text-center">排名</div>
            <div className="flex-1 terminal-text text-xs text-[var(--muted-foreground)]">名称 / 公司</div>
            <div className="hidden md:block w-24 terminal-text text-xs text-[var(--muted-foreground)]">标签</div>
            <div className="hidden sm:block w-32 terminal-text text-xs text-[var(--muted-foreground)]">综合评分</div>
            <div className="w-12 terminal-text text-xs text-[var(--muted-foreground)] text-right">变化</div>
          </div>

          {/* Rows */}
          {currentTab.data.map((item, i) => (
            <LeaderboardRow key={item.name} item={item} index={i} />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <span className="terminal-text text-xs text-[var(--muted-foreground)]">// 评分说明:</span>
          <span className="terminal-text text-xs text-[var(--muted-foreground)]">综合评分 = 能力 × 0.4 + 生态 × 0.3 + 增长 × 0.3</span>
          <span className="terminal-text text-xs text-[var(--muted-foreground)]">更新频率: 每周一</span>
        </div>
      </div>
    </div>
  );
}
