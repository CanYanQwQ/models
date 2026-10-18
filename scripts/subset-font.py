#!/usr/bin/env python3
"""Rebuild the CJK display subset shipped in plaza/public/fonts/.

The heading face covers only the characters this page actually sets, which
takes Noto Sans SC from ~17 MB to ~90 kB. Run this after editing any copy in
plaza/src/ or plaza/index.html, otherwise newly added characters fall back to
the system CJK face and headings mix two designs.

    cd plaza && python scripts/subset-font.py

Requires: pip install fonttools brotli
Source font: https://github.com/google/fonts/tree/main/ofl/notosanssc
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

SOURCE_URL = (
    'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/'
    'NotoSansSC%5Bwght%5D.ttf'
)
WEIGHT = 600
OUTPUT = Path(__file__).resolve().parent.parent / 'public/fonts/noto-sans-sc-plaza-600.woff2'

# Every source that can end up as visible text.
SCAN = ['src', 'index.html']
SUFFIXES = {'.ts', '.tsx', '.html'}

# Ranges worth carrying even when unused today; they cost almost nothing and
# keep punctuation and full-width forms from falling back mid-sentence.
EXTRA_RANGES = [
    (0x3000, 0x303F),  # CJK punctuation
    (0x3040, 0x30FF),  # kana
    (0xFF00, 0xFFEF),  # full-width forms
]


def collect_chars(root: Path) -> str:
    chars: set[str] = set()
    for entry in SCAN:
        target = root / entry
        paths = (
            [p for p in target.rglob('*') if p.suffix in SUFFIXES]
            if target.is_dir()
            else [target]
        )
        for path in paths:
            for ch in path.read_text(encoding='utf-8'):
                code = ord(ch)
                if any(low <= code <= high for low, high in EXTRA_RANGES):
                    chars.add(ch)
                elif 0x3400 <= code <= 0x4DBF or 0x4E00 <= code <= 0x9FFF:
                    chars.add(ch)
                elif 0xF900 <= code <= 0xFAFF:
                    chars.add(ch)
    return ''.join(sorted(chars))


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    chars = collect_chars(root)
    if len(chars) < 50:
        print(f'only {len(chars)} CJK characters found — refusing to write a useless subset')
        return 1

    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        source = tmp_dir / 'NotoSansSC.ttf'
        print(f'downloading source face -> {source.name}')
        urllib.request.urlretrieve(SOURCE_URL, source)

        pinned = tmp_dir / 'pinned.ttf'
        subprocess.run(
            [sys.executable, '-m', 'fontTools.varLib.instancer', str(source),
             f'wght={WEIGHT}', '-o', str(pinned), '-q'],
            check=True,
        )

        text_file = tmp_dir / 'chars.txt'
        text_file.write_text(chars, encoding='utf-8')

        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            [sys.executable, '-m', 'fontTools.subset', str(pinned),
             f'--text-file={text_file}', '--flavor=woff2',
             f'--output-file={OUTPUT}', '--layout-features=*',
             '--name-IDs=*', '--drop-tables=DSIG'],
            check=True,
        )

    print(f'{len(chars)} glyphs -> {OUTPUT} ({OUTPUT.stat().st_size / 1024:.1f} kB)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
