// ============================================================
// FOMOS NEWS — Daily Briefing Page
// Design: Neural Cyberpunk — terminal output style briefing
// ============================================================

import { useState } from "react";
import { dailyBriefing } from "@/lib/sampleData";
import { Star, ChevronDown, ChevronUp, ExternalLink, Terminal } from "lucide-react";

const BRIEFING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663295056596/5yGwWBPmUEGL4RxsXqWZbC/fomos-briefing-header-JjZ95CoBgSA7BqfcpHFfVR.webp";

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={10} className={s <= stars ? "star-filled fill-current" : "star-empty"} />
      ))}
    </span>
  );
}

const rankSymbols = ["❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾", "❿"];

export default function BriefingPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="scanlines">
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ height: "200px" }}>
        <img src={BRIEFING_IMG} alt="Daily Briefing" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/95 via-[var(--background)]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
        <div className="relative h-full container flex flex-col justify-center">
          <div className="terminal-text text-xs text-[var(--neon)] mb-1">// DAILY_BRIEFING_TERMINAL</div>
          <h1 className="font-['JetBrains_Mono'] text-2xl md:text-3xl font-bold neon-text">
            产品洞察日报
          </h1>
          <p className="terminal-text text-sm text-[var(--muted-foreground)] mt-1">
            {dailyBriefing.date} · AI & Crypto Intelligence
          </p>
        </div>
      </section>

      <div className="container py-6 max-w-4xl">
        {/* Terminal Header */}
        <div className="cyber-panel mb-6">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--panel-border)] bg-[var(--panel-bg)]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--cyber-red)]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--cyber-orange)]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--neon)]" />
            </div>
            <span className="terminal-text text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 ml-2">
              <Terminal size={11} />
              fomos@news:~$ cat briefing_{dailyBriefing.date.replace(/年|月|日/g, "-").slice(0, -1)}.md
            </span>
          </div>
          <div className="p-4 terminal-text text-sm">
            <div className="text-[var(--neon)] mb-1">💡 产品洞察日报 · {dailyBriefing.date}</div>
            <div className="text-[var(--muted-foreground)]">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          </div>
        </div>

        {/* Briefing Sections */}
        <div className="space-y-4">
          {dailyBriefing.sections.map((section) => {
            const isExpanded = expandedSections[section.title] !== false; // default expanded

            return (
              <div key={section.title} className="cyber-panel">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-4 py-3 border-b border-[var(--panel-border)] hover:bg-[var(--panel-bg)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{section.emoji}</span>
                    <span className="font-['JetBrains_Mono'] font-semibold text-sm text-[var(--foreground)]">
                      {section.title}
                    </span>
                    <span className="data-badge">{section.items.length} 条</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={14} className="text-[var(--muted-foreground)]" />
                  ) : (
                    <ChevronDown size={14} className="text-[var(--muted-foreground)]" />
                  )}
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="divide-y divide-[var(--panel-border)]">
                    {section.items.map((item, i) => (
                      <div key={item.id} className="px-4 py-4 hover:bg-[var(--panel-bg)] transition-colors group">
                        <div className="flex items-start gap-3">
                          <span className="terminal-text text-lg font-bold text-[var(--neon)] shrink-0 leading-tight mt-0.5">
                            {rankSymbols[i] || `${i + 1}.`}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-['JetBrains_Mono'] font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--neon)] transition-colors">
                                {item.title}
                              </span>
                              <StarRating stars={item.stars} />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="data-badge text-[0.6rem]">{item.company}</span>
                              <span className="terminal-text text-xs text-[var(--muted-foreground)]">{item.date}</span>
                              <a
                                href="#"
                                className="flex items-center gap-0.5 terminal-text text-xs text-[var(--cyber-blue)] hover:underline"
                              >
                                {item.source}
                                <ExternalLink size={9} />
                              </a>
                            </div>
                            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                              {item.summary}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Analysis Section */}
        <div className="cyber-panel mt-6">
          <div className="px-4 py-3 border-b border-[var(--panel-border)] bg-[var(--panel-bg)]">
            <span className="terminal-text text-xs text-[var(--neon)]">📊 产品综合研判</span>
          </div>
          <div className="p-4 space-y-4">
            {[
              { label: "产品趋势", value: dailyBriefing.analysis.trend, icon: "▸" },
              { label: "竞争动态", value: dailyBriefing.analysis.competition, icon: "▸" },
              { label: "需求信号", value: dailyBriefing.analysis.demand, icon: "▸" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex gap-3">
                <span className="terminal-text text-sm text-[var(--neon)] shrink-0">{icon}</span>
                <div>
                  <span className="terminal-text text-xs font-semibold text-[var(--neon)] mr-2">{label}:</span>
                  <span className="text-sm text-[var(--muted-foreground)] leading-relaxed">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Archive hint */}
        <div className="mt-6 text-center">
          <div className="terminal-text text-xs text-[var(--muted-foreground)]">
            // 历史简报归档功能开发中 · ARCHIVE_COMING_SOON
          </div>
        </div>
      </div>
    </div>
  );
}
