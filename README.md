# 固收+组合透视

一个用于比较三只固收类基金业绩、资产结构与历史持仓的交互式研究网页，覆盖 2025Q2—2026Q2：

- 易方达增强回报债券 A（110017）
- 西部利得汇享债券 A（675111）
- 中银国有企业债 A（001235）

页面可切换基金和季度，查看收益、债券/股票/可转债仓位、主要持仓及风险提示。数据来自基金定期报告，页面会分别标注报告期与来源链接。

## 在线访问

GitHub Pages：

https://azhengxing.github.io/fixed-income-plus/

仓库已配置为使用 GitHub Actions 自动部署 Pages。

## 本地开发

```bash
npm ci
npm run dev
```

验证 GitHub Pages 静态构建：

```bash
GITHUB_PAGES=true GITHUB_REPOSITORY=AZhengXing/fixed-income-plus npm run build:pages
```

静态成品会输出到 `out/`。推送到 `main` 分支后，GitHub Actions 会自动重新构建并发布。
