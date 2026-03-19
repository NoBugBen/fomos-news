// ============================================================
// FOMOS NEWS — Sample Data
// All data is for demonstration purposes
// ============================================================

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: 'ai-trend' | 'product-insight' | 'crypto' | 'trading-agent' | 'global';
  source: string;
  sourceUrl: string;
  date: string;
  stars: number; // 1-5
  tags: string[];
  isHot?: boolean;
}

export interface BriefingItem {
  id: string;
  rank: number;
  title: string;
  company: string;
  date: string;
  summary: string;
  source: string;
  stars: number;
  category: string;
}

export interface DailyBriefing {
  date: string;
  sections: {
    title: string;
    emoji: string;
    items: BriefingItem[];
  }[];
  analysis: {
    trend: string;
    competition: string;
    demand: string;
  };
}

export interface LeaderboardItem {
  rank: number;
  name: string;
  company: string;
  score: number;
  change: number; // rank change
  tags: string[];
  description: string;
  isNew?: boolean;
}

export interface EcosystemNode {
  id: string;
  name: string;
  category: 'foundation' | 'infrastructure' | 'application' | 'defi' | 'data';
  description: string;
  connections: string[];
  size: 'large' | 'medium' | 'small';
  status: 'active' | 'emerging' | 'stable';
}

export interface MarketSignal {
  bullProbability: number; // 0-100
  bearProbability: number;
  fearGreedIndex: number; // 0-100
  fearGreedLabel: string;
  aiSentiment: number; // 0-100
  cryptoSentiment: number;
  btcDominance: number;
  lastUpdated: string;
}

// ── News Items ──
export const newsItems: NewsItem[] = [
  {
    id: 'n001',
    title: 'Anthropic 推出 Claude Enterprise Agents，覆盖财务、工程和设计领域',
    summary: 'Anthropic 正式推出企业级 Agent 计划，包含财务分析、工程代码审查和设计辅助三大专属插件，支持企业私有化部署。',
    category: 'product-insight',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com',
    date: '2026-03-03',
    stars: 5,
    tags: ['Claude', 'Enterprise', 'Agent'],
    isHot: true,
  },
  {
    id: 'n002',
    title: 'Nimble 完成 4700 万美元 B 轮融资，AI Agent 实时验证网络数据',
    summary: '数据智能公司 Nimble 宣布完成 4700 万美元 B 轮融资，其 AI Agent 能够实时搜索、验证网络数据并结构化输出，客户包括多家顶级对冲基金。',
    category: 'product-insight',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com',
    date: '2026-03-03',
    stars: 4,
    tags: ['数据', 'Agent', '融资'],
    isHot: true,
  },
  {
    id: 'n003',
    title: 'OpenAI 发布 GPT-5 Turbo，推理速度提升 3 倍，成本降低 60%',
    summary: 'OpenAI 正式发布 GPT-5 Turbo 模型，在保持 GPT-5 能力的同时大幅提升推理速度，API 调用成本降低 60%，将加速 Agent 应用落地。',
    category: 'ai-trend',
    source: 'OpenAI Blog',
    sourceUrl: 'https://openai.com',
    date: '2026-03-02',
    stars: 5,
    tags: ['GPT-5', 'OpenAI', '推理'],
    isHot: true,
  },
  {
    id: 'n004',
    title: 'Coinbase 推出 AI 驱动的智能交易 Agent，支持自然语言下单',
    summary: 'Coinbase 发布 AI Trading Agent，用户可通过自然语言指令完成复杂的加密货币交易策略，支持止盈止损、网格交易等高级功能。',
    category: 'trading-agent',
    source: 'CoinDesk',
    sourceUrl: 'https://coindesk.com',
    date: '2026-03-02',
    stars: 5,
    tags: ['Coinbase', 'Trading', 'DeFi'],
    isHot: true,
  },
  {
    id: 'n005',
    title: 'Google DeepMind 发布 Gemini Ultra 2.0，多模态推理能力大幅跃升',
    summary: 'Google DeepMind 发布 Gemini Ultra 2.0，在数学推理、代码生成和多模态理解方面均超越前代，MMLU 评分达到 92.3%。',
    category: 'ai-trend',
    source: 'The Verge',
    sourceUrl: 'https://theverge.com',
    date: '2026-03-01',
    stars: 4,
    tags: ['Gemini', 'Google', '多模态'],
  },
  {
    id: 'n006',
    title: 'Bitcoin 突破 12 万美元，机构 AI 交易 Agent 被认为是主要推手',
    summary: 'BTC 价格突破 12 万美元历史新高，分析师指出机构级 AI 交易 Agent 的大规模部署是本轮上涨的重要驱动因素。',
    category: 'crypto',
    source: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com',
    date: '2026-03-01',
    stars: 5,
    tags: ['BTC', '机构', '价格'],
    isHot: true,
  },
  {
    id: 'n007',
    title: 'Perplexity AI 完成 5 亿美元融资，估值达 90 亿美元',
    summary: 'AI 搜索公司 Perplexity 完成新一轮 5 亿美元融资，估值达 90 亿美元，将用于扩展 AI Agent 搜索能力和全球市场拓展。',
    category: 'product-insight',
    source: 'Reuters',
    sourceUrl: 'https://reuters.com',
    date: '2026-02-28',
    stars: 4,
    tags: ['Perplexity', '搜索', '融资'],
  },
  {
    id: 'n008',
    title: 'Ethereum Layer 2 总 TVL 突破 1000 亿美元，AI Agent 驱动 DeFi 新浪潮',
    summary: 'Ethereum Layer 2 生态系统总锁仓量（TVL）首次突破 1000 亿美元，AI Agent 自动化 DeFi 策略被认为是关键催化剂。',
    category: 'crypto',
    source: 'DeFiLlama',
    sourceUrl: 'https://defillama.com',
    date: '2026-02-28',
    stars: 4,
    tags: ['ETH', 'L2', 'DeFi', 'TVL'],
  },
  {
    id: 'n009',
    title: 'Microsoft Copilot 新增金融 Agent 模块，直接对接 Bloomberg 数据',
    summary: 'Microsoft 宣布 Copilot 金融版正式接入 Bloomberg Terminal 数据，企业用户可通过自然语言查询实时市场数据并生成投资报告。',
    category: 'product-insight',
    source: 'WSJ',
    sourceUrl: 'https://wsj.com',
    date: '2026-02-27',
    stars: 4,
    tags: ['Microsoft', 'Copilot', 'Bloomberg'],
  },
  {
    id: 'n010',
    title: 'Solana 生态 AI Agent 协议 Eliza 日活突破 100 万，成为最大 Agent 平台',
    summary: 'Solana 生态的 AI Agent 协议 Eliza 日活用户突破 100 万，成为全球最大的去中心化 Agent 运行平台，原生代币 $ELIZA 单日涨幅 45%。',
    category: 'trading-agent',
    source: 'CoinTelegraph',
    sourceUrl: 'https://cointelegraph.com',
    date: '2026-02-27',
    stars: 5,
    tags: ['Solana', 'Eliza', 'AgentFi'],
    isHot: true,
  },
  {
    id: 'n011',
    title: '全球 AI 芯片短缺加剧，NVIDIA H200 交货期延至 2027 年',
    summary: '受 AI Agent 大规模部署需求激增影响，NVIDIA H200 GPU 交货期已延至 2027 年第一季度，AMD 和 Intel 趁机加速推进替代方案。',
    category: 'global',
    source: 'FT',
    sourceUrl: 'https://ft.com',
    date: '2026-02-26',
    stars: 3,
    tags: ['NVIDIA', '芯片', '供应链'],
  },
  {
    id: 'n012',
    title: 'SEC 发布 AI 交易 Agent 监管框架草案，要求透明度和可解释性',
    summary: 'SEC 发布针对 AI 驱动交易 Agent 的监管框架草案，要求所有使用 AI Agent 的金融机构提供决策透明度报告和可解释性文档。',
    category: 'global',
    source: 'Reuters',
    sourceUrl: 'https://reuters.com',
    date: '2026-02-25',
    stars: 3,
    tags: ['SEC', '监管', '合规'],
  },
];

// ── Daily Briefing ──
export const dailyBriefing: DailyBriefing = {
  date: '2026年3月3日',
  sections: [
    {
      title: '通用 Agent 产品',
      emoji: '🌐',
      items: [
        {
          id: 'b001',
          rank: 1,
          title: 'Claude Enterprise Agents',
          company: 'Anthropic',
          date: '03-03',
          summary: 'Anthropic 推出企业 Agent 计划，包含财务、工程和设计的专属插件，支持私有化部署与自定义工作流。',
          source: 'TechCrunch',
          stars: 5,
          category: '通用 Agent',
        },
        {
          id: 'b002',
          rank: 2,
          title: 'Nimble Data Agent',
          company: 'Nimble',
          date: '03-03',
          summary: '筹集 4700 万美元 B 轮融资，用 AI Agent 实时搜索验证网络数据并结构化输出，主打金融数据场景。',
          source: 'TechCrunch',
          stars: 4,
          category: '通用 Agent',
        },
        {
          id: 'b003',
          rank: 3,
          title: 'Perplexity Pro Agent',
          company: 'Perplexity AI',
          date: '02-28',
          summary: '完成 5 亿美元融资，估值 90 亿美元，新增 Agent 模式支持多步骤研究任务自动化执行。',
          source: 'Reuters',
          stars: 4,
          category: '通用 Agent',
        },
      ],
    },
    {
      title: 'TradingAgent & AgentFi 产品和融资动态',
      emoji: '📈',
      items: [
        {
          id: 'b004',
          rank: 1,
          title: 'Coinbase AI Trading Agent',
          company: 'Coinbase',
          date: '03-02',
          summary: '推出自然语言驱动的智能交易 Agent，支持止盈止损、网格交易等策略，已有 10 万用户测试。',
          source: 'CoinDesk',
          stars: 5,
          category: 'TradingAgent',
        },
        {
          id: 'b005',
          rank: 2,
          title: 'Eliza Protocol v2',
          company: 'ai16z',
          date: '02-27',
          summary: 'Solana 生态最大 Agent 平台日活突破 100 万，v2 版本支持跨链 Agent 部署，$ELIZA 单日涨 45%。',
          source: 'CoinTelegraph',
          stars: 5,
          category: 'AgentFi',
        },
        {
          id: 'b006',
          rank: 3,
          title: 'Gauntlet DeFi Agent',
          company: 'Gauntlet',
          date: '02-26',
          summary: '完成 3200 万美元融资，AI Agent 自动优化 DeFi 协议参数，已管理超过 50 亿美元资产。',
          source: 'The Block',
          stars: 4,
          category: 'AgentFi',
        },
      ],
    },
    {
      title: 'AI 基础模型动态',
      emoji: '🧠',
      items: [
        {
          id: 'b007',
          rank: 1,
          title: 'GPT-5 Turbo',
          company: 'OpenAI',
          date: '03-02',
          summary: '推理速度提升 3 倍，成本降低 60%，API 上线即成为最受欢迎的 Agent 底座模型。',
          source: 'OpenAI Blog',
          stars: 5,
          category: '基础模型',
        },
        {
          id: 'b008',
          rank: 2,
          title: 'Gemini Ultra 2.0',
          company: 'Google DeepMind',
          date: '03-01',
          summary: 'MMLU 评分 92.3%，多模态推理能力大幅提升，金融文档分析场景表现突出。',
          source: 'The Verge',
          stars: 4,
          category: '基础模型',
        },
      ],
    },
  ],
  analysis: {
    trend: 'AI Agent 正在从通用助手向垂直领域专家快速演进，金融、法律、医疗三大高价值场景成为融资热点，企业级部署需求爆发。',
    competition: 'Anthropic 与 OpenAI 在企业 Agent 市场展开正面竞争，Google 凭借 Workspace 生态优势切入，微软通过 Copilot 深度绑定企业客户。',
    demand: '机构投资者对 AI Trading Agent 需求激增，合规性和可解释性成为采购关键指标，SEC 监管框架落地将加速市场洗牌。',
  },
};

// ── Leaderboards ──
export const aiModelRankings: LeaderboardItem[] = [
  { rank: 1, name: 'GPT-5 Turbo', company: 'OpenAI', score: 96.8, change: 0, tags: ['推理', '代码', '多模态'], description: '最强综合能力，成本大幅降低' },
  { rank: 2, name: 'Claude 3.7 Sonnet', company: 'Anthropic', score: 95.2, change: 1, tags: ['安全', '长文本', '企业'], description: '企业场景首选，安全性领先' },
  { rank: 3, name: 'Gemini Ultra 2.0', company: 'Google', score: 94.1, change: -1, tags: ['多模态', '搜索', '代码'], description: '多模态理解能力突出' },
  { rank: 4, name: 'Llama 4 405B', company: 'Meta', score: 91.5, change: 2, tags: ['开源', '本地部署', '微调'], description: '最强开源模型，支持私有化', isNew: true },
  { rank: 5, name: 'Grok 3', company: 'xAI', score: 89.3, change: 0, tags: ['实时', 'X数据', '推理'], description: '实时数据接入，推理能力强' },
  { rank: 6, name: 'Mistral Large 3', company: 'Mistral AI', score: 87.6, change: 1, tags: ['欧洲', '开源', '效率'], description: '欧洲最强，效率比极高' },
  { rank: 7, name: 'Command R+', company: 'Cohere', score: 85.4, change: -2, tags: ['企业', 'RAG', '检索'], description: '企业 RAG 场景专精' },
  { rank: 8, name: 'Qwen 3 Max', company: 'Alibaba', score: 84.1, change: 3, tags: ['中文', '多语言', '代码'], description: '中文最强，多语言能力出色', isNew: true },
];

export const agentRankings: LeaderboardItem[] = [
  { rank: 1, name: 'Claude Enterprise Agents', company: 'Anthropic', score: 94.5, change: 2, tags: ['企业', '多域', '安全'], description: '企业级 Agent 综合能力第一' },
  { rank: 2, name: 'AutoGPT Pro', company: 'Significant Gravitas', score: 91.2, change: 0, tags: ['自主', '工具调用', '开源'], description: '最成熟的自主 Agent 框架' },
  { rank: 3, name: 'Devin 2.0', company: 'Cognition AI', score: 90.8, change: 1, tags: ['代码', '工程', '自主'], description: 'AI 软件工程师，代码能力顶尖' },
  { rank: 4, name: 'Eliza Protocol', company: 'ai16z', score: 88.6, change: 5, tags: ['Web3', '去中心化', '多链'], description: '最大去中心化 Agent 平台', isNew: true },
  { rank: 5, name: 'LangGraph Cloud', company: 'LangChain', score: 87.3, change: -1, tags: ['工作流', '编排', '企业'], description: 'Agent 工作流编排领导者' },
  { rank: 6, name: 'CrewAI Enterprise', company: 'CrewAI', score: 85.9, change: 0, tags: ['多 Agent', '协作', '企业'], description: '多 Agent 协作框架标杆' },
  { rank: 7, name: 'Perplexity Agent', company: 'Perplexity AI', score: 84.2, change: 2, tags: ['搜索', '研究', '实时'], description: '研究型 Agent 首选' },
  { rank: 8, name: 'Microsoft Copilot Agent', company: 'Microsoft', score: 82.7, change: -2, tags: ['Office', '企业', '集成'], description: 'Office 生态深度集成' },
];

export const tradingAgentRankings: LeaderboardItem[] = [
  { rank: 1, name: 'Coinbase AI Agent', company: 'Coinbase', score: 93.1, change: 3, tags: ['CEX', '自然语言', '合规'], description: '最大合规交易所原生 Agent', isNew: true },
  { rank: 2, name: 'Gauntlet DeFi Agent', company: 'Gauntlet', score: 91.8, change: 0, tags: ['DeFi', '风控', '优化'], description: '管理 50 亿美元 DeFi 资产' },
  { rank: 3, name: 'Eliza Trading Module', company: 'ai16z', score: 90.4, change: 4, tags: ['Solana', '链上', 'AgentFi'], description: '链上 Agent 交易量第一' },
  { rank: 4, name: 'Numerai Signals AI', company: 'Numerai', score: 88.9, change: -1, tags: ['量化', '众包', '对冲'], description: '去中心化量化对冲基金' },
  { rank: 5, name: 'Paradigm Alpha Agent', company: 'Paradigm', score: 87.5, change: 0, tags: ['机构', '衍生品', '做市'], description: '机构级衍生品做市 Agent' },
  { rank: 6, name: 'dYdX AI Trader', company: 'dYdX', score: 85.3, change: 1, tags: ['永续', '去中心化', '高频'], description: '去中心化永续合约 Agent' },
  { rank: 7, name: 'Wintermute AI', company: 'Wintermute', score: 84.1, change: -2, tags: ['做市', '机构', '多链'], description: '顶级做市商 AI 系统' },
  { rank: 8, name: 'Fomos TradingAgent', company: 'Fomos', score: 82.6, change: 6, tags: ['金融智能体', '决策', '洞察'], description: '金融决策智能体新锐', isNew: true },
];

// ── Ecosystem Nodes ──
export const ecosystemNodes: EcosystemNode[] = [
  { id: 'openai', name: 'OpenAI', category: 'foundation', description: 'GPT-5 系列基础模型', connections: ['langchain', 'autogpt', 'copilot'], size: 'large', status: 'active' },
  { id: 'anthropic', name: 'Anthropic', category: 'foundation', description: 'Claude 系列安全 AI', connections: ['langchain', 'enterprise-agents'], size: 'large', status: 'active' },
  { id: 'google', name: 'Google DeepMind', category: 'foundation', description: 'Gemini 多模态模型', connections: ['langchain', 'vertex-ai'], size: 'large', status: 'active' },
  { id: 'meta', name: 'Meta AI', category: 'foundation', description: 'Llama 开源模型系列', connections: ['langchain', 'local-deploy'], size: 'large', status: 'active' },
  { id: 'langchain', name: 'LangChain', category: 'infrastructure', description: 'Agent 开发框架', connections: ['openai', 'anthropic', 'google', 'pinecone'], size: 'large', status: 'active' },
  { id: 'autogpt', name: 'AutoGPT', category: 'application', description: '自主 Agent 平台', connections: ['openai', 'langchain'], size: 'medium', status: 'active' },
  { id: 'devin', name: 'Devin', category: 'application', description: 'AI 软件工程师', connections: ['anthropic', 'langchain'], size: 'medium', status: 'active' },
  { id: 'eliza', name: 'Eliza Protocol', category: 'defi', description: '去中心化 Agent 平台', connections: ['solana', 'langchain'], size: 'large', status: 'active' },
  { id: 'solana', name: 'Solana', category: 'infrastructure', description: '高性能区块链', connections: ['eliza', 'jupiter', 'drift'], size: 'large', status: 'active' },
  { id: 'ethereum', name: 'Ethereum', category: 'infrastructure', description: '智能合约平台', connections: ['uniswap', 'aave', 'gauntlet'], size: 'large', status: 'stable' },
  { id: 'uniswap', name: 'Uniswap', category: 'defi', description: '去中心化交易所', connections: ['ethereum', 'gauntlet'], size: 'medium', status: 'stable' },
  { id: 'gauntlet', name: 'Gauntlet', category: 'defi', description: 'DeFi 风险管理 Agent', connections: ['ethereum', 'uniswap', 'aave'], size: 'medium', status: 'active' },
  { id: 'aave', name: 'Aave', category: 'defi', description: '去中心化借贷协议', connections: ['ethereum', 'gauntlet'], size: 'medium', status: 'stable' },
  { id: 'pinecone', name: 'Pinecone', category: 'data', description: '向量数据库', connections: ['langchain', 'openai'], size: 'small', status: 'active' },
  { id: 'copilot', name: 'Microsoft Copilot', category: 'application', description: '企业 AI 助手', connections: ['openai', 'azure'], size: 'large', status: 'active' },
  { id: 'vertex-ai', name: 'Vertex AI', category: 'infrastructure', description: 'Google Cloud AI 平台', connections: ['google', 'langchain'], size: 'medium', status: 'active' },
  { id: 'azure', name: 'Azure AI', category: 'infrastructure', description: 'Microsoft AI 云平台', connections: ['openai', 'copilot'], size: 'large', status: 'stable' },
  { id: 'perplexity', name: 'Perplexity AI', category: 'application', description: 'AI 搜索引擎', connections: ['openai', 'anthropic'], size: 'medium', status: 'active' },
  { id: 'fomos', name: 'Fomos', category: 'application', description: '金融智能体 SaaS', connections: ['openai', 'anthropic', 'eliza'], size: 'medium', status: 'emerging' },
  { id: 'jupiter', name: 'Jupiter', category: 'defi', description: 'Solana DEX 聚合器', connections: ['solana', 'eliza'], size: 'small', status: 'active' },
  { id: 'drift', name: 'Drift Protocol', category: 'defi', description: 'Solana 永续合约', connections: ['solana', 'eliza'], size: 'small', status: 'active' },
  { id: 'local-deploy', name: 'Local Deploy', category: 'infrastructure', description: '私有化部署方案', connections: ['meta', 'langchain'], size: 'small', status: 'emerging' },
  { id: 'enterprise-agents', name: 'Enterprise Agents', category: 'application', description: '企业级 Agent 套件', connections: ['anthropic', 'langchain'], size: 'medium', status: 'emerging' },
];

// ── Market Signal ──
export const marketSignal: MarketSignal = {
  bullProbability: 68,
  bearProbability: 32,
  fearGreedIndex: 72,
  fearGreedLabel: '贪婪',
  aiSentiment: 81,
  cryptoSentiment: 67,
  btcDominance: 54.3,
  lastUpdated: '2026-03-03 10:00 UTC+8',
};

// ── Category Labels ──
export const categoryLabels: Record<string, string> = {
  'ai-trend': 'AI 趋势',
  'product-insight': '产品洞察',
  'crypto': '加密货币',
  'trading-agent': 'TradingAgent',
  'global': '全球动态',
};

export const categoryColors: Record<string, string> = {
  'ai-trend': 'text-[var(--cyber-blue)]',
  'product-insight': 'text-[var(--neon)]',
  'crypto': 'text-[var(--cyber-orange)]',
  'trading-agent': 'text-purple-400',
  'global': 'text-[var(--muted-foreground)]',
};
