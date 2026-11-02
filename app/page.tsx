"use client";

import { useMemo, useState } from "react";
import researchDataJson from "../source-data/processed/research-data.json";

type Position = {
  rank: number;
  code: string;
  name: string;
  kind: string;
  weight: number;
  marketValueWan: number;
};

type BondCategories = {
  national: number;
  centralBank: number;
  financial: number;
  policy: number;
  corporate: number;
  shortFinancing: number;
  mediumNotes: number;
  convertible: number;
  interbankCD: number;
  otherBond: number;
  bondTotal: number;
};

type CashSnapshot = {
  bankCashAmount: number;
  bankCashWeight: number;
  reverseRepoAmount: number;
  reverseRepoWeight: number;
  otherAssetsAmount: number;
  otherAssetsWeight: number;
};

type Snapshot = {
  label: string;
  date: string;
  quarterReturn: number;
  oneYearReturn: number;
  stock: number;
  note: string;
  netAssets: number;
  nav: number;
  categories: BondCategories;
  cash: CashSnapshot;
  topBonds: Position[];
  convertibles: Position[];
  stocks: Position[];
  disclosureNote?: string;
  sources: {
    reportPath: string;
    reportUrl: string;
    officialUrl?: string;
    bondApiPath: string;
    bondApiUrl: string;
    stockApiPath: string;
    stockApiUrl: string;
  };
};

type Fund = {
  id: "ef" | "wl" | "bo";
  code: string;
  shortName: string;
  name: string;
  manager: string;
  benchmark: string;
  benchmarkNote?: string;
  strategy: string;
  color: string;
  latest: {
    quarter: number;
    sixMonth: number;
    oneYear: number;
    threeYear: number;
    fiveYear: number;
    volatility: number;
    benchmarkQuarter: number;
  };
  snapshots: Snapshot[];
};

type ResearchData = {
  generatedAt: string;
  period: string;
  quarters: string[];
  coverage: {
    reports: number;
    funds: number;
    quarters: number;
    bondDisclosure: string;
    stockDisclosure: string;
    cashDisclosure: string;
  };
  funds: Fund[];
};

type AssetView = "overview" | "bond" | "convertible" | "stock" | "cash";

type ComparedPosition = Position & {
  previousWeight: number | null;
  delta: number | null;
  status: "新增披露" | "增加" | "减少" | "持平" | "本季未列示";
};

const researchData = researchDataJson as ResearchData;
const funds = researchData.funds;
const quarters = researchData.quarters;
const latestQuarter = quarters.at(-1)!;
const latestDate = funds[0].snapshots.at(-1)!.date;
const repositoryBase = "https://github.com/AZhengXing/fixed-income-plus";
const totalConvertibleRows = funds.reduce(
  (total, fund) => total + fund.snapshots.reduce((subtotal, snapshot) => subtotal + snapshot.convertibles.length, 0),
  0,
);

const assetViewLabels: Record<AssetView, string> = {
  overview: "季度总览",
  bond: "债券",
  convertible: "可转债",
  stock: "股票",
  cash: "现金",
};

function formatPercent(value: number, withPlus = false, digits = 2) {
  const sign = withPlus && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

function formatYi(value: number) {
  return `${(value / 100_000_000).toFixed(2)} 亿元`;
}

function repoFileUrl(path: string) {
  return `${repositoryBase}/blob/main/${path}`;
}

function Delta({ value, baseline = false }: { value: number | null; baseline?: boolean }) {
  if (baseline || value === null) return <span className="delta neutral">基准期</span>;
  if (Math.abs(value) < 0.005) return <span className="delta neutral">持平</span>;
  return <span className={`delta ${value > 0 ? "up" : "down"}`}>{formatPercent(value, true)}</span>;
}

function buildCumulative(fund: Fund) {
  return fund.snapshots.reduce<number[]>((values, snapshot) => {
    values.push(values.at(-1)! * (1 + snapshot.quarterReturn / 100));
    return values;
  }, [100]);
}

function TrendChart() {
  const width = 700;
  const height = 260;
  const padding = { left: 46, right: 28, top: 24, bottom: 38 };
  const series = funds.map((fund) => ({ fund, values: buildCumulative(fund) }));
  const allValues = series.flatMap((item) => item.values);
  const min = Math.floor(Math.min(...allValues)) - 1;
  const max = Math.ceil(Math.max(...allValues)) + 1;
  const labels = ["25-03", ...quarters.map((quarter) => {
    const item = funds[0].snapshots.find((snapshot) => snapshot.label === quarter)!;
    return item.date.slice(2, 7);
  })];
  const x = (index: number) => padding.left + (index / (labels.length - 1)) * (width - padding.left - padding.right);
  const y = (value: number) => padding.top + ((max - value) / (max - min)) * (height - padding.top - padding.bottom);
  const ticks = Array.from({ length: 4 }, (_, index) => min + ((max - min) / 3) * index);

  return (
    <div className="trend-chart" role="img" aria-label="三只基金跟踪期复合净值指数">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} className="grid-line" />
            <text x={padding.left - 10} y={y(tick) + 4} textAnchor="end" className="axis-label">{tick.toFixed(0)}</text>
          </g>
        ))}
        {labels.map((label, index) => (
          <text key={label} x={x(index)} y={height - 10} textAnchor="middle" className="axis-label">{label}</text>
        ))}
        {series.map(({ fund, values }) => {
          const points = values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
          return (
            <g key={fund.id}>
              <polyline points={points} fill="none" stroke={fund.color} strokeWidth="3" vectorEffect="non-scaling-stroke" />
              <circle cx={x(values.length - 1)} cy={y(values.at(-1)!)} r="4" fill={fund.color} />
            </g>
          );
        })}
      </svg>
      <div className="chart-legend">
        {series.map(({ fund, values }) => (
          <span key={fund.id}><i style={{ background: fund.color }} />{fund.shortName}<b>{formatPercent(values.at(-1)! - 100, true)}</b></span>
        ))}
      </div>
    </div>
  );
}

function exposureRows(snapshot: Snapshot) {
  const categories = snapshot.categories;
  return [
    { key: "bondTotal", label: "债券合计", value: categories.bondTotal, group: "total" },
    { key: "policy", label: "政策性金融债", value: categories.policy, group: "rate" },
    { key: "financialOther", label: "其他金融债", value: categories.financial - categories.policy, group: "credit" },
    { key: "corporate", label: "企业债", value: categories.corporate, group: "credit" },
    { key: "shortFinancing", label: "短期融资券", value: categories.shortFinancing, group: "credit" },
    { key: "mediumNotes", label: "中期票据", value: categories.mediumNotes, group: "credit" },
    { key: "national", label: "国债", value: categories.national, group: "rate" },
    { key: "interbankCD", label: "同业存单", value: categories.interbankCD, group: "cashlike" },
    { key: "convertible", label: "可转债 / 可交换债", value: categories.convertible, group: "risk" },
    { key: "stock", label: "股票", value: snapshot.stock, group: "risk" },
    { key: "bankCash", label: "银行存款及结算备付金", value: snapshot.cash.bankCashWeight, group: "cashlike" },
  ];
}

function ExposureTable({ snapshot, previous }: { snapshot: Snapshot; previous: Snapshot | null }) {
  const currentRows = exposureRows(snapshot);
  const previousMap = new Map((previous ? exposureRows(previous) : []).map((row) => [row.key, row.value]));
  return (
    <div className="exposure-table">
      <div className="exposure-head"><span>资产类别</span><span>本季</span><span>环比</span><span>占净资产</span></div>
      {currentRows.map((row) => {
        const previousValue = previousMap.get(row.key);
        const delta = previousValue === undefined ? null : row.value - previousValue;
        return (
          <div className="exposure-row" key={row.key}>
            <span className="exposure-name"><i className={`asset-dot ${row.group}`} />{row.label}</span>
            <strong>{formatPercent(row.value)}</strong>
            <Delta value={delta} baseline={!previous} />
            <span className="bar-track"><i style={{ width: `${Math.min(100, row.value / 1.3)}%` }} /></span>
          </div>
        );
      })}
      <p>分类采用非重复口径：“其他金融债”已扣除政策性金融债；可转债包含在债券合计中，不能与债券合计相加。</p>
    </div>
  );
}

function positionComparison(current: Position[], previous: Position[]): ComparedPosition[] {
  const currentMap = new Map(current.map((position) => [position.code, position]));
  const previousMap = new Map(previous.map((position) => [position.code, position]));
  const rows: ComparedPosition[] = current.map((position) => {
    const prior = previousMap.get(position.code);
    if (!prior) return { ...position, previousWeight: null, delta: null, status: "新增披露" };
    const delta = position.weight - prior.weight;
    const status = Math.abs(delta) < 0.005 ? "持平" : delta > 0 ? "增加" : "减少";
    return { ...position, previousWeight: prior.weight, delta, status };
  });
  previous.forEach((position) => {
    if (!currentMap.has(position.code)) {
      rows.push({ ...position, rank: 999, weight: 0, previousWeight: position.weight, delta: -position.weight, status: "本季未列示" });
    }
  });
  return rows.sort((a, b) => b.weight - a.weight || (b.previousWeight ?? 0) - (a.previousWeight ?? 0));
}

function PositionTable({
  current,
  previous,
  assetClass,
  query,
  showAll,
}: {
  current: Position[];
  previous: Position[];
  assetClass: "bond" | "convertible" | "stock";
  query: string;
  showAll: boolean;
}) {
  const rows = useMemo(() => positionComparison(current, previous), [current, previous]);
  const filtered = rows.filter((row) => `${row.code}${row.name}${row.kind}`.toLowerCase().includes(query.toLowerCase()));
  const visible = assetClass === "convertible" && !showAll && !query ? filtered.slice(0, 20) : filtered;
  const emptyCopy = assetClass === "stock" ? "本季度报告未披露股票持仓。" : "本季度没有相应披露记录。";

  if (!rows.length) return <div className="empty-state">{emptyCopy}</div>;
  return (
    <div className="position-table-wrap">
      <table className="position-table">
        <thead><tr><th>证券</th><th>分类</th><th>本季权重</th><th>上季权重</th><th>环比</th><th>披露状态</th></tr></thead>
        <tbody>
          {visible.map((row) => (
            <tr key={`${row.code}-${row.status}`} className={row.status === "本季未列示" ? "not-listed" : ""}>
              <td><b>{row.name}</b><small>{row.code}</small></td>
              <td><span className="kind-chip">{row.kind}</span></td>
              <td>{formatPercent(row.weight)}</td>
              <td>{row.previousWeight === null ? "—" : formatPercent(row.previousWeight)}</td>
              <td><Delta value={row.delta} /></td>
              <td><span className={`status status-${row.status}`}>{row.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!visible.length && <div className="empty-state">没有匹配的持仓。</div>}
    </div>
  );
}

function PositionSummary({ current, previous, total, label }: { current: Position[]; previous: Position[]; total: number; label: string }) {
  const currentWeight = current.reduce((sum, item) => sum + item.weight, 0);
  const compared = positionComparison(current, previous);
  const added = compared.filter((item) => item.status === "新增披露").length;
  const missing = compared.filter((item) => item.status === "本季未列示").length;
  return (
    <div className="position-summary">
      <div><small>本季列示</small><strong>{current.length} 项</strong></div>
      <div><small>列示权重合计</small><strong>{formatPercent(currentWeight)}</strong></div>
      <div><small>{label}覆盖</small><strong>{total > 0 ? formatPercent((currentWeight / total) * 100, false, 0) : "—"}</strong></div>
      <div><small>新增 / 未再列示</small><strong>{added} / {missing}</strong></div>
    </div>
  );
}

function ChangeBrief({ snapshot, previous }: { snapshot: Snapshot; previous: Snapshot | null }) {
  if (!previous) return <div className="change-brief baseline"><strong>区间起点</strong><p>2025Q2 是当前跟踪窗口的基准期，暂无上季可比数据。</p></div>;
  const previousMap = new Map(exposureRows(previous).map((row) => [row.key, row]));
  const changes = exposureRows(snapshot)
    .filter((row) => row.key !== "bondTotal")
    .map((row) => ({ ...row, delta: row.value - (previousMap.get(row.key)?.value ?? 0) }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 4);
  return (
    <div className="change-brief">
      <div className="brief-title"><strong>本季主要变动</strong><span>{previous.label} → {snapshot.label}</span></div>
      <div className="change-list">
        {changes.map((item) => <span key={item.key}><b>{item.label}</b><Delta value={item.delta} /></span>)}
      </div>
    </div>
  );
}

function HistoryTable({ fund, selectedQuarter, onSelect }: { fund: Fund; selectedQuarter: string; onSelect: (quarter: string) => void }) {
  return (
    <div className="history-table-wrap">
      <table className="history-table">
        <thead><tr><th>季度</th><th>季度收益</th><th>债券</th><th>政策金融债</th><th>企业债</th><th>中票</th><th>可转债</th><th>股票</th><th>现金</th></tr></thead>
        <tbody>
          {fund.snapshots.map((item) => (
            <tr key={item.label} className={item.label === selectedQuarter ? "selected" : ""} onClick={() => onSelect(item.label)}>
              <td><button>{item.label}</button></td>
              <td className={item.quarterReturn < 0 ? "negative" : "positive"}>{formatPercent(item.quarterReturn, true)}</td>
              <td>{formatPercent(item.categories.bondTotal)}</td>
              <td>{formatPercent(item.categories.policy)}</td>
              <td>{formatPercent(item.categories.corporate)}</td>
              <td>{formatPercent(item.categories.mediumNotes)}</td>
              <td>{formatPercent(item.categories.convertible)}</td>
              <td>{formatPercent(item.stock)}</td>
              <td>{formatPercent(item.cash.bankCashWeight)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Home() {
  const [selectedFundId, setSelectedFundId] = useState<Fund["id"]>("ef");
  const [selectedQuarter, setSelectedQuarter] = useState(latestQuarter);
  const [assetView, setAssetView] = useState<AssetView>("overview");
  const [positionQuery, setPositionQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const fund = useMemo(() => funds.find((item) => item.id === selectedFundId)!, [selectedFundId]);
  const snapshotIndex = fund.snapshots.findIndex((item) => item.label === selectedQuarter);
  const snapshot = fund.snapshots[snapshotIndex];
  const previous = snapshotIndex > 0 ? fund.snapshots[snapshotIndex - 1] : null;

  const selectFund = (id: Fund["id"]) => {
    setSelectedFundId(id);
    setPositionQuery("");
    setShowAll(false);
  };

  const selectQuarter = (quarter: string) => {
    setSelectedQuarter(quarter);
    setPositionQuery("");
    setShowAll(false);
  };

  const activePositions = assetView === "bond" ? snapshot.topBonds : assetView === "convertible" ? snapshot.convertibles : snapshot.stocks;
  const previousPositions = !previous ? [] : assetView === "bond" ? previous.topBonds : assetView === "convertible" ? previous.convertibles : previous.stocks;
  const activeTotal = assetView === "bond" ? snapshot.categories.bondTotal : assetView === "convertible" ? snapshot.categories.convertible : snapshot.stock;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#overview"><span>FI+</span><b>固收增强研究档案</b></a>
        <div className="as-of">数据期末 <b>{latestDate}</b></div>
        <nav aria-label="页面导航"><a href="#overview">研究摘要</a><a href="#performance">业绩</a><a href="#holdings">持仓</a><a href="#methodology">方法与来源</a></nav>
      </header>

      <section className="hero" id="overview">
        <div className="hero-copy">
          <div className="eyebrow">QUARTERLY RESEARCH ARCHIVE · {latestQuarter}</div>
          <h1>三只固收增强产品<br />季度跟踪档案</h1>
          <p>基于基金法定定期报告，持续记录业绩、资产结构、已披露证券与季度变动。页面用于长期观察策略是否漂移、风险来源如何变化，不构成产品推介或购买建议。</p>
          <div className="archive-stats">
            <span><b>{researchData.coverage.funds}</b><small>只基金</small></span>
            <span><b>{researchData.coverage.quarters}</b><small>个季度</small></span>
            <span><b>{researchData.coverage.reports}</b><small>份季报</small></span>
            <span><b>{totalConvertibleRows.toLocaleString("zh-CN")}</b><small>条转债披露</small></span>
          </div>
          <div className="research-scope"><strong>研究窗口</strong><span>{researchData.period}</span><strong>更新频率</strong><span>季报披露后</span></div>
        </div>
        <div className="hero-chart-panel">
          <div className="panel-heading"><div><span className="section-index">01</span><h2>跟踪期复合净值指数</h2></div><span>2025-03-31 = 100</span></div>
          <TrendChart />
          <p className="chart-note">按各季报 A 类份额“过去三个月”净值增长率逐季复合，仅用于统一观察窗口内的路径比较。</p>
        </div>
      </section>

      <section className="research-observations" aria-label="本季观察摘要">
        {funds.map((item) => {
          const latest = item.snapshots.at(-1)!;
          const prior = item.snapshots.at(-2)!;
          return (
            <button key={item.id} onClick={() => { selectFund(item.id); document.getElementById("holdings")?.scrollIntoView({ behavior: "smooth" }); }} style={{ "--fund-color": item.color } as React.CSSProperties}>
              <div><span>{item.code}</span><h3>{item.shortName}</h3></div>
              <strong className={item.latest.quarter < 0 ? "negative" : "positive"}>{formatPercent(item.latest.quarter, true)}</strong>
              <p>{latest.note}</p>
              <div className="observation-meta"><span>债券 {formatPercent(latest.categories.bondTotal)}</span><span>转债 {formatPercent(latest.categories.convertible)}</span><span>企业债环比 {formatPercent(latest.categories.corporate - prior.categories.corporate, true)}</span></div>
            </button>
          );
        })}
      </section>

      <section className="section performance-section" id="performance">
        <div className="section-heading"><div><span className="section-index">02</span><h2>业绩与风险观察</h2></div><p>收益区间统一到 {latestDate}；“超额”仅相对于各基金自身季报基准，不用于跨基金直接排名。</p></div>
        <div className="performance-grid">
          <div className="performance-table-wrap">
            <table className="performance-table">
              <thead><tr><th>基金（A类）</th><th>{latestQuarter}</th><th>近6月</th><th>近1年</th><th>近3年</th><th>近5年</th><th>本季相对基准</th></tr></thead>
              <tbody>
                {funds.map((item) => (
                  <tr key={item.id}>
                    <td><i style={{ background: item.color }} /><b>{item.shortName}</b><small>{item.code} · {item.benchmark}</small>{item.benchmarkNote && <small>{item.benchmarkNote}</small>}</td>
                    <td className={item.latest.quarter < 0 ? "negative" : "positive"}>{formatPercent(item.latest.quarter, true)}</td>
                    <td>{formatPercent(item.latest.sixMonth, true)}</td><td>{formatPercent(item.latest.oneYear, true)}</td><td>{formatPercent(item.latest.threeYear, true)}</td><td>{formatPercent(item.latest.fiveYear, true)}</td>
                    <td className={item.latest.quarter - item.latest.benchmarkQuarter < 0 ? "negative" : "positive"}>{formatPercent(item.latest.quarter - item.latest.benchmarkQuarter, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="research-note">
            <span>{latestQuarter} 观察</span>
            <h3>收益差异来自资产结构，不能只看“固收+”标签。</h3>
            <ul><li>易方达：股票与转债仓位提高，债券仓位降至净资产以下。</li><li>西部利得：债券仓位升至 127.68%，转债升至 12.55%。</li><li>中银：企业债与转债占比回落。</li></ul><p>西部利得于 7 月 27 日、中银于 9 月 21 日调整基准；超额采用各自季报分段计算后的基准收益。</p>
          </aside>
        </div>
      </section>

      <section className="section holdings-section" id="holdings">
        <div className="section-heading"><div><span className="section-index">03</span><h2>季度持仓分析</h2></div><p>解析每只基金的债券分类、前五大债券、已披露转债明细、前十大股票与现金汇总，并与上一季度逐项比较。</p></div>

        <div className="fund-tabs" role="tablist" aria-label="选择基金">
          {funds.map((item) => (
            <button key={item.id} role="tab" aria-selected={item.id === fund.id} className={item.id === fund.id ? "active" : ""} onClick={() => selectFund(item.id)} style={{ "--fund-color": item.color } as React.CSSProperties}>
              <i style={{ background: item.color }} /><span>{item.shortName}</span><small>{item.strategy}</small>
            </button>
          ))}
        </div>

        <div className="research-console" style={{ "--fund-color": fund.color } as React.CSSProperties}>
          <div className="console-header">
            <div><span className="fund-code">{fund.code}</span><h3>{fund.name}</h3><p>{fund.manager} · {fund.benchmark} · A 类期末净值 {snapshot.nav.toFixed(4)}</p></div>
            <div className="quarter-tabs" role="tablist" aria-label="选择季度">
              {quarters.map((quarter) => <button key={quarter} role="tab" aria-selected={quarter === selectedQuarter} className={quarter === selectedQuarter ? "active" : ""} onClick={() => selectQuarter(quarter)}>{quarter}</button>)}
            </div>
          </div>

          <div className="snapshot-context"><span>报告期末 {snapshot.date}</span><strong>{snapshot.note}</strong><a href={repoFileUrl(snapshot.sources.reportPath)} target="_blank" rel="noreferrer">仓库中的季报 PDF ↗</a></div>

          <div className="snapshot-kpis">
            <div><small>季度收益</small><strong className={snapshot.quarterReturn < 0 ? "negative" : "positive"}>{formatPercent(snapshot.quarterReturn, true)}</strong></div>
            <div><small>基金规模（全份额）</small><strong>{formatYi(snapshot.netAssets)}</strong></div>
            <div><small>债券仓位</small><strong>{formatPercent(snapshot.categories.bondTotal)}</strong><em>{snapshot.categories.bondTotal > 100 ? "含回购融资形成的杠杆" : "未超过净资产"}</em></div>
            <div><small>可转债 / 可交换债</small><strong>{formatPercent(snapshot.categories.convertible)}</strong></div>
            <div><small>股票</small><strong>{formatPercent(snapshot.stock)}</strong></div>
            <div><small>银行现金及备付金</small><strong>{formatPercent(snapshot.cash.bankCashWeight)}</strong></div>
          </div>

          {snapshot.disclosureNote && <div className="method-callout"><strong>本季来源与披露边界</strong><p>{snapshot.disclosureNote}</p><a href={snapshot.sources.officialUrl} target="_blank" rel="noreferrer">基金管理人官方季报 ↗</a></div>}
          <ChangeBrief snapshot={snapshot} previous={previous} />

          <div className="asset-tabs" role="tablist" aria-label="选择资产类别">
            {(Object.keys(assetViewLabels) as AssetView[]).map((view) => <button key={view} role="tab" aria-selected={assetView === view} className={assetView === view ? "active" : ""} onClick={() => { setAssetView(view); setPositionQuery(""); setShowAll(false); }}>{assetViewLabels[view]}</button>)}
          </div>

          <div className="asset-panel">
            {assetView === "overview" && (
              <div className="overview-panel">
                <div><div className="subsection-heading"><div><span>ASSET ALLOCATION</span><h4>资产结构与环比</h4></div><small>全部为占基金净资产比例</small></div><ExposureTable snapshot={snapshot} previous={previous} /></div>
                <div><div className="subsection-heading"><div><span>DISCLOSURE COVERAGE</span><h4>本季披露覆盖</h4></div></div>
                  <div className="coverage-cards">
                    <article><b>{snapshot.topBonds.length}</b><span>前五大债券</span><p>季度报告只要求披露前五名，不能据此推断其余个券。</p></article>
                    <article><b>{snapshot.convertibles.length}</b><span>公开转债明细</span><p>来自定期报告衍生的公开持仓快照，覆盖权重合计 {formatPercent(snapshot.convertibles.reduce((sum, item) => sum + item.weight, 0))}。</p></article>
                    <article><b>{snapshot.stocks.length}</b><span>前十大股票</span><p>{snapshot.stock > 0 ? `前十名合计占净资产 ${formatPercent(snapshot.stocks.reduce((sum, item) => sum + item.weight, 0))}。` : "本季度未持有股票。"}</p></article>
                    <article><b>{formatPercent(snapshot.cash.bankCashWeight)}</b><span>银行现金及备付金</span><p>另有买入返售金融资产 {formatPercent(snapshot.cash.reverseRepoWeight)}，两者均为总额披露。</p></article>
                  </div>
                </div>
                <div className="history-block"><div className="subsection-heading"><div><span>QUARTERLY HISTORY</span><h4>季度变动表</h4></div><small>点击行可切换季度</small></div><HistoryTable fund={fund} selectedQuarter={selectedQuarter} onSelect={selectQuarter} /></div>
              </div>
            )}

            {(assetView === "bond" || assetView === "convertible" || assetView === "stock") && (
              <div className="positions-panel">
                <div className="subsection-heading positions-heading">
                  <div><span>{assetView === "bond" ? "TOP 5 DISCLOSURE" : assetView === "convertible" ? "DISCLOSED CONVERTIBLES" : "TOP 10 DISCLOSURE"}</span><h4>{assetView === "bond" ? "前五大债券及季度变化" : assetView === "convertible" ? "可转债 / 可交换债逐项变化" : "前十大股票及季度变化"}</h4></div>
                  {assetView === "convertible" && <label className="position-search"><span>筛选</span><input value={positionQuery} onChange={(event) => setPositionQuery(event.target.value)} placeholder="代码或名称" /></label>}
                </div>
                <p className="disclosure-note">{assetView === "bond" ? "下表是法定季报前五大债券，不代表全部普通债券持仓；“本季未列示”仅表示退出前五名。" : assetView === "convertible" ? "Q3 列示季报处于转股期的转债明细，历史季度列示归档公开快照；权重合计可能因四舍五入、转股期范围或来源口径低于分类总额。新增/未列示只表示披露表变化，不代表买入/清仓。" : "季度报告仅披露前十大股票；“本季未列示”不等同于已经清仓。"}</p>
                <PositionSummary current={activePositions} previous={previousPositions} total={activeTotal} label={assetView === "bond" ? "债券仓位" : assetView === "convertible" ? "转债分类" : "股票仓位"} />
                <PositionTable current={activePositions} previous={previousPositions} assetClass={assetView} query={positionQuery} showAll={showAll} />
                {assetView === "convertible" && !showAll && !positionQuery && positionComparison(activePositions, previousPositions).length > 20 && <button className="show-all" onClick={() => setShowAll(true)}>显示全部 {positionComparison(activePositions, previousPositions).length} 条记录</button>}
              </div>
            )}

            {assetView === "cash" && (
              <div className="cash-panel">
                <div className="subsection-heading"><div><span>LIQUIDITY SNAPSHOT</span><h4>现金与流动性项目</h4></div><small>占基金净资产比例</small></div>
                <div className="cash-grid">
                  {[
                    ["银行存款和结算备付金", snapshot.cash.bankCashAmount, snapshot.cash.bankCashWeight, previous?.cash.bankCashWeight ?? null],
                    ["买入返售金融资产", snapshot.cash.reverseRepoAmount, snapshot.cash.reverseRepoWeight, previous?.cash.reverseRepoWeight ?? null],
                    ["其他资产", snapshot.cash.otherAssetsAmount, snapshot.cash.otherAssetsWeight, previous?.cash.otherAssetsWeight ?? null],
                  ].map(([label, amount, weight, prior]) => (
                    <article key={label as string}><span>{label}</span><strong>{formatPercent(weight as number)}</strong><small>{formatYi(amount as number)}</small><Delta value={prior === null ? null : (weight as number) - (prior as number)} baseline={!previous} /></article>
                  ))}
                </div>
                <div className="method-callout"><strong>口径提示</strong><p>现金项目按报告金额除以期末基金净资产重新计算，因此与季报“占基金总资产比例”列不同。买入返售金融资产是单独的流动性资产，不等于回购融资负债，也不能据此直接计算净现金。</p></div>
                <HistoryTable fund={fund} selectedQuarter={selectedQuarter} onSelect={selectQuarter} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section risk-section">
        <div className="section-heading"><div><span className="section-index">04</span><h2>持续监控框架</h2></div><p>这里不使用简单的“好 / 坏”判断，而是记录未来季度需要验证的结构性变量。</p></div>
        <div className="monitor-grid">
          <article><span>01 · EQUITY</span><h3>易方达：权益风格与资本债集中度</h3><p>跟踪股票仓位、前十大集中度、周期/红利风格变化，以及银行二级资本债是否继续集中在少数发行人。</p></article>
          <article><span>02 · LEVERAGE</span><h3>西部利得：回购杠杆与信用利差</h3><p>重点观察债券仓位是否长期维持 120% 以上、中票与银行资本债结构、融资成本和转债估值敏感度。</p></article>
          <article><span>03 · CREDIT</span><h3>中银：信用结构与管理团队变化</h3><p>Q3 企业债占比回落至 30.16%；继续核对信用等级、行业和发行人分布，并跟踪经理与业绩基准调整后的策略变化。</p></article>
        </div>
      </section>

      <section className="section methodology-section" id="methodology">
        <div className="section-heading"><div><span className="section-index">05</span><h2>方法、披露边界与源数据</h2></div><p>所有原始资料统一保存在仓库的 <code>source-data/</code>，包含来源网址、抓取日期与 SHA-256 校验值。</p></div>
        <div className="method-grid">
          <article><span>原始文件</span><h3>{researchData.coverage.reports} 份季度报告 PDF</h3><p>按基金代码和季度归档，PDF 是资产结构、收益与法定披露的主依据。</p><a href={`${repositoryBase}/tree/main/source-data/reports`} target="_blank" rel="noreferrer">打开报告目录 ↗</a></article>
          <article><span>接口快照</span><h3>债券与股票公开持仓响应</h3><p>保留 2025、2026 年原始响应，主要用于还原证券名称与逐项历史表格。</p><a href={`${repositoryBase}/tree/main/source-data/api`} target="_blank" rel="noreferrer">打开接口快照目录 ↗</a></article>
          <article><span>可复核数据</span><h3>JSON + CSV 解析结果</h3><p>网页读取同一份研究 JSON；季度汇总和逐项持仓另存 CSV，便于 Excel 检查。</p><a href={`${repositoryBase}/tree/main/source-data/processed`} target="_blank" rel="noreferrer">打开解析数据目录 ↗</a></article>
          <article><span>来源清单</span><h3>逐文件来源与校验值</h3><p>每个文件均记录本地路径、基金、期间、发布方、原始网址、抓取日和哈希。</p><a href={repoFileUrl("source-data/SOURCES.csv")} target="_blank" rel="noreferrer">查看 SOURCES.csv ↗</a></article>
        </div>
        <div className="disclosure-boundary">
          <div><strong>债券</strong><p>{researchData.coverage.bondDisclosure}</p></div>
          <div><strong>股票</strong><p>{researchData.coverage.stockDisclosure}</p></div>
          <div><strong>现金</strong><p>{researchData.coverage.cashDisclosure}</p></div>
          <div><strong>研究定位</strong><p>用于持续跟踪和复核，不是实时持仓、信用评级穿透或投资建议。</p></div>
        </div>
        <div className="reference-note"><span>信息架构参考</span><a href="https://www.morningstar.cn/fund/110017.html" target="_blank" rel="noreferrer">晨星基金档案页 ↗</a><p>借鉴其“业绩—风险—投资组合—策略—来源”的研究顺序，不使用星级或营销结论替代原始报告分析。</p></div>
      </section>

      <footer><div><b>固收增强研究档案</b><span>数据快照 {latestDate} · 源数据整理 {researchData.generatedAt}</span></div><p>过往业绩不代表未来表现。本页面仅供个人研究记录，不构成投资建议。</p><a href="#overview">回到顶部 ↑</a></footer>
    </main>
  );
}
