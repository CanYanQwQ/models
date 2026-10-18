#!/usr/bin/env python3
"""Rebuild the CJK display subsets shipped in public/fonts/.

The faces cover only the characters this page actually sets, which takes
Noto Sans SC from ~17 MB to ~20 kB per weight. Two weights ship: 400 for
running text and 600 for headings, because a single 600 face would set every
Chinese paragraph heavier than the Space Grotesk running beside it.

Run this after editing any copy in src/ or index.html, otherwise
newly added characters fall back to a system CJK face and the page mixes two
designs mid-sentence.

    python scripts/subset-font.py

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
WEIGHTS = (400, 600)
FONT_DIR = Path(__file__).resolve().parent.parent / 'public/fonts'

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

        text_file = tmp_dir / 'chars.txt'
        text_file.write_text(chars, encoding='utf-8')

        FONT_DIR.mkdir(parents=True, exist_ok=True)
        for weight in WEIGHTS:
            pinned = tmp_dir / f'pinned-{weight}.ttf'
            subprocess.run(
                [sys.executable, '-m', 'fontTools.varLib.instancer', str(source),
                 f'wght={weight}', '-o', str(pinned), '-q'],
                check=True,
            )

            output = FONT_DIR / f'noto-sans-sc-plaza-{weight}.woff2'
            subprocess.run(
                [sys.executable, '-m', 'fontTools.subset', str(pinned),
                 f'--text-file={text_file}', '--flavor=woff2',
                 f'--output-file={output}', '--layout-features=*',
                 '--name-IDs=*', '--drop-tables=DSIG'],
                check=True,
            )
            print(f'{len(chars)} glyphs -> {output.name} ({output.stat().st_size / 1024:.1f} kB)')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
