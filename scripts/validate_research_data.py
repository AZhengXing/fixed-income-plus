#!/usr/bin/env python3
"""Audit report-derived numbers, denominators, disclosure coverage and archives."""
import csv
import hashlib
import json
import math
from pathlib import Path
from unittest.mock import patch
import build_research_data as builder

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'source-data/processed/research-data.json').read_text())
# Independently transcribed from Q3 reports, sections 3.1, 3.2.1, 5.2, 5.4 and convertible annex.
expected = {
    '110017': (1.92, 43946594445.27, 81.68, 6.11, 13.70, 82, 10),
    '675111': (0.33, 23602695459.94, 127.68, 12.55, 0, 61, 0),
    '001235': (0.23, 25685900321.98, 104.74, 6.21, 0, 62, 0),
}
assert data['quarters'][-1] == '2026Q3'
assert data['coverage']['reports'] == 18
for fund in data['funds']:
    item = fund['snapshots'][-1]
    values = expected[fund['code']]
    actual = (item['quarterReturn'], item['netAssets'], item['categories']['bondTotal'],
              item['categories']['convertible'], item['stock'], len(item['convertibles']), len(item['stocks']))
    assert all(math.isclose(a, b, abs_tol=0.01) for a, b in zip(actual, values)), (fund['code'], actual)
    categories = item['categories']
    # Policy bonds are a financial-bond subset; convertibles are already in bondTotal.
    total = sum(v for k, v in categories.items() if k not in ('bondTotal', 'policy'))
    assert abs(total - categories['bondTotal']) <= 0.04
    for kind in ('topBonds', 'convertibles', 'stocks'):
        rows = item[kind]
        assert len({r['code'] for r in rows}) == len(rows)
        assert [r['rank'] for r in rows] == list(range(1, len(rows)+1))
        for row in rows:
            weight = row['marketValueWan'] * 10000 / item['netAssets'] * 100
            assert abs(weight - row['weight']) <= 0.0051, row
    for key in ('bankCash', 'reverseRepo', 'otherAssets'):
        assert math.isclose(item['cash'][key+'Weight'], item['cash'][key+'Amount']/item['netAssets']*100)
    assert len(item['topBonds']) == 5
    assert item['sources']['bondApiPath'] == ''
    assert item['sources']['stockApiPath'] == ''
    assert fund['latest']['quarter'] == item['quarterReturn']

# Wrapped numeric security-name suffix must survive page-number stripping.
assert data['funds'][0]['snapshots'][-1]['topBonds'][-1]['name'].endswith('04')
# Malformed disclosure must fail instead of silently becoming a zero holding.
original = builder.pdf_text
with patch.object(builder, 'pdf_text', side_effect=lambda path: original(path).replace('企业短期融资券', 'MISSING_CATEGORY')):
    try:
        builder.parse_q3('110017')
    except ValueError as error:
        assert 'Missing bond category' in str(error)
    else:
        raise AssertionError('Missing category was accepted')

with (ROOT / 'source-data/SOURCES.csv').open(encoding='utf-8-sig') as handle:
    for source in csv.DictReader(handle):
        path = ROOT / source['local_path']
        assert hashlib.sha256(path.read_bytes()).hexdigest() == source['sha256'], path
        assert source['retrieved_at'] == ('2026-11-02' if source['period'] == '2026Q3' else '2026-07-22')
with (ROOT / 'source-data/processed/quarterly-summary.csv').open(encoding='utf-8-sig') as handle:
    assert len(list(csv.DictReader(handle))) == 18
with (ROOT / 'source-data/processed/disclosed-positions.csv').open(encoding='utf-8-sig') as handle:
    rows = [r for r in csv.DictReader(handle) if r['quarter'] == '2026Q3']
    assert len(rows) == 230
print('PASS: Q3 report figures, 230 positions, cash/NAV denominators, source hashes and missing-category rejection')
