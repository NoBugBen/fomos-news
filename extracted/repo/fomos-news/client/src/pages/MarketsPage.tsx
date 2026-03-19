// ============================================================
// FOMOS NEWS — Markets Page
// Design: Neural Cyberpunk — market signal dashboard
// Features: Bull/Bear probability, Fear/Greed index, charts
// ============================================================

import { marketSignal } from "@/lib/sampleData";
import {
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

const MARKET_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663295056596/5yGwWBPmUEGL4RxsXqWZbC/fomos-market-bg-8Qpa6PQoQz2ecUBgqwQnxu.webp";

// Historical data (mock)
const fearGreedHistory = [
  { date: "02-25", value: 58, label: "贪婪" },
  { date: "02-26", value: 63, label: "贪婪" },
  { date: "02-27", value: 69, label: "贪婪" },
  { date: "02-28", value: 71, label: "贪婪" },
  { date: "03-01", value: 68, label: "贪婪" },
  { date: "03-02", value: 74, label: "极度贪婪" },
  { date: "03-03", value: 72, label: "贪婪" },
];

const bullBearHistory = [
  { date: "02-25", bull: 55, bear: 45 },
  { date: "02-26", bull: 58, bear: 42 },
  { date: "02-27", bull: 62, bear: 38 },
  { date: "02-28", bull: 65, bear: 35 },
  { date: "03-01", bull: 63, bear: 37 },
  { date: "03-02", bull: 70, bear: 30 },
  { date: "03-03", bull: 68, bear: 32 },
];

const sentimentData = [
  { name: "AI 情绪", value: marketSignal.aiSentiment, color: "#00D4FF" },
  { name: "加密情绪", value: marketSignal.cryptoSentiment, color: "#00FF88" },
  { name: "BTC主导率", value: marketSignal.btcDominance, color: "#FF8C00" },
  { name: "多头概率", value: marketSignal.bullProbability, color: "#00FF88" },
];

const cryptoPrices = [
  { name: "BTC", price: 119420, change: 2.3, color: "#FF8C00" },
  { name: "ETH", price: 4821, change: 1.8, color: "#627EEA" },
  { name: "SOL", price: 312, change: 5.1, color: "#9945FF" },
  { name: "BNB", price: 687, change: 0.9, color: "#F3BA2F" },
  { name: "AVAX", price: 89, change: -1.2, color: "#E84142" },
  { name: "MATIC", price: 1.24, change: 3.4, color: "#8247E5" },
];

function GaugeChart({ value, label, color }: { value: number; label: string; color: string }) {
  const data = [
    { value: value, fill: color },
    { value: 100 - value, fill: "transparent" },
  ];
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="60%" outerRadius="90%"
            startAngle={180} endAngle={0}
            data={[{ value, fill: color }]}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "var(--panel-border)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-['JetBrains_Mono'] text-2xl font-bold" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="terminal-text text-xs text-[var(--muted-foreground)] mt-1">{label}</span>
    </div>
  );
}

function FearGreedGauge({ value }: { value: number }) {
  const color =
    value >= 75 ? "#FF8C00" :
    value >= 50 ? "#00FF88" :
    value >= 25 ? "#FFD700" :
    "#FF3366";

  const label =
    value >= 75 ? "极度贪婪" :
    value >= 50 ? "贪婪" :
    value >= 25 ? "中性" :
    value >= 10 ? "恐慌" : "极度恐慌";

  // SVG arc gauge
  const angle = (value / 100) * 180 - 90; // -90 to 90 degrees
  const rad = (angle * Math.PI) / 180;
  const cx = 100, cy = 90, r = 70;
  const needleX = cx + r * Math.cos(rad);
  const needleY = cy + r * Math.sin(rad);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-xs">
        {/* Background arc segments */}
        {[
          { color: "#FF3366", start: 180, end: 216 },
          { color: "#FF6B35", start: 216, end: 252 },
          { color: "#FFD700", start: 252, end: 288 },
          { color: "#9EE493", start: 288, end: 324 },
          { color: "#00FF88", start: 324, end: 360 },
        ].map(({ color, start, end }, i) => {
          const s = ((start - 180) * Math.PI) / 180;
          const e = ((end - 180) * Math.PI) / 180;
          const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
          const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
          const ir = r - 16;
          const ix1 = cx + ir * Math.cos(s), iy1 = cy + ir * Math.sin(s);
          const ix2 = cx + ir * Math.cos(e), iy2 = cy + ir * Math.sin(e);
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 0 0 ${ix1} ${iy1} Z`}
              fill={color}
              opacity={0.8}
            />
          );
        })}
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needleX} y2={needleY}
          stroke={color} strokeWidth="3" strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        {/* Labels */}
        <text x="20" y="105" fill="#FF3366" fontSize="8" fontFamily="monospace">极度恐慌</text>
        <text x="155" y="105" fill="#00FF88" fontSize="8" fontFamily="monospace">极度贪婪</text>
        <text x="85" y="108" fill={color} fontSize="10" fontFamily="monospace" fontWeight="bold">{value}</text>
      </svg>
      <div className="terminal-text text-sm font-bold mt-1" style={{ color }}>{label}</div>
    </div>
  );
}

export default function MarketsPage() {
  return (
    <div className="scanlines">
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ height: "180px" }}>
        <img src={MARKET_IMG} alt="Markets" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/95 via-[var(--background)]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
        <div className="relative h-full container flex flex-col justify-center">
          <div className="terminal-text text-xs text-[var(--neon)] mb-1">// MARKET_SIGNAL_DASHBOARD</div>
          <h1 className="font-['JetBrains_Mono'] text-2xl md:text-3xl font-bold neon-text">市场信号</h1>
          <p className="terminal-text text-sm text-[var(--muted-foreground)] mt-1">
            多空概率 · 恐慌贪婪指数 · 情绪分析
          </p>
        </div>
      </section>

      <div className="container py-6">
        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "多头概率", value: `${marketSignal.bullProbability}%`, color: "var(--neon)", sub: "↑ 上升趋势" },
            { label: "空头概率", value: `${marketSignal.bearProbability}%`, color: "var(--cyber-red)", sub: "↓ 下降趋势" },
            { label: "AI 情绪", value: marketSignal.aiSentiment, color: "var(--cyber-blue)", sub: "极度乐观" },
            { label: "BTC 主导率", value: `${marketSignal.btcDominance}%`, color: "var(--cyber-orange)", sub: "↑ 上升" },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="cyber-panel p-4 text-center">
              <div className="terminal-text text-xs text-[var(--muted-foreground)] mb-1">{label}</div>
              <div className="font-['JetBrains_Mono'] text-2xl font-bold" style={{ color }}>{value}</div>
              <div className="terminal-text text-xs mt-1" style={{ color }}>{sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Fear & Greed Gauge */}
          <div className="cyber-panel p-6">
            <div className="terminal-text text-xs text-[var(--neon)] mb-4">// FEAR_GREED_INDEX</div>
            <FearGreedGauge value={marketSignal.fearGreedIndex} />
            <div className="mt-4 text-center terminal-text text-xs text-[var(--muted-foreground)]">
              更新时间: {marketSignal.lastUpdated}
            </div>
          </div>

          {/* Bull/Bear Probability */}
          <div className="cyber-panel p-6">
            <div className="terminal-text text-xs text-[var(--neon)] mb-4">// BULL_BEAR_PROBABILITY</div>
            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="text-center">
                <div className="font-['JetBrains_Mono'] text-4xl font-bold bull-color">{marketSignal.bullProbability}%</div>
                <div className="terminal-text text-xs text-[var(--neon)] mt-1">🐂 多头</div>
              </div>
              <div className="text-center text-[var(--muted-foreground)] terminal-text text-lg">VS</div>
              <div className="text-center">
                <div className="font-['JetBrains_Mono'] text-4xl font-bold bear-color">{marketSignal.bearProbability}%</div>
                <div className="terminal-text text-xs text-[var(--cyber-red)] mt-1">🐻 空头</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="relative h-4 bg-[var(--panel-bg)] border border-[var(--panel-border)] overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full transition-all duration-1000"
                style={{ width: `${marketSignal.bullProbability}%`, background: "var(--neon)" }}
              />
              <div
                className="absolute right-0 top-0 h-full transition-all duration-1000"
                style={{ width: `${marketSignal.bearProbability}%`, background: "var(--cyber-red)" }}
              />
            </div>
            <div className="flex justify-between terminal-text text-xs mt-1">
              <span className="bull-color">多头 {marketSignal.bullProbability}%</span>
              <span className="bear-color">空头 {marketSignal.bearProbability}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Fear/Greed History */}
          <div className="cyber-panel p-4">
            <div className="terminal-text text-xs text-[var(--neon)] mb-4">// FEAR_GREED_7D_HISTORY</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={fearGreedHistory}>
                <defs>
                  <linearGradient id="fgiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--panel-bg)", border: "1px solid var(--panel-border)", fontFamily: "monospace", fontSize: 11 }}
                  labelStyle={{ color: "var(--neon)" }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Area type="monotone" dataKey="value" stroke="#00FF88" strokeWidth={2} fill="url(#fgiGrad)" dot={{ fill: "#00FF88", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bull/Bear History */}
          <div className="cyber-panel p-4">
            <div className="terminal-text text-xs text-[var(--neon)] mb-4">// BULL_BEAR_7D_TREND</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={bullBearHistory} barGap={2}>
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--panel-bg)", border: "1px solid var(--panel-border)", fontFamily: "monospace", fontSize: 11 }}
                  labelStyle={{ color: "var(--neon)" }}
                />
                <Bar dataKey="bull" fill="#00FF88" opacity={0.8} radius={[2, 2, 0, 0]} name="多头%" />
                <Bar dataKey="bear" fill="#FF3366" opacity={0.8} radius={[2, 2, 0, 0]} name="空头%" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crypto Prices */}
        <div className="cyber-panel p-4 mb-6">
          <div className="terminal-text text-xs text-[var(--neon)] mb-4">// CRYPTO_PRICE_FEED</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {cryptoPrices.map(({ name, price, change, color }) => (
              <div key={name} className="neon-card p-3 text-center">
                <div className="terminal-text text-xs font-bold mb-1" style={{ color }}>{name}</div>
                <div className="font-['JetBrains_Mono'] text-sm font-bold text-[var(--foreground)]">
                  ${price.toLocaleString()}
                </div>
                <div className={`terminal-text text-xs mt-0.5 ${change >= 0 ? "bull-color" : "bear-color"}`}>
                  {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div className="cyber-panel p-4">
          <div className="terminal-text text-xs text-[var(--neon)] mb-4">// SENTIMENT_ANALYSIS</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sentimentData.map(({ name, value, color }) => (
              <div key={name} className="text-center">
                <GaugeChart value={value} label={name} color={color} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
