// ============================================================
// FOMOS NEWS — Ecosystem Page
// Design: Neural Cyberpunk — interactive node graph ecosystem map
// Features: Category filter, node details, connection visualization
// ============================================================

import { useState, useMemo } from "react";
import { ecosystemNodes } from "@/lib/sampleData";
import type { EcosystemNode } from "@/lib/sampleData";

const ECOSYSTEM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663295056596/5yGwWBPmUEGL4RxsXqWZbC/fomos-ecosystem-bg-9ac45Wj33JGdtSPNUFw4sD.webp";

const categoryConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  foundation: { label: "基础模型", color: "#00FF88", bgColor: "rgba(0,255,136,0.15)" },
  infrastructure: { label: "基础设施", color: "#00D4FF", bgColor: "rgba(0,212,255,0.15)" },
  application: { label: "应用层", color: "#9945FF", bgColor: "rgba(153,69,255,0.15)" },
  defi: { label: "DeFi/AgentFi", color: "#FF8C00", bgColor: "rgba(255,140,0,0.15)" },
  data: { label: "数据层", color: "#FF3366", bgColor: "rgba(255,51,102,0.15)" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "活跃", color: "#00FF88" },
  emerging: { label: "新兴", color: "#FF8C00" },
  stable: { label: "稳定", color: "#00D4FF" },
};

// Node positions in a circular layout
function computePositions(nodes: EcosystemNode[], width: number, height: number) {
  const positions: Record<string, { x: number; y: number }> = {};
  const categories = ["foundation", "infrastructure", "application", "defi", "data"];
  const byCategory: Record<string, EcosystemNode[]> = {};

  categories.forEach((c) => { byCategory[c] = []; });
  nodes.forEach((n) => {
    if (byCategory[n.category]) byCategory[n.category].push(n);
  });

  const cx = width / 2, cy = height / 2;
  const radii: Record<string, number> = {
    foundation: 0,
    infrastructure: 160,
    application: 260,
    defi: 220,
    data: 300,
  };

  // Center: foundation nodes
  const foundationNodes = byCategory.foundation;
  foundationNodes.forEach((n, i) => {
    const angle = (i / foundationNodes.length) * 2 * Math.PI - Math.PI / 2;
    positions[n.id] = {
      x: cx + (foundationNodes.length > 1 ? 80 * Math.cos(angle) : 0),
      y: cy + (foundationNodes.length > 1 ? 60 * Math.sin(angle) : 0),
    };
  });

  // Other categories in rings
  const otherCategories = ["infrastructure", "application", "defi", "data"];
  otherCategories.forEach((cat) => {
    const catNodes = byCategory[cat];
    const r = radii[cat];
    const startAngle = cat === "infrastructure" ? -Math.PI / 2 :
                       cat === "application" ? Math.PI / 6 :
                       cat === "defi" ? Math.PI / 2 :
                       -Math.PI / 3;
    catNodes.forEach((n, i) => {
      const angle = startAngle + (i / catNodes.length) * 2 * Math.PI;
      positions[n.id] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    });
  });

  return positions;
}

function NodeComponent({
  node, x, y, isSelected, isConnected, onSelect
}: {
  node: EcosystemNode;
  x: number; y: number;
  isSelected: boolean;
  isConnected: boolean;
  onSelect: (id: string) => void;
}) {
  const config = categoryConfig[node.category];
  const r = node.size === "large" ? 22 : node.size === "medium" ? 16 : 11;
  const opacity = isSelected || isConnected ? 1 : 0.6;

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={() => onSelect(node.id)}
      style={{ cursor: "pointer", opacity }}
    >
      {/* Glow ring */}
      {(isSelected || isConnected) && (
        <circle r={r + 6} fill="none" stroke={config.color} strokeWidth="1" opacity={0.4} />
      )}
      {/* Main circle */}
      <circle
        r={r}
        fill={config.bgColor}
        stroke={config.color}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />
      {/* Label */}
      <text
        y={r + 12}
        textAnchor="middle"
        fill={config.color}
        fontSize={node.size === "large" ? 9 : 8}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={isSelected ? "bold" : "normal"}
      >
        {node.name.length > 10 ? node.name.slice(0, 9) + "…" : node.name}
      </text>
      {/* Status dot */}
      <circle
        cx={r - 4}
        cy={-(r - 4)}
        r={3}
        fill={statusConfig[node.status].color}
      />
    </g>
  );
}

export default function EcosystemPage() {
  const [selectedId, setSelectedId] = useState<string | null>("fomos");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const SVG_W = 720, SVG_H = 560;
  const positions = useMemo(() => computePositions(ecosystemNodes, SVG_W, SVG_H), []);

  const filteredNodes = activeCategory === "all"
    ? ecosystemNodes
    : ecosystemNodes.filter((n) => n.category === activeCategory);

  const selectedNode = selectedId ? ecosystemNodes.find((n) => n.id === selectedId) : null;
  const connectedIds = selectedNode ? new Set(selectedNode.connections) : new Set<string>();

  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  return (
    <div className="scanlines">
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ height: "180px" }}>
        <img src={ECOSYSTEM_IMG} alt="Ecosystem" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/95 via-[var(--background)]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
        <div className="relative h-full container flex flex-col justify-center">
          <div className="terminal-text text-xs text-[var(--neon)] mb-1">// AGENT_ECOSYSTEM_MAP</div>
          <h1 className="font-['JetBrains_Mono'] text-2xl md:text-3xl font-bold neon-text">生态图</h1>
          <p className="terminal-text text-sm text-[var(--muted-foreground)] mt-1">
            AI Agent 生态全景 · {ecosystemNodes.length} 个节点
          </p>
        </div>
      </section>

      <div className="container py-6">
        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 px-3 py-1 terminal-text text-xs border transition-all ${
              activeCategory === "all"
                ? "border-[var(--neon)] text-[var(--neon)] bg-[var(--neon-glow)]"
                : "border-[var(--panel-border)] text-[var(--muted-foreground)] hover:border-[var(--neon)] hover:text-[var(--neon)]"
            }`}
          >
            全部 ({ecosystemNodes.length})
          </button>
          {Object.entries(categoryConfig).map(([key, { label, color }]) => {
            const count = ecosystemNodes.filter((n) => n.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`shrink-0 px-3 py-1 terminal-text text-xs border transition-all ${
                  activeCategory === key
                    ? "border-current bg-[var(--neon-glow)]"
                    : "border-[var(--panel-border)] text-[var(--muted-foreground)] hover:border-current"
                }`}
                style={{ color }}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SVG Map */}
          <div className="lg:col-span-2 cyber-panel overflow-hidden">
            <div className="px-4 py-2 border-b border-[var(--panel-border)] bg-[var(--panel-bg)]">
              <span className="terminal-text text-xs text-[var(--neon)]">// NETWORK_TOPOLOGY_VIEW</span>
              <span className="terminal-text text-xs text-[var(--muted-foreground)] ml-3">点击节点查看详情</span>
            </div>
            <div className="overflow-auto">
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="w-full"
                style={{ minHeight: "400px", background: "var(--terminal-bg)" }}
              >
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,255,136,0.04)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

                {/* Connections */}
                {ecosystemNodes.map((node) =>
                  node.connections.map((targetId) => {
                    const target = ecosystemNodes.find((n) => n.id === targetId);
                    if (!target) return null;
                    const from = positions[node.id];
                    const to = positions[target.id];
                    if (!from || !to) return null;

                    const isHighlighted =
                      selectedId === node.id || selectedId === targetId;
                    const isVisible =
                      activeCategory === "all" ||
                      node.category === activeCategory ||
                      target.category === activeCategory;

                    if (!isVisible) return null;

                    return (
                      <line
                        key={`${node.id}-${targetId}`}
                        x1={from.x} y1={from.y}
                        x2={to.x} y2={to.y}
                        stroke={isHighlighted ? "var(--neon)" : "rgba(0,255,136,0.12)"}
                        strokeWidth={isHighlighted ? 1.5 : 0.8}
                        strokeDasharray={isHighlighted ? "none" : "4,4"}
                      />
                    );
                  })
                )}

                {/* Nodes */}
                {filteredNodes.map((node) => {
                  const pos = positions[node.id];
                  if (!pos) return null;
                  return (
                    <NodeComponent
                      key={node.id}
                      node={node}
                      x={pos.x}
                      y={pos.y}
                      isSelected={selectedId === node.id}
                      isConnected={connectedIds.has(node.id)}
                      onSelect={handleSelect}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Selected Node Details */}
            {selectedNode ? (
              <div className="cyber-panel p-4">
                <div className="terminal-text text-xs text-[var(--neon)] mb-3">// NODE_DETAIL</div>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: categoryConfig[selectedNode.category].color }}
                  />
                  <span className="font-['JetBrains_Mono'] font-bold text-base text-[var(--foreground)]">
                    {selectedNode.name}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="terminal-text text-xs text-[var(--muted-foreground)]">分类</span>
                    <span className="terminal-text text-xs" style={{ color: categoryConfig[selectedNode.category].color }}>
                      {categoryConfig[selectedNode.category].label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="terminal-text text-xs text-[var(--muted-foreground)]">规模</span>
                    <span className="terminal-text text-xs text-[var(--foreground)]">
                      {selectedNode.size === "large" ? "大型" : selectedNode.size === "medium" ? "中型" : "小型"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="terminal-text text-xs text-[var(--muted-foreground)]">状态</span>
                    <span className="terminal-text text-xs flex items-center gap-1" style={{ color: statusConfig[selectedNode.status].color }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: statusConfig[selectedNode.status].color }} />
                      {statusConfig[selectedNode.status].label}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-3 leading-relaxed">
                  {selectedNode.description}
                </p>
                <div>
                  <div className="terminal-text text-xs text-[var(--muted-foreground)] mb-1">连接节点 ({selectedNode.connections.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.connections.map((cid) => {
                      const cn = ecosystemNodes.find((n) => n.id === cid);
                      return cn ? (
                        <button
                          key={cid}
                          onClick={() => setSelectedId(cid)}
                          className="data-badge text-[0.6rem] hover:bg-[var(--neon-glow)] transition-colors"
                        >
                          {cn.name}
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="cyber-panel p-4 text-center">
                <div className="terminal-text text-xs text-[var(--muted-foreground)]">
                  // 点击节点查看详情
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="cyber-panel p-4">
              <div className="terminal-text text-xs text-[var(--neon)] mb-3">// LEGEND</div>
              <div className="space-y-2">
                {Object.entries(categoryConfig).map(([key, { label, color }]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="terminal-text text-xs text-[var(--muted-foreground)]">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--panel-border)]">
                <div className="terminal-text text-xs text-[var(--muted-foreground)] mb-2">节点大小</div>
                <div className="flex items-center gap-3">
                  {[{ size: "大型", r: 8 }, { size: "中型", r: 6 }, { size: "小型", r: 4 }].map(({ size, r }) => (
                    <div key={size} className="flex items-center gap-1">
                      <div className="rounded-full border border-[var(--neon)]" style={{ width: r * 2, height: r * 2 }} />
                      <span className="terminal-text text-xs text-[var(--muted-foreground)]">{size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="cyber-panel p-4">
              <div className="terminal-text text-xs text-[var(--neon)] mb-3">// ECOSYSTEM_STATS</div>
              <div className="space-y-2">
                {Object.entries(categoryConfig).map(([key, { label, color }]) => {
                  const count = ecosystemNodes.filter((n) => n.category === key).length;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <div className="flex-1 terminal-text text-xs text-[var(--muted-foreground)]">{label}</div>
                      <div className="flex-1 h-1.5 bg-[var(--panel-bg)] overflow-hidden">
                        <div className="h-full" style={{ width: `${(count / ecosystemNodes.length) * 100}%`, background: color }} />
                      </div>
                      <span className="terminal-text text-xs w-4 text-right" style={{ color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
