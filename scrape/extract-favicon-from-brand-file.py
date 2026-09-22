"""
Extracts the exact waveform-icon geometry from the official fonUFAL brand
file (marca-fonUFAL.ai) and generates public/favicon.svg from it.

The .ai file is PDF-compatible (default Illustrator export setting), so
PyMuPDF can read it directly: `pip install pymupdf`.

Usage:
  python scrape/extract-favicon-from-brand-file.py "path/to/marca-fonUFAL.ai"

Official palette (from identidade-visual-fonUFAL.pdf):
  Vermelho fonUFAL  #C4161C
  Azul fonUFAL      #005E9E
  Cinza fonUFAL     #939598
"""
import sys
import fitz  # pymupdf

def main(ai_path):
    doc = fitz.open(ai_path)
    page = doc[0]
    drawings = page.get_drawings()

    # The 17 waveform bars are ~4.8pt wide filled rects, clustered together on
    # the left side of the artboard (the wordmark glyphs sit to their right;
    # a handful of small subtitle-text fragments coincidentally share the
    # same width, so the x-position bound is needed to exclude those).
    bars = [
        (d['rect'].x0, d['rect'].y0, d['rect'].width, d['rect'].height, d.get('fill'))
        for d in drawings
        if abs(d['rect'].width - 4.8) < 0.3 and 255 < d['rect'].x0 < 370
    ]
    bars.sort()
    if len(bars) != 17:
        print(f'WARNING: expected 17 bars, found {len(bars)} — check the source file has not changed shape.')

    def tag(fill):
        r, g, b = fill
        if r > 0.6 and g < 0.2:
            return '#C4161C'
        if b > 0.4 and r < 0.2:
            return '#005E9E'
        return '#939598'

    min_x = min(b[0] for b in bars)
    max_x = max(b[0] + b[2] for b in bars)
    min_y = min(b[1] for b in bars)
    max_y = max(b[1] + b[3] for b in bars)
    icon_w = max_x - min_x
    icon_h = max_y - min_y

    canvas = 32
    bg_rx = 7
    target_w = 26  # icon width inside the square, leaving margin
    scale = target_w / icon_w
    scaled_h = icon_h * scale
    off_x = (canvas - target_w) / 2
    off_y = (canvas - scaled_h) / 2

    rects = []
    for x0, y0, w, h, fill in bars:
        svg_y = (max_y - (y0 + h))  # flip Y: PDF grows up, SVG grows down
        svg_x = (x0 - min_x)
        rx = w * 0.32 * scale
        rects.append(
            f'    <rect x="{svg_x*scale:.2f}" y="{svg_y*scale:.2f}" '
            f'width="{w*scale:.2f}" height="{h*scale:.2f}" rx="{rx:.2f}" fill="{tag(fill)}"/>'
        )

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {canvas} {canvas}">\n'
        f'  <rect width="{canvas}" height="{canvas}" rx="{bg_rx}" fill="#ffffff"/>\n'
        f'  <g transform="translate({off_x:.2f} {off_y:.2f})">\n'
        + '\n'.join(rects) +
        '\n  </g>\n</svg>\n'
    )

    out_path = 'public/favicon.svg'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f'Wrote {out_path} ({len(bars)} bars)')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python extract-favicon-from-brand-file.py <path to marca-fonUFAL.ai>')
        sys.exit(1)
    main(sys.argv[1])
