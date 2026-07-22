# 固收增强研究档案

一个用于长期跟踪三只固收增强基金业绩、资产结构、已披露持仓与季度变化的研究网页，覆盖 2025Q2—2026Q2：

- 易方达增强回报债券 A（110017）
- 西部利得汇享债券 A（675111）
- 中银国有企业债 A（001235）

页面可切换基金、季度与资产类别，查看：

- 债券的完整分类结构与前五大披露
- 公开可转债/可交换债逐项明细及季度变动
- 前十大股票及季度变动
- 银行现金、结算备付金与买入返售金融资产
- 五季度资产结构表和持续监控要点

本项目用于研究记录，不是基金销售页，也不构成投资建议。

## 数据与来源

所有原始与解析数据统一保存在 [`source-data/`](source-data/)：

- 15 份季度报告 PDF
- 2025、2026 年债券/股票公开持仓接口快照
- 逐文件来源与 SHA-256 清单
- 网页使用的 JSON，以及便于 Excel 复核的季度汇总和逐项持仓 CSV

完整口径与更新流程见 [`source-data/README.md`](source-data/README.md)。

## 在线访问

GitHub Pages：

https://azhengxing.github.io/fixed-income-plus/

## 本地开发

```bash
npm ci
npm run dev
```

重新解析源数据（需要 `pdftotext`）：

```bash
npm run data:build
```

验证 GitHub Pages 静态构建：

```bash
GITHUB_PAGES=true GITHUB_REPOSITORY=AZhengXing/fixed-income-plus npm run build:pages
```

静态成品会输出到 `out/`。推送到 `main` 分支后，GitHub Actions 会自动重新构建并发布。
