#!/usr/bin/env python3
"""Build auditable research data from archived quarterly reports and API snapshots.

The script deliberately keeps the source files immutable. It reads PDFs from
source-data/reports and public holding snapshots from source-data/api, then
rebuilds the JSON/CSV files under source-data/processed.
"""

from __future__ import annotations

import csv
import hashlib
import html
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "source-data"
PROCESSED_ROOT = SOURCE_ROOT / "processed"
QUARTERS = ["2025Q2", "2025Q3", "2025Q4", "2026Q1", "2026Q2"]
RETRIEVED_AT = "2026-07-22"

REPORT_IDS = {
    "110017": {
        "2025Q2": "AN202507211712589355",
        "2025Q3": "AN202510281770215922",
        "2025Q4": "AN202601221818221926",
        "2026Q1": "AN202604221821399588",
        "2026Q2": "AN202607211827167003",
    },
    "675111": {
        "2025Q2": "AN202507181711021822",
        "2025Q3": "AN202510271769815882",
        "2025Q4": "AN202601211818186580",
        "2026Q1": "AN202604211821363502",
        "2026Q2": "AN202607201827127389",
    },
    "001235": {
        "2025Q2": "AN202507211712809961",
        "2025Q3": "AN202510281770448360",
        "2025Q4": "AN202601221818239994",
        "2026Q1": "AN202604221821413716",
        "2026Q2": "AN202607211827182117",
    },
}

FUND_CONFIG = {
    "110017": {
        "id": "ef",
        "shortName": "易方达增强回报债券A",
        "name": "易方达增强回报债券型证券投资基金 A",
        "manager": "王晓晨",
        "benchmark": "中债总指数（全价）",
        "strategy": "股票增强 + 银行资本债 + 可转债",
        "color": "#0b7f91",
        "latest": {
            "quarter": -0.36,
            "sixMonth": 0.34,
            "oneYear": 2.89,
            "threeYear": 15.73,
            "fiveYear": 22.41,
            "volatility": 0.13,
            "benchmarkQuarter": 0.49,
        },
        "quarterly": {
            "2025Q2": (1.92, 4.62, 14.39, "债券仓位超过净资产 100%，股票与转债同时提供增强，风险来源最为分散。"),
            "2025Q3": (1.53, 4.48, 13.94, "主动降低债券杠杆与转债仓位，股票仍接近 14%，紫金矿业升为第一大股票。"),
            "2025Q4": (1.00, 4.75, 12.25, "金融债占比继续上升，股票与转债同步收缩，组合向银行资本债集中。"),
            "2026Q1": (0.70, 5.25, 12.93, "前三大银行二级资本债合计 16.78%，核心债券集中度明显提高。"),
            "2026Q2": (-0.36, 2.89, 12.12, "季报披露股票仓位小幅拖累净值；短融显著增加，中信银行二级资本债升至 6.88%。"),
        },
    },
    "675111": {
        "id": "wl",
        "shortName": "西部利得汇享债券A",
        "name": "西部利得汇享债券型证券投资基金 A",
        "manager": "严志勇 / 李安然",
        "benchmark": "中债综合指数收益率",
        "strategy": "信用票息 + 回购杠杆 + 分散可转债",
        "color": "#233d73",
        "latest": {
            "quarter": 0.74,
            "sixMonth": 2.28,
            "oneYear": 3.79,
            "threeYear": 13.90,
            "fiveYear": 23.04,
            "volatility": 0.09,
            "benchmarkQuarter": 0.62,
        },
        "quarterly": {
            "2025Q2": (1.47, 5.74, 0.00, "中期票据占净资产过半，转债 15.01%；增强主要来自信用利差、杠杆与转债。"),
            "2025Q3": (0.48, 5.51, 0.00, "中票升至 59.23%，债券仓位维持 120% 以上，转债仓位略有下降。"),
            "2025Q4": (0.99, 3.77, 0.00, "债券仓位与中票占比继续抬升，单一核心债券权重仍较分散。"),
            "2026Q1": (1.53, 4.54, 0.00, "转债由 14.86% 降至 9.94%，金融债升至 44.23%，风险来源转向信用与杠杆。"),
            "2026Q2": (0.74, 3.79, 0.00, "债券仓位升至 124.09%，无直接股票仓位，但仍保留 10.33% 的可转债暴露。"),
        },
    },
    "001235": {
        "id": "bo",
        "shortName": "中银国有企业债A",
        "name": "中银国有企业债债券型证券投资基金 A",
        "manager": "王晓彦",
        "benchmark": "中债综合全价（总值）指数",
        "strategy": "企业债 + 政策金融债 + 可转债",
        "color": "#15745f",
        "latest": {
            "quarter": 1.23,
            "sixMonth": 2.29,
            "oneYear": 4.80,
            "threeYear": 16.05,
            "fiveYear": 25.98,
            "volatility": 0.10,
            "benchmarkQuarter": 0.62,
        },
        "quarterly": {
            "2025Q2": (1.17, 6.65, 0.00, "两只国开债合计 13.92%，政策金融债较集中；转债仓位处于五季高位。"),
            "2025Q3": (1.51, 7.28, 0.00, "债券杠杆下降，国开债与金融债仍是组合主体。"),
            "2025Q4": (0.93, 5.09, 0.00, "企业债升至 25.37%，组合逐步由政策金融债转向信用利差。"),
            "2026Q1": (1.04, 4.74, 0.00, "企业债继续增至 30.83%，前三大债券仍以政策金融债为主。"),
            "2026Q2": (1.23, 4.80, 0.00, "企业债升至 33.06%，政策金融债降至 17.61%，信用票息的重要性继续上升。"),
        },
    },
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def pdf_text(path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-layout", str(path), "-"],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.replace("\u00a0", " ")


def value_after_label(section: str, label: str) -> float:
    for line in section.splitlines():
        if label not in line:
            continue
        tail = line.split(label, 1)[1]
        values = re.findall(r"(?:[\d,]+\.\d+|\d+|-)", tail)
        if not values or values[-1] == "-":
            return 0.0
        return float(values[-1].replace(",", ""))
    return 0.0


def amount_after_label(text: str, label: str) -> float:
    for line in text.splitlines():
        if label not in line:
            continue
        tail = line.split(label, 1)[1]
        match = re.search(r"([\d,]+\.\d{2})", tail)
        if match:
            return float(match.group(1).replace(",", ""))
    return 0.0


def parse_pdf_snapshot(path: Path) -> dict:
    text = pdf_text(path)
    net_match = re.search(
        r"4\.期末基金资产净值\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})",
        text,
    )
    if not net_match:
        raise ValueError(f"Unable to parse net assets: {path}")
    net_assets = sum(float(value.replace(",", "")) for value in net_match.groups())

    nav_match = re.search(r"5\.期末基金份额净值\s+([\d.]+)", text)
    nav = float(nav_match.group(1)) if nav_match else None

    category_match = re.search(
        r"5\.4\s*报告期末按债券品种分类的债券投资组合(.*?)"
        r"5\.5\s*报告期末按公允价值占基金资产净值比例大小排序的前五名债券投资明细",
        text,
        re.S,
    )
    if not category_match:
        raise ValueError(f"Unable to parse bond categories: {path}")
    category_section = category_match.group(1)
    categories = {
        "national": value_after_label(category_section, "国家债券"),
        "centralBank": value_after_label(category_section, "央行票据"),
        "financial": value_after_label(category_section, "金融债券"),
        "policy": value_after_label(category_section, "政策性金融债"),
        "corporate": value_after_label(category_section, "企业债券"),
        "shortFinancing": value_after_label(category_section, "企业短期融资券"),
        "mediumNotes": value_after_label(category_section, "中期票据"),
        "convertible": value_after_label(category_section, "可转债（可交换债）"),
        "interbankCD": value_after_label(category_section, "同业存单"),
        "otherBond": value_after_label(category_section, "其他"),
        "bondTotal": value_after_label(category_section, "合计"),
    }

    bank_cash_amount = amount_after_label(text, "银行存款和结算备付金合计")
    reverse_repo_amount = amount_after_label(text, "买入返售金融资产")
    other_assets_amount = amount_after_label(text, "其他资产")

    return {
        "netAssets": net_assets,
        "nav": nav,
        "categories": categories,
        "cash": {
            "bankCashAmount": bank_cash_amount,
            "bankCashWeight": bank_cash_amount / net_assets * 100,
            "reverseRepoAmount": reverse_repo_amount,
            "reverseRepoWeight": reverse_repo_amount / net_assets * 100,
            "otherAssetsAmount": other_assets_amount,
            "otherAssetsWeight": other_assets_amount / net_assets * 100,
        },
    }


def clean_cell(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value)
    return html.unescape(value).strip()


def infer_bond_kind(name: str) -> str:
    compact = name.replace(" ", "").upper()
    if "转" in compact or "EB" in compact:
        return "可转债/可交换债"
    if any(token in compact for token in ("国开", "农发", "进出")):
        return "政策金融债"
    if "国债" in compact:
        return "国债"
    if any(token in compact for token in ("二级资本", "永续债", "银行债", "资本补充债")):
        return "银行资本债/金融债"
    if "MTN" in compact:
        return "中期票据"
    if any(token in compact for token in ("江苏", "地方债")):
        return "地方政府债"
    return "其他信用债"


def parse_api_file(path: Path, kind: str) -> dict[str, list[dict]]:
    raw = path.read_text(encoding="utf-8")
    blocks: dict[str, list[dict]] = {}
    pattern = rf"(\d{{4}})年([1-4])季度{kind}投资明细.*?<tbody>(.*?)</tbody>"
    for match in re.finditer(pattern, raw, re.S):
        year, quarter_no, body = match.groups()
        label = f"{year}Q{quarter_no}"
        rows: list[dict] = []
        for row_match in re.finditer(r"<tr>(.*?)</tr>", body, re.S):
            cells = [clean_cell(cell) for cell in re.findall(r"<td[^>]*>(.*?)</td>", row_match.group(1), re.S)]
            if len(cells) < 5 or not cells[0].isdigit():
                continue
            weight_index = next((index for index, cell in enumerate(cells[3:], 3) if cell.endswith("%")), None)
            if weight_index is None:
                continue
            rows.append(
                {
                    "rank": int(cells[0]),
                    "code": cells[1],
                    "name": cells[2],
                    "weight": float(cells[weight_index].rstrip("%")),
                    "marketValueWan": float(cells[-1].replace(",", "")),
                }
            )
        blocks[label] = rows
    return blocks


def quarter_date(label: str) -> str:
    year, quarter_no = label.split("Q")
    endings = {"1": "03-31", "2": "06-30", "3": "09-30", "4": "12-31"}
    return f"{year}-{endings[quarter_no]}"


def report_url(report_id: str) -> str:
    return f"https://pdf.dfcfw.com/pdf/H2_{report_id}_1.pdf"


def api_url(code: str, source_type: str, year: str) -> str:
    extra = "&topline=10" if source_type == "jjcc" else ""
    return (
        "https://fundf10.eastmoney.com/FundArchivesDatas.aspx"
        f"?type={source_type}&code={code}{extra}&year={year}&rt=0.5"
    )


def build_data() -> dict:
    funds = []
    for code, config in FUND_CONFIG.items():
        bond_api = {}
        stock_api = {}
        for year in ("2025", "2026"):
            bond_api.update(parse_api_file(SOURCE_ROOT / "api" / code / f"bond-holdings-{year}.js", "债券"))
            stock_api.update(parse_api_file(SOURCE_ROOT / "api" / code / f"stock-holdings-{year}.js", "股票"))

        snapshots = []
        for label in QUARTERS:
            path = SOURCE_ROOT / "reports" / code / f"{label}.pdf"
            snapshot = parse_pdf_snapshot(path)
            quarter_return, one_year_return, stock_weight, note = config["quarterly"][label]
            all_bonds = bond_api.get(label, [])
            stocks = stock_api.get(label, [])
            convertibles = [
                {**position, "kind": "可转债/可交换债"}
                for position in all_bonds
                if infer_bond_kind(position["name"]) == "可转债/可交换债"
            ]
            top_bonds = [
                {**position, "kind": infer_bond_kind(position["name"])}
                for position in all_bonds[:5]
            ]
            snapshots.append(
                {
                    "label": label,
                    "date": quarter_date(label),
                    "quarterReturn": quarter_return,
                    "oneYearReturn": one_year_return,
                    "stock": stock_weight,
                    "note": note,
                    **snapshot,
                    "topBonds": top_bonds,
                    "convertibles": convertibles,
                    "stocks": [{**position, "kind": "股票"} for position in stocks[:10]],
                    "sources": {
                        "reportPath": f"source-data/reports/{code}/{label}.pdf",
                        "reportUrl": report_url(REPORT_IDS[code][label]),
                        "bondApiPath": f"source-data/api/{code}/bond-holdings-{label[:4]}.js",
                        "bondApiUrl": api_url(code, "zqcc", label[:4]),
                        "stockApiPath": f"source-data/api/{code}/stock-holdings-{label[:4]}.js",
                        "stockApiUrl": api_url(code, "jjcc", label[:4]),
                    },
                }
            )

        funds.append(
            {
                "id": config["id"],
                "code": code,
                "shortName": config["shortName"],
                "name": config["name"],
                "manager": config["manager"],
                "benchmark": config["benchmark"],
                "strategy": config["strategy"],
                "color": config["color"],
                "latest": config["latest"],
                "snapshots": snapshots,
            }
        )

    return {
        "generatedAt": RETRIEVED_AT,
        "period": "2025Q2—2026Q2",
        "quarters": QUARTERS,
        "coverage": {
            "reports": 15,
            "funds": 3,
            "quarters": 5,
            "bondDisclosure": "季度报告前五大债券；公开持仓快照同时列示报告披露的可转债明细。",
            "stockDisclosure": "季度报告前十大股票，并非全部股票持仓。",
            "cashDisclosure": "银行存款和结算备付金、买入返售金融资产为汇总项目。",
        },
        "funds": funds,
    }


def write_summary_csv(data: dict) -> None:
    path = PROCESSED_ROOT / "quarterly-summary.csv"
    fields = [
        "fund_code", "fund_name", "quarter", "date", "quarter_return_pct", "one_year_return_pct",
        "nav", "net_assets_cny", "bond_total_pct", "national_bond_pct", "policy_bank_bond_pct",
        "other_financial_bond_pct", "corporate_bond_pct", "short_financing_pct", "medium_notes_pct",
        "convertible_pct", "interbank_cd_pct", "stock_pct", "bank_cash_pct", "reverse_repo_pct",
        "top_bond_count", "convertible_position_count", "stock_disclosed_count",
    ]
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for fund in data["funds"]:
            for item in fund["snapshots"]:
                categories = item["categories"]
                writer.writerow(
                    {
                        "fund_code": fund["code"],
                        "fund_name": fund["shortName"],
                        "quarter": item["label"],
                        "date": item["date"],
                        "quarter_return_pct": item["quarterReturn"],
                        "one_year_return_pct": item["oneYearReturn"],
                        "nav": item["nav"],
                        "net_assets_cny": round(item["netAssets"], 2),
                        "bond_total_pct": categories["bondTotal"],
                        "national_bond_pct": categories["national"],
                        "policy_bank_bond_pct": categories["policy"],
                        "other_financial_bond_pct": round(categories["financial"] - categories["policy"], 2),
                        "corporate_bond_pct": categories["corporate"],
                        "short_financing_pct": categories["shortFinancing"],
                        "medium_notes_pct": categories["mediumNotes"],
                        "convertible_pct": categories["convertible"],
                        "interbank_cd_pct": categories["interbankCD"],
                        "stock_pct": item["stock"],
                        "bank_cash_pct": round(item["cash"]["bankCashWeight"], 4),
                        "reverse_repo_pct": round(item["cash"]["reverseRepoWeight"], 4),
                        "top_bond_count": len(item["topBonds"]),
                        "convertible_position_count": len(item["convertibles"]),
                        "stock_disclosed_count": len(item["stocks"]),
                    }
                )


def write_positions_csv(data: dict) -> None:
    path = PROCESSED_ROOT / "disclosed-positions.csv"
    fields = ["fund_code", "fund_name", "quarter", "asset_class", "rank", "code", "name", "kind", "weight_pct", "market_value_wan"]
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for fund in data["funds"]:
            for item in fund["snapshots"]:
                for asset_class, key in (("bond_top5", "topBonds"), ("convertible", "convertibles"), ("stock_top10", "stocks")):
                    for position in item[key]:
                        writer.writerow(
                            {
                                "fund_code": fund["code"],
                                "fund_name": fund["shortName"],
                                "quarter": item["label"],
                                "asset_class": asset_class,
                                "rank": position["rank"],
                                "code": position["code"],
                                "name": position["name"],
                                "kind": position["kind"],
                                "weight_pct": position["weight"],
                                "market_value_wan": position["marketValueWan"],
                            }
                        )


def write_sources_csv() -> None:
    path = SOURCE_ROOT / "SOURCES.csv"
    fields = ["local_path", "fund_code", "period", "source_type", "publisher", "source_url", "retrieved_at", "sha256", "note"]
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for code, reports in REPORT_IDS.items():
            for quarter, report_id in reports.items():
                local = SOURCE_ROOT / "reports" / code / f"{quarter}.pdf"
                writer.writerow(
                    {
                        "local_path": local.relative_to(ROOT).as_posix(),
                        "fund_code": code,
                        "period": quarter,
                        "source_type": "quarterly_report_pdf",
                        "publisher": "基金管理人（东方财富公告镜像）",
                        "source_url": report_url(report_id),
                        "retrieved_at": RETRIEVED_AT,
                        "sha256": sha256(local),
                        "note": "法定季度报告原文",
                    }
                )
            for year in ("2025", "2026"):
                for filename, source_type, api_type, note in (
                    (f"bond-holdings-{year}.js", "bond_holdings_api_snapshot", "zqcc", "债券前五与可转债公开持仓快照"),
                    (f"stock-holdings-{year}.js", "stock_holdings_api_snapshot", "jjcc", "前十大股票公开持仓快照；空文件表示未披露股票"),
                ):
                    local = SOURCE_ROOT / "api" / code / filename
                    writer.writerow(
                        {
                            "local_path": local.relative_to(ROOT).as_posix(),
                            "fund_code": code,
                            "period": year,
                            "source_type": source_type,
                            "publisher": "天天基金",
                            "source_url": api_url(code, api_type, year),
                            "retrieved_at": RETRIEVED_AT,
                            "sha256": sha256(local),
                            "note": note,
                        }
                    )


def main() -> None:
    PROCESSED_ROOT.mkdir(parents=True, exist_ok=True)
    data = build_data()
    (PROCESSED_ROOT / "research-data.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    write_summary_csv(data)
    write_positions_csv(data)
    write_sources_csv()
    print(
        f"Built {len(data['funds'])} funds, "
        f"{sum(len(fund['snapshots']) for fund in data['funds'])} snapshots, "
        f"{sum(len(item['convertibles']) for fund in data['funds'] for item in fund['snapshots'])} convertible rows."
    )


if __name__ == "__main__":
    main()
