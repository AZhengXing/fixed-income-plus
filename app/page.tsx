"use client";

import { useMemo, useState } from "react";

type Position = {
  name: string;
  code?: string;
  weight: number;
  kind?: string;
};

type QuarterSnapshot = {
  label: string;
  date: string;
  quarterReturn: number;
  oneYearReturn: number;
  bond: number;
  convertible: number;
  stock: number;
  financial: number;
  policy: number;
  secondaryLabel: string;
  secondaryValue: number;
  topBonds: Position[];
  topRisk: Position[];
  note: string;
  reportUrl: string;
};

type Fund = {
  id: "ef" | "wl" | "bo";
  shortName: string;
  name: string;
  code: string;
  color: string;
  soft: string;
  strategy: string;
  manager: string;
  scale: string;
  nav: string;
  benchmark: string;
  latest: {
    quarter: number;
    sixMonth: number;
    oneYear: number;
    threeYear: number;
    fiveYear: number;
    volatility: number;
    benchmarkQuarter: number;
  };
  snapshots: QuarterSnapshot[];
};

const quarters = ["2025Q2", "2025Q3", "2025Q4", "2026Q1", "2026Q2"];

const funds: Fund[] = [
  {
    id: "ef",
    shortName: "易方达增强回报债券A",
    name: "易方达增强回报债券型证券投资基金 A",
    code: "110017",
    color: "#00a9c6",
    soft: "#e8f8fb",
    strategy: "股票 + 银行资本债 + 转债",
    manager: "王晓晨",
    scale: "436.34 亿元",
    nav: "1.3850",
    benchmark: "中债总指数（全价）",
    latest: {
      quarter: -0.36,
      sixMonth: 0.34,
      oneYear: 2.89,
      threeYear: 15.73,
      fiveYear: 22.41,
      volatility: 0.13,
      benchmarkQuarter: 0.49,
    },
    snapshots: [
      {
        label: "2025Q2",
        date: "2025-06-30",
        quarterReturn: 1.92,
        oneYearReturn: 4.62,
        bond: 106.02,
        convertible: 8.89,
        stock: 14.39,
        financial: 68.42,
        policy: 3.3,
        secondaryLabel: "中期票据",
        secondaryValue: 17.17,
        topBonds: [
          { code: "230012", name: "23附息国债12", weight: 4.16, kind: "国债" },
          { code: "232480052", name: "24浦发银行二级资本债01A", weight: 2.12, kind: "资本债" },
          { code: "232480073", name: "24工行二级资本债02BC", weight: 2.04, kind: "资本债" },
        ],
        topRisk: [
          { code: "600900", name: "长江电力", weight: 2.95, kind: "股票" },
          { code: "601899", name: "紫金矿业", weight: 2.5, kind: "股票" },
          { code: "601998", name: "中信银行", weight: 1.98, kind: "股票" },
          { code: "132026", name: "G三峡EB2", weight: 1.65, kind: "可交换债" },
        ],
        note: "债券仓位超过净资产 100%，同时保留约 14% 股票；这一阶段的增强来源最分散。",
        reportUrl: "http://fund.eastmoney.com/gonggao/110017,AN202507211712589355.html",
      },
      {
        label: "2025Q3",
        date: "2025-09-30",
        quarterReturn: 1.53,
        oneYearReturn: 4.48,
        bond: 83.93,
        convertible: 6.99,
        stock: 13.94,
        financial: 64.06,
        policy: 5.15,
        secondaryLabel: "中期票据",
        secondaryValue: 9.98,
        topBonds: [
          { code: "232480052", name: "24浦发银行二级资本债01A", weight: 2.35, kind: "资本债" },
          { code: "232380089", name: "23中信银行二级资本债01A", weight: 2.1, kind: "资本债" },
          { code: "250411", name: "25农发11", weight: 2.04, kind: "政策金融债" },
        ],
        topRisk: [
          { code: "601899", name: "紫金矿业", weight: 3.17, kind: "股票" },
          { code: "600900", name: "长江电力", weight: 2.36, kind: "股票" },
          { code: "601998", name: "中信银行", weight: 1.48, kind: "股票" },
          { code: "132026", name: "G三峡EB2", weight: 1.98, kind: "可交换债" },
        ],
        note: "主动降杠杆并压低转债，但股票仍接近 14%；紫金矿业成为第一大股票。",
        reportUrl: "http://fund.eastmoney.com/gonggao/110017,AN202510281770215922.html",
      },
      {
        label: "2025Q4",
        date: "2025-12-31",
        quarterReturn: 1.0,
        oneYearReturn: 4.75,
        bond: 86.43,
        convertible: 5.35,
        stock: 12.25,
        financial: 71.45,
        policy: 7.45,
        secondaryLabel: "中期票据",
        secondaryValue: 7.65,
        topBonds: [
          { code: "232480052", name: "24浦发银行二级资本债01A", weight: 3.48, kind: "资本债" },
          { code: "250431", name: "25农发31", weight: 3.41, kind: "政策金融债" },
          { code: "212480050", name: "24光大银行债02", weight: 2.86, kind: "金融债" },
        ],
        topRisk: [
          { code: "601899", name: "紫金矿业", weight: 2.68, kind: "股票" },
          { code: "600900", name: "长江电力", weight: 1.92, kind: "股票" },
          { code: "601998", name: "中信银行", weight: 1.29, kind: "股票" },
          { code: "132026", name: "G三峡EB2", weight: 2.35, kind: "可交换债" },
        ],
        note: "金融债占比回升，股票与转债继续收缩；组合开始向银行资本债集中。",
        reportUrl: "http://fund.eastmoney.com/gonggao/110017,AN202601221818221926.html",
      },
      {
        label: "2026Q1",
        date: "2026-03-31",
        quarterReturn: 0.7,
        oneYearReturn: 5.25,
        bond: 84.71,
        convertible: 5.05,
        stock: 12.93,
        financial: 71.41,
        policy: 5.55,
        secondaryLabel: "中期票据",
        secondaryValue: 5.08,
        topBonds: [
          { code: "232580009", name: "25中信银行二级资本债01BC", weight: 6.25, kind: "资本债" },
          { code: "232580012", name: "25中行二级资本债01BC", weight: 5.84, kind: "资本债" },
          { code: "232580016", name: "25农行二级资本债01A(BC)", weight: 4.69, kind: "资本债" },
        ],
        topRisk: [
          { code: "601088", name: "中国神华", weight: 2.72, kind: "股票" },
          { code: "600900", name: "长江电力", weight: 1.7, kind: "股票" },
          { code: "601899", name: "紫金矿业", weight: 1.32, kind: "股票" },
          { code: "132026", name: "G三峡EB2", weight: 2.29, kind: "可交换债" },
        ],
        note: "前三大银行二级资本债合计 16.78%，单一债券集中度明显上升。",
        reportUrl: "http://fund.eastmoney.com/gonggao/110017,AN202604221821399588.html",
      },
      {
        label: "2026Q2",
        date: "2026-06-30",
        quarterReturn: -0.36,
        oneYearReturn: 2.89,
        bond: 81.39,
        convertible: 4.9,
        stock: 12.12,
        financial: 65.65,
        policy: 5.71,
        secondaryLabel: "短融",
        secondaryValue: 7.99,
        topBonds: [
          { code: "232580009", name: "25中信银行二级资本债01BC", weight: 6.88, kind: "资本债" },
          { code: "242580015", name: "25招商银行永续债02BC", weight: 2.94, kind: "永续债" },
          { code: "232580024", name: "25农行二级资本债02A(BC)", weight: 2.91, kind: "资本债" },
        ],
        topRisk: [
          { code: "601088", name: "中国神华", weight: 2.57, kind: "股票" },
          { code: "600900", name: "长江电力", weight: 1.87, kind: "股票" },
          { code: "601899", name: "紫金矿业", weight: 0.91, kind: "股票" },
          { code: "132026", name: "G三峡EB2", weight: 2.45, kind: "可交换债" },
        ],
        note: "季报明确指出股票仓位小幅拖累净值；中信银行二级资本债升至 6.88%。",
        reportUrl: "http://fund.eastmoney.com/gonggao/110017,AN202607211827167003.html",
      },
    ],
  },
  {
    id: "wl",
    shortName: "西部利得汇享债券A",
    name: "西部利得汇享债券型证券投资基金 A",
    code: "675111",
    color: "#112e67",
    soft: "#edf2fb",
    strategy: "中票 + 银行资本债 + 转债",
    manager: "严志勇 / 李安然",
    scale: "218.71 亿元",
    nav: "1.3870",
    benchmark: "中债综合指数收益率",
    latest: {
      quarter: 0.74,
      sixMonth: 2.28,
      oneYear: 3.79,
      threeYear: 13.9,
      fiveYear: 23.04,
      volatility: 0.09,
      benchmarkQuarter: 0.62,
    },
    snapshots: [
      {
        label: "2025Q2",
        date: "2025-06-30",
        quarterReturn: 1.47,
        oneYearReturn: 5.74,
        bond: 118.77,
        convertible: 15.01,
        stock: 0,
        financial: 29.5,
        policy: 7.19,
        secondaryLabel: "中期票据",
        secondaryValue: 51.14,
        topBonds: [
          { code: "173977", name: "22江苏32", weight: 1.6, kind: "地方债" },
          { code: "2500002", name: "25超长特别国债02", weight: 1.58, kind: "国债" },
          { code: "272400007", name: "24中国人寿资本补充债01BC", weight: 1.24, kind: "资本补充债" },
        ],
        topRisk: [
          { code: "127105", name: "龙星转债", weight: 0.39, kind: "转债" },
          { code: "113052", name: "兴业转债", weight: 0.38, kind: "转债" },
          { code: "118041", name: "星球转债", weight: 0.37, kind: "转债" },
        ],
        note: "中期票据占净资产过半，转债 15.01%；增强主要来自信用利差与转债。",
        reportUrl: "http://fund.eastmoney.com/gonggao/675111,AN202507181711021822.html",
      },
      {
        label: "2025Q3",
        date: "2025-09-30",
        quarterReturn: 0.48,
        oneYearReturn: 5.51,
        bond: 120.97,
        convertible: 13.9,
        stock: 0,
        financial: 29.98,
        policy: 6.49,
        secondaryLabel: "中期票据",
        secondaryValue: 59.23,
        topBonds: [
          { code: "173977", name: "22江苏32", weight: 1.33, kind: "地方债" },
          { code: "242580041", name: "25光大银行永续债01", weight: 1.2, kind: "永续债" },
          { code: "102485552", name: "24湘高速MTN023", weight: 1.1, kind: "中票" },
        ],
        topRisk: [
          { code: "113042", name: "上银转债", weight: 0.56, kind: "转债" },
          { code: "123128", name: "首华转债", weight: 0.46, kind: "转债" },
          { code: "111021", name: "奥锐转债", weight: 0.42, kind: "转债" },
        ],
        note: "中票占比升至 59.23%，债券仓位维持 120% 以上；转债略降。",
        reportUrl: "http://fund.eastmoney.com/gonggao/675111,AN202510271769815882.html",
      },
      {
        label: "2025Q4",
        date: "2025-12-31",
        quarterReturn: 0.99,
        oneYearReturn: 3.77,
        bond: 123.14,
        convertible: 14.86,
        stock: 0,
        financial: 31.01,
        policy: 6.03,
        secondaryLabel: "中期票据",
        secondaryValue: 60.33,
        topBonds: [
          { code: "230405", name: "23农发05", weight: 1.49, kind: "政策金融债" },
          { code: "173977", name: "22江苏32", weight: 1.38, kind: "地方债" },
          { code: "272400007", name: "24中国人寿资本补充债01BC", weight: 1.27, kind: "资本补充债" },
        ],
        topRisk: [
          { code: "113042", name: "上银转债", weight: 0.64, kind: "转债" },
          { code: "111021", name: "奥锐转债", weight: 0.48, kind: "转债" },
          { code: "113605", name: "大参转债", weight: 0.45, kind: "转债" },
        ],
        note: "债券仓位与中票占比继续抬升，但单券最高仅 1.49%，个券非常分散。",
        reportUrl: "http://fund.eastmoney.com/gonggao/675111,AN202601211818186580.html",
      },
      {
        label: "2026Q1",
        date: "2026-03-31",
        quarterReturn: 1.53,
        oneYearReturn: 4.54,
        bond: 123.2,
        convertible: 9.94,
        stock: 0,
        financial: 44.23,
        policy: 6.55,
        secondaryLabel: "中期票据",
        secondaryValue: 53.89,
        topBonds: [
          { code: "272400007", name: "24中国人寿资本补充债01BC", weight: 1.61, kind: "资本补充债" },
          { code: "232580056", name: "25广发银行二级资本债01BC", weight: 1.43, kind: "资本债" },
          { code: "232480050", name: "24上海银行二级资本债01", weight: 1.39, kind: "资本债" },
        ],
        topRisk: [
          { code: "127103", name: "东南转债", weight: 0.71, kind: "转债" },
          { code: "113042", name: "上银转债", weight: 0.64, kind: "转债" },
          { code: "113056", name: "重银转债", weight: 0.48, kind: "转债" },
        ],
        note: "转债从 14.86% 降至 9.94%，金融债升至 44.23%，风险来源转向信用与杠杆。",
        reportUrl: "http://fund.eastmoney.com/gonggao/675111,AN202604211821363502.html",
      },
      {
        label: "2026Q2",
        date: "2026-06-30",
        quarterReturn: 0.74,
        oneYearReturn: 3.79,
        bond: 124.09,
        convertible: 10.33,
        stock: 0,
        financial: 47.42,
        policy: 6.98,
        secondaryLabel: "中期票据",
        secondaryValue: 50.49,
        topBonds: [
          { code: "272400007", name: "24中国人寿资本补充债01BC", weight: 1.84, kind: "资本补充债" },
          { code: "240202", name: "24国开02", weight: 1.72, kind: "政策金融债" },
          { code: "232580056", name: "25广发银行二级资本债01BC", weight: 1.5, kind: "资本债" },
        ],
        topRisk: [
          { code: "113052", name: "兴业转债", weight: 0.83, kind: "转债" },
          { code: "113056", name: "重银转债", weight: 0.66, kind: "转债" },
          { code: "118024", name: "冠宇转债", weight: 0.58, kind: "转债" },
        ],
        note: "债券仓位升至 124.09%，三者最高；无股票，但并不等于无权益敏感性。",
        reportUrl: "http://fund.eastmoney.com/gonggao/675111,AN202607201827127389.html",
      },
    ],
  },
  {
    id: "bo",
    shortName: "中银国有企业债A",
    name: "中银国有企业债债券型证券投资基金 A",
    code: "001235",
    color: "#008d78",
    soft: "#e8f7f3",
    strategy: "政策金融债 + 企业债 + 转债",
    manager: "王晓彦",
    scale: "237.75 亿元",
    nav: "1.2935",
    benchmark: "中债综合全价（总值）指数",
    latest: {
      quarter: 1.23,
      sixMonth: 2.29,
      oneYear: 4.8,
      threeYear: 16.05,
      fiveYear: 25.98,
      volatility: 0.1,
      benchmarkQuarter: 0.62,
    },
    snapshots: [
      {
        label: "2025Q2",
        date: "2025-06-30",
        quarterReturn: 1.17,
        oneYearReturn: 6.65,
        bond: 107.31,
        convertible: 14.02,
        stock: 0,
        financial: 59.03,
        policy: 25.96,
        secondaryLabel: "企业债",
        secondaryValue: 17.15,
        topBonds: [
          { code: "240210", name: "24国开10", weight: 7.29, kind: "政策金融债" },
          { code: "240203", name: "24国开03", weight: 6.63, kind: "政策金融债" },
          { code: "212400007", name: "24中信银行债01", weight: 2.61, kind: "金融债" },
        ],
        topRisk: [
          { code: "110059", name: "浦发转债", weight: 0.9, kind: "转债" },
          { code: "113042", name: "上银转债", weight: 0.67, kind: "转债" },
          { code: "110073", name: "国投转债", weight: 0.47, kind: "转债" },
        ],
        note: "两只国开债合计 13.92%，政策金融债集中；转债仓位处于五季高位。",
        reportUrl: "http://fund.eastmoney.com/gonggao/001235,AN202507211712809961.html",
      },
      {
        label: "2025Q3",
        date: "2025-09-30",
        quarterReturn: 1.51,
        oneYearReturn: 7.28,
        bond: 103.9,
        convertible: 10.06,
        stock: 0,
        financial: 61.88,
        policy: 27.17,
        secondaryLabel: "企业债",
        secondaryValue: 17.01,
        topBonds: [
          { code: "240203", name: "24国开03", weight: 8.2, kind: "政策金融债" },
          { code: "240210", name: "24国开10", weight: 2.97, kind: "政策金融债" },
          { code: "250215", name: "25国开15", weight: 2.92, kind: "政策金融债" },
        ],
        topRisk: [
          { code: "113042", name: "上银转债", weight: 0.66, kind: "转债" },
          { code: "127103", name: "东南转债", weight: 0.4, kind: "转债" },
          { code: "110073", name: "国投转债", weight: 0.29, kind: "转债" },
        ],
        note: "季度收益 1.51% 为五季最高；债券杠杆下降，仍由国开债和金融债主导。",
        reportUrl: "http://fund.eastmoney.com/gonggao/001235,AN202510281770448360.html",
      },
      {
        label: "2025Q4",
        date: "2025-12-31",
        quarterReturn: 0.93,
        oneYearReturn: 5.09,
        bond: 109.14,
        convertible: 11.08,
        stock: 0,
        financial: 57.74,
        policy: 23.94,
        secondaryLabel: "企业债",
        secondaryValue: 25.37,
        topBonds: [
          { code: "240203", name: "24国开03", weight: 8.2, kind: "政策金融债" },
          { code: "250016", name: "25附息国债16", weight: 2.47, kind: "国债" },
          { code: "242913", name: "25GTHTK1", weight: 2.42, kind: "公司债" },
        ],
        topRisk: [
          { code: "113042", name: "上银转债", weight: 0.48, kind: "转债" },
          { code: "127089", name: "晶澳转债", weight: 0.39, kind: "转债" },
          { code: "127103", name: "东南转债", weight: 0.39, kind: "转债" },
        ],
        note: "企业债升至 25.37%，策略从政策金融债逐步向信用利差迁移。",
        reportUrl: "http://fund.eastmoney.com/gonggao/001235,AN202601221818239994.html",
      },
      {
        label: "2026Q1",
        date: "2026-03-31",
        quarterReturn: 1.04,
        oneYearReturn: 4.74,
        bond: 105.96,
        convertible: 9.16,
        stock: 0,
        financial: 55.27,
        policy: 24.43,
        secondaryLabel: "企业债",
        secondaryValue: 30.83,
        topBonds: [
          { code: "240203", name: "24国开03", weight: 6.13, kind: "政策金融债" },
          { code: "250361", name: "25进出61", weight: 3.28, kind: "政策金融债" },
          { code: "250215", name: "25国开15", weight: 3.11, kind: "政策金融债" },
        ],
        topRisk: [
          { code: "118034", name: "晶能转债", weight: 0.39, kind: "转债" },
          { code: "111010", name: "立昂转债", weight: 0.28, kind: "转债" },
          { code: "113042", name: "上银转债", weight: 0.28, kind: "转债" },
        ],
        note: "企业债继续增至 30.83%，前三大仍为政策金融债，组合在票息与利率暴露间平衡。",
        reportUrl: "http://fund.eastmoney.com/gonggao/001235,AN202604221821413716.html",
      },
      {
        label: "2026Q2",
        date: "2026-06-30",
        quarterReturn: 1.23,
        oneYearReturn: 4.8,
        bond: 107.72,
        convertible: 8.68,
        stock: 0,
        financial: 49.25,
        policy: 17.61,
        secondaryLabel: "企业债",
        secondaryValue: 33.06,
        topBonds: [
          { code: "250361", name: "25进出61", weight: 2.99, kind: "政策金融债" },
          { code: "240203", name: "24国开03", weight: 2.73, kind: "政策金融债" },
          { code: "232580022", name: "25工行二级资本债03BC", weight: 2.28, kind: "资本债" },
        ],
        topRisk: [
          { code: "113052", name: "兴业转债", weight: 0.49, kind: "转债" },
          { code: "118034", name: "晶能转债", weight: 0.36, kind: "转债" },
          { code: "110086", name: "精工转债", weight: 0.32, kind: "转债" },
        ],
        note: "二季度收益三者第一；企业债升至 33.06%，政策金融债降至 17.61%。",
        reportUrl: "http://fund.eastmoney.com/gonggao/001235,AN202607211827182117.html",
      },
    ],
  },
];

const cumulative = [
  { id: "ef", values: [100, 101.92, 103.4794, 104.5142, 105.2458, 104.8669] },
  { id: "wl", values: [100, 101.47, 101.9571, 102.9664, 104.5418, 105.3154] },
  { id: "bo", values: [100, 101.17, 102.6977, 103.6528, 104.7307, 106.0189] },
];

const chartLabels = ["25-03", "25-06", "25-09", "25-12", "26-03", "26-06"];

function formatPercent(value: number, withPlus = false) {
  const sign = withPlus && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function TrendChart() {
  const width = 680;
  const height = 250;
  const padding = { left: 44, right: 24, top: 24, bottom: 38 };
  const min = 99.5;
  const max = 106.5;
  const x = (index: number) =>
    padding.left + (index / (chartLabels.length - 1)) * (width - padding.left - padding.right);
  const y = (value: number) =>
    padding.top + ((max - value) / (max - min)) * (height - padding.top - padding.bottom);
  const ticks = [100, 102, 104, 106];

  return (
    <div className="trend-chart" role="img" aria-label="三只基金从2025年3月末至2026年6月末的季度复合净值指数对比">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} className="grid-line" />
            <text x={padding.left - 10} y={y(tick) + 4} textAnchor="end" className="axis-label">
              {tick}
            </text>
          </g>
        ))}
        {chartLabels.map((label, index) => (
          <text key={label} x={x(index)} y={height - 10} textAnchor="middle" className="axis-label">
            {label}
          </text>
        ))}
        {cumulative.map((line) => {
          const fund = funds.find((item) => item.id === line.id)!;
          const points = line.values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
          const last = line.values[line.values.length - 1];
          return (
            <g key={line.id}>
              <polyline points={points} fill="none" stroke={fund.color} strokeWidth="3" vectorEffect="non-scaling-stroke" />
              <circle cx={x(line.values.length - 1)} cy={y(last)} r="4" fill={fund.color} />
            </g>
          );
        })}
      </svg>
      <div className="chart-summary" aria-hidden="true">
        {funds.map((fund) => {
          const value = cumulative.find((item) => item.id === fund.id)!.values.at(-1)! - 100;
          return (
            <span key={fund.id}>
              <i style={{ background: fund.color }} />
              {fund.shortName.replace("债券A", "").replace("企业债A", "企业债")} <b>{formatPercent(value, true)}</b>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Sparkline({ fund }: { fund: Fund }) {
  const values = cumulative.find((item) => item.id === fund.id)!.values;
  const width = 170;
  const height = 54;
  const min = Math.min(...values) - 0.4;
  const max = Math.max(...values) + 0.4;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = 5 + ((max - value) / (max - min)) * (height - 10);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={points} fill="none" stroke={fund.color} strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ExposureBar({ label, value, color, scale = 130 }: { label: string; value: number; color: string; scale?: number }) {
  return (
    <div className="exposure-row">
      <div className="exposure-label">
        <span>{label}</span>
        <strong>{value.toFixed(2)}%</strong>
      </div>
      <div className="exposure-track">
        <div className="exposure-fill" style={{ width: `${Math.min(100, (value / scale) * 100)}%`, background: color }} />
        {scale === 130 && <i className="hundred-marker" style={{ left: `${(100 / scale) * 100}%` }} />}
      </div>
    </div>
  );
}

function PositionTable({ rows, accent }: { rows: Position[]; accent: string }) {
  return (
    <div className="position-table">
      {rows.map((row, index) => (
        <div className="position-row" key={`${row.code}-${row.name}`}>
          <span className="rank" style={{ color: accent }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="position-main">
            <b>{row.name}</b>
            <small>{row.code} · {row.kind}</small>
          </span>
          <strong>{row.weight.toFixed(2)}%</strong>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [selectedFundId, setSelectedFundId] = useState<Fund["id"]>("ef");
  const [selectedQuarter, setSelectedQuarter] = useState("2026Q2");
  const selectedFund = useMemo(() => funds.find((fund) => fund.id === selectedFundId)!, [selectedFundId]);
  const snapshot = useMemo(
    () => selectedFund.snapshots.find((item) => item.label === selectedQuarter)!,
    [selectedFund, selectedQuarter],
  );

  const openHoldings = (id: Fund["id"]) => {
    setSelectedFundId(id);
    setSelectedQuarter("2026Q2");
    window.setTimeout(() => document.getElementById("holdings")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#overview" aria-label="返回组合概览">
          <span className="brand-mark">固收+</span>
          <span>组合透视</span>
        </a>
        <div className="as-of"><span aria-hidden="true">▣</span> 数据截至 2026-06-30</div>
        <nav aria-label="页面导航">
          <a href="#overview">组合概览</a>
          <a href="#performance">业绩</a>
          <a href="#holdings">持仓演变</a>
          <a href="#risk">风险</a>
        </nav>
      </header>

      <section className="hero" id="overview">
        <div className="hero-copy">
          <div className="eyebrow">2026 Q2 · 季报拆解</div>
          <h1>三只固收+，<br />谁在真正贡献收益？</h1>
          <p className="hero-subtitle">同为债券型基金，收益引擎却分别指向股票、信用杠杆与企业债。</p>
          <div className="hero-scorecards">
            {funds.map((fund) => (
              <button key={fund.id} onClick={() => openHoldings(fund.id)} style={{ "--fund-color": fund.color } as React.CSSProperties}>
                <strong className={fund.latest.quarter < 0 ? "negative" : ""}>{formatPercent(fund.latest.quarter, true)}</strong>
                <span>{fund.shortName}</span>
                <small>二季度净值增长</small>
              </button>
            ))}
          </div>
          <button className="primary-cta" onClick={() => openHoldings("bo")}>
            查看最新季报拆解 <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="hero-chart-panel">
          <div className="panel-heading">
            <div>
              <span className="section-index">01</span>
              <h2>近五季复合净值指数</h2>
            </div>
            <span className="method-chip">2025-03-31 = 100</span>
          </div>
          <TrendChart />
          <p className="chart-note">按各季报 A 类份额“过去三个月”收益率逐季复合；不是成立以来净值曲线。</p>
        </div>
      </section>

      <section className="fund-strip" aria-label="基金摘要">
        {funds.map((fund) => (
          <article className="fund-card" key={fund.id} style={{ "--fund-color": fund.color, "--fund-soft": fund.soft } as React.CSSProperties}>
            <div className="fund-card-head">
              <div>
                <span className="fund-code">{fund.code}</span>
                <h3>{fund.shortName}</h3>
              </div>
              <span className="strategy-tag">{fund.strategy}</span>
            </div>
            <div className="fund-card-metrics">
              <div><small>近一年</small><strong>{formatPercent(fund.latest.oneYear, true)}</strong></div>
              <div><small>近1年波动标准差</small><strong>{fund.latest.volatility.toFixed(2)}%</strong></div>
              <Sparkline fund={fund} />
            </div>
            <div className="fund-card-meta">
              <span>规模 <b>{fund.scale}</b></span>
              <span>基金经理 <b>{fund.manager}</b></span>
            </div>
            <button onClick={() => openHoldings(fund.id)}>查看持仓与季度变化 <span aria-hidden="true">→</span></button>
          </article>
        ))}
      </section>

      <section className="section performance-section" id="performance">
        <div className="section-heading">
          <div>
            <span className="section-index">02</span>
            <h2>业绩不是一个数字</h2>
          </div>
          <p>短期看收益，长期看稳定性；超额收益仅与各自季报基准比较。</p>
        </div>
        <div className="performance-grid">
          <div className="performance-table-wrap">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>基金（A类）</th>
                  <th>2026Q2</th>
                  <th>近6月</th>
                  <th>近1年</th>
                  <th>近3年</th>
                  <th>近5年</th>
                  <th>Q2 超额</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((fund) => (
                  <tr key={fund.id}>
                    <td><i style={{ background: fund.color }} /> <b>{fund.shortName}</b><small>{fund.code}</small></td>
                    <td className={fund.latest.quarter < 0 ? "negative" : "positive"}>{formatPercent(fund.latest.quarter, true)}</td>
                    <td>{formatPercent(fund.latest.sixMonth, true)}</td>
                    <td>{formatPercent(fund.latest.oneYear, true)}</td>
                    <td>{formatPercent(fund.latest.threeYear, true)}</td>
                    <td>{formatPercent(fund.latest.fiveYear, true)}</td>
                    <td className={fund.latest.quarter - fund.latest.benchmarkQuarter < 0 ? "negative" : "positive"}>
                      {formatPercent(fund.latest.quarter - fund.latest.benchmarkQuarter, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="verdict-card">
            <span className="verdict-label">本季结论</span>
            <h3>中银国企债胜在“债”，<br />不是胜在更激进。</h3>
            <p>2026Q2 中银国企债 A 收益 1.23%，在三者中最高；其股票仓位为 0，转债仓位还从 9.16% 降至 8.68%。与此同时，企业债占比升至 33.06%。</p>
            <div className="verdict-stats">
              <span><small>本季收益</small><b>+1.23%</b></span>
              <span><small>本季超额</small><b>+0.61%</b></span>
              <span><small>企业债</small><b>33.06%</b></span>
            </div>
          </aside>
        </div>
      </section>

      <section className="section holdings-section" id="holdings">
        <div className="section-heading">
          <div>
            <span className="section-index">03</span>
            <h2>持仓演变</h2>
          </div>
          <p>选择基金与季度，查看当期季报快照。百分比均为占基金净资产比例，股票栏除外亦已换算至净资产口径。</p>
        </div>

        <div className="fund-tabs" role="tablist" aria-label="选择基金">
          {funds.map((fund) => (
            <button
              key={fund.id}
              role="tab"
              aria-selected={selectedFundId === fund.id}
              className={selectedFundId === fund.id ? "active" : ""}
              onClick={() => setSelectedFundId(fund.id)}
              style={{ "--fund-color": fund.color } as React.CSSProperties}
            >
              <i style={{ background: fund.color }} />
              <span>{fund.shortName}</span>
              <small>{fund.strategy}</small>
            </button>
          ))}
        </div>

        <div className="holdings-console" style={{ "--fund-color": selectedFund.color, "--fund-soft": selectedFund.soft } as React.CSSProperties}>
          <div className="console-topbar">
            <div>
              <span className="fund-code">{selectedFund.code}</span>
              <h3>{selectedFund.name}</h3>
              <p>{selectedFund.manager} · A 类期末净值 {selectedFund.nav} · A+C 规模 {selectedFund.scale}</p>
            </div>
            <div className="quarter-tabs" role="tablist" aria-label="选择季度">
              {quarters.map((quarter) => (
                <button
                  key={quarter}
                  role="tab"
                  aria-selected={selectedQuarter === quarter}
                  className={selectedQuarter === quarter ? "active" : ""}
                  onClick={() => setSelectedQuarter(quarter)}
                >
                  {quarter}
                </button>
              ))}
            </div>
          </div>

          <div className="snapshot-banner">
            <span>报告期末 {snapshot.date}</span>
            <strong>{snapshot.note}</strong>
            <a href={snapshot.reportUrl} target="_blank" rel="noreferrer">查看当季报告原文 ↗</a>
          </div>

          <div className="snapshot-kpis">
            <div><small>季度收益</small><strong className={snapshot.quarterReturn < 0 ? "negative" : "positive"}>{formatPercent(snapshot.quarterReturn, true)}</strong></div>
            <div><small>截至当季近1年</small><strong>{formatPercent(snapshot.oneYearReturn, true)}</strong></div>
            <div><small>债券仓位</small><strong>{snapshot.bond.toFixed(2)}%</strong><em>{snapshot.bond > 100 ? "含回购杠杆" : "未超过净资产"}</em></div>
            <div><small>转债 / 可交换债</small><strong>{snapshot.convertible.toFixed(2)}%</strong></div>
            <div><small>股票仓位</small><strong>{snapshot.stock.toFixed(2)}%</strong></div>
          </div>

          <div className="console-grid">
            <article className="exposure-card">
              <div className="subsection-heading">
                <div><span>资产结构</span><h4>收益引擎在哪里</h4></div>
                <small>虚线 = 净资产 100%</small>
              </div>
              <ExposureBar label="债券合计" value={snapshot.bond} color={selectedFund.color} />
              <ExposureBar label="金融债" value={snapshot.financial} color="#536782" />
              <ExposureBar label="其中：政策金融债" value={snapshot.policy} color="#91a2b8" />
              <ExposureBar label={snapshot.secondaryLabel} value={snapshot.secondaryValue} color="#6d7fd1" />
              <ExposureBar label="转债 / 可交换债" value={snapshot.convertible} color="#d68a24" />
              <ExposureBar label="股票" value={snapshot.stock} color="#b8526b" />
              <p>债券合计可超过 100%，主要来自债券回购融资；政策金融债包含在金融债中，转债包含在债券合计中。</p>
            </article>

            <article className="positions-card">
              <div className="subsection-heading">
                <div><span>前五大披露中的前三</span><h4>核心债券</h4></div>
                <small>占净资产</small>
              </div>
              <PositionTable rows={snapshot.topBonds} accent={selectedFund.color} />
            </article>

            <article className="positions-card risk-assets-card">
              <div className="subsection-heading">
                <div><span>{selectedFund.id === "ef" ? "股票与主要转债" : "主要转债"}</span><h4>非纯债风险暴露</h4></div>
                <small>占净资产</small>
              </div>
              <PositionTable rows={snapshot.topRisk} accent="#b8526b" />
            </article>
          </div>
        </div>
      </section>

      <section className="section risk-section" id="risk">
        <div className="section-heading">
          <div>
            <span className="section-index">04</span>
            <h2>看起来都稳，风险并不相同</h2>
          </div>
          <p>低历史波动不等于低结构风险；应同时看权益敏感度、债券杠杆与信用暴露。</p>
        </div>
        <div className="risk-grid">
          <article>
            <span className="risk-number">01</span>
            <h3>易方达：权益拖累最直接</h3>
            <p>股票 12.12% + 转债 4.90%。Q2 季报明确写明股票仓位对净值有小幅拖累；三者中季度标准差也最高。</p>
            <div className="risk-meter"><i style={{ width: "72%", background: funds[0].color }} /></div>
            <small>主要监控：股票风格、银行资本债集中度</small>
          </article>
          <article>
            <span className="risk-number">02</span>
            <h3>西部利得：杠杆藏在低波动里</h3>
            <p>没有股票，但债券仓位 124.09%，三者最高；中票 50.49%、转债 10.33%，收益更依赖信用利差与融资成本。</p>
            <div className="risk-meter"><i style={{ width: "88%", background: funds[1].color }} /></div>
            <small>主要监控：回购杠杆、信用利差、转债估值</small>
          </article>
          <article>
            <span className="risk-number">03</span>
            <h3>中银：信用替代了利率债</h3>
            <p>企业债从 2025Q2 的 17.15% 升至 33.06%，政策金融债降至 17.61%。Q2 表现最好，但信用下沉趋势值得持续观察。</p>
            <div className="risk-meter"><i style={{ width: "64%", background: funds[2].color }} /></div>
            <small>主要监控：企业债信用质量、政策金融债占比</small>
          </article>
        </div>
        <div className="risk-footnote">
          <strong>组合判断</strong>
          <p>若你把三只同时持有，它们并非简单重复：易方达提供股票型增强，西部利得提供信用杠杆与分散转债，中银提供政策金融债/企业债切换。真正的重叠集中在银行资本债与转债，而不是表面的“债券型”标签。</p>
        </div>
      </section>

      <section className="section sources-section" id="sources">
        <div className="section-heading compact">
          <div>
            <span className="section-index">05</span>
            <h2>数据来源与口径</h2>
          </div>
        </div>
        <div className="source-grid">
          <div>
            <h3>最新季报原文</h3>
            <a href="https://pdf.dfcfw.com/pdf/H2_AN202607211827167003_1.pdf?1784594053000.pdf" target="_blank" rel="noreferrer">易方达增强回报债券 2026Q2 PDF ↗</a>
            <a href="https://pdf.dfcfw.com/pdf/H2_AN202607201827127389_1.pdf?1784538555000.pdf" target="_blank" rel="noreferrer">西部利得汇享债券 2026Q2 PDF ↗</a>
            <a href="https://pdf.dfcfw.com/pdf/H2_AN202607211827182117_1.pdf?1784624711000.pdf" target="_blank" rel="noreferrer">中银国有企业债 2026Q2 PDF ↗</a>
          </div>
          <div>
            <h3>口径说明</h3>
            <p>收益均为 A 类份额净值增长率，不含申购赎回费用；规模为 2026-06-30 A+C 期末基金资产净值合计。持仓来自季度报告，属于报告期末快照，不代表当前实时仓位。</p>
          </div>
          <div>
            <h3>重要限制</h3>
            <p>“超额”使用各基金自己的业绩比较基准，基准并不完全相同。债券分类存在包含关系，不能把金融债、政策金融债与债券合计相加。</p>
          </div>
        </div>
      </section>

      <footer>
        <span>固收+组合透视</span>
        <p>数据快照：2026-06-30 · 报告披露：2026-07-20 / 2026-07-21</p>
        <a href="#overview">回到顶部 ↑</a>
      </footer>
    </main>
  );
}
