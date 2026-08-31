#!/usr/bin/env python3
"""Render the PDaC refund-fork demo as a terminal-style GIF.

Every output line shown is byte-real, captured from @prodshape/cli@0.13.0
in this session. Long lines wrap at the column limit with a hanging indent
instead of being clipped.
"""
from PIL import Image, ImageDraw, ImageFont

FONT_DIR = "/usr/share/fonts/truetype/dejavu/"
FONT = ImageFont.truetype(FONT_DIR + "DejaVuSansMono.ttf", 20)
FONT_B = ImageFont.truetype(FONT_DIR + "DejaVuSansMono-Bold.ttf", 20)
FONT_TITLE = ImageFont.truetype(FONT_DIR + "DejaVuSansMono-Bold.ttf", 26)

COLS = 72
ADV = FONT.getlength("M")          # monospace advance
LINE_H = 30
ROWS = 19                           # visible rows
PAD = 24
BAR_H = 40
W = int(PAD * 2 + COLS * ADV)
H = BAR_H + PAD + ROWS * LINE_H + PAD

BG = (13, 24, 41)        # blueprint deep navy
BAR = (9, 17, 30)
FG = (230, 237, 243)
DIM = (125, 139, 158)
GREEN = (86, 211, 100)
AMBER = (227, 179, 65)
CYAN = (108, 182, 255)
COMMENT = (100, 116, 139)
PROMPT = (86, 211, 100)

frames = []                # (PIL Image, duration ms)
buffer = []                # wrapped physical lines: list[list[(text,color,bold)]]


def wrap_segments(segments, indent="  "):
    """Wrap one logical line (list of (text,color,bold)) at COLS chars.

    Continuation lines get a hanging indent so nothing is clipped.
    """
    out, cur, cur_len, first = [], [], 0, True
    limit = COLS
    for text, color, bold in segments:
        while text:
            space = limit - cur_len
            if space <= 0:
                out.append(cur)
                cur, cur_len, first = [(indent, DIM, False)], len(indent), False
                continue
            chunk, text = text[:space], text[space:]
            cur.append((chunk, color, bold))
            cur_len += len(chunk)
    out.append(cur)
    return out


def render_frame(cursor=False, duration=60, endcard=None):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    # window chrome
    d.rectangle([0, 0, W, BAR_H], fill=BAR)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse([PAD + i * 26, BAR_H // 2 - 7, PAD + i * 26 + 14, BAR_H // 2 + 7], fill=c)
    title = "prodshape — citations verify"
    d.text((W / 2 - FONT.getlength(title) / 2, BAR_H / 2 - 12), title, font=FONT, fill=DIM)

    if endcard:
        y = H // 2 - len(endcard) * 22
        for line, color, big in endcard:
            f = FONT_TITLE if big else FONT
            d.text((W / 2 - f.getlength(line) / 2, y), line, font=f, fill=color)
            y += 46 if big else 34
    else:
        visible = buffer[-ROWS:]
        y = BAR_H + PAD
        for line in visible:
            x = PAD
            for text, color, bold in line:
                f = FONT_B if bold else FONT
                d.text((x, y), text, font=f, fill=color)
                x += ADV * len(text)
            y += LINE_H
        if cursor and visible:
            lx = PAD + ADV * sum(len(t) for t, _, _ in visible[-1])
            ly = BAR_H + PAD + (len(visible) - 1) * LINE_H
            d.rectangle([lx + 2, ly + 2, lx + ADV, ly + LINE_H - 6], fill=FG)
    frames.append((img, duration))


def add_line(segments, duration=70):
    buffer.extend(wrap_segments(segments))
    render_frame(duration=duration)


def type_command(cmd, comment=False, chunk=3, pre_pause=500, post_pause=400):
    color = COMMENT if comment else FG
    start = len(buffer)
    buffer.append([("$ ", PROMPT, True)])
    render_frame(cursor=True, duration=pre_pause)
    for i in range(0, len(cmd), chunk):
        shown = cmd[: i + chunk]
        buffer[start:] = wrap_segments([("$ ", PROMPT, True), (shown, color, not comment)])
        render_frame(cursor=True, duration=45)
    render_frame(cursor=True, duration=post_pause)


def pause(ms):
    render_frame(duration=ms)


def out(text, color=FG, bold=False, duration=70):
    add_line([(text, color, bold)], duration)


def out_status(status, file_ref, color):
    # real output separates columns with tabs (8-col stops); mimic with padding
    add_line([(f"{status:<8}", color, True), ("BR-REFUND-001   ", CYAN, False), (file_ref, FG, False)], 90)


def out_warning(text):
    add_line([("warning ", AMBER, True), ("PRODUCT061 ", AMBER, True), (text, DIM, False)], 110)


TIP = ("Tip: use --provider openspec for OpenSpec-aware verification that "
       "distinguishes current from archived material and enforces scope declarations.")

# ---------- ACT 1 ----------
type_command("# ACT 1 — the same rule, restated in three specs", comment=True, pre_pause=900)
type_command('grep -rn -i "refund" openspec/specs')
out("openspec/specs/billing/spec.md:4:Refunds are issued for purchases made in the last 30 days.")
out("openspec/specs/checkout/spec.md:4:Customers can request a refund within 30 days of delivery.")
out("openspec/specs/support/spec.md:3:## Refunds")
out("openspec/specs/support/spec.md:4:If the order is less than a month old, offer a refund.")
pause(600)
type_command('# purchase vs delivery vs "a month" — nobody decided that fork', comment=True)
pause(1900)

# ---------- ACT 2 ----------
type_command("# ACT 2 — define the rule once, with a stable ID", comment=True)
type_command("head -11 docs/product/model/business-rules/br-refund-001.md")
for line in ["---", "id: BR-REFUND-001", "type: business-rule", "title: Refund window",
             "status: active", "---", "", "## Rule", "",
             "Refunds are accepted within 30 days of delivery.", ""]:
    out(line, CYAN if line.startswith("id:") else FG, bold=line.startswith("id:"), duration=60)
pause(1100)
type_command("# every spec cites it instead of restating it", comment=True)
type_command("prodshape cite --id BR-REFUND-001 --file docs/product/model/business-rules/br-refund-001.md --form inline")
out('{pdac:cite id="BR-REFUND-001" digest="sha256:b5c5806732cb3e3f32a6b7da97fd3e712a1bb733b4bb50e2840874ae64713228"}', CYAN, duration=200)
pause(700)
type_command("tail -1 openspec/specs/checkout/spec.md")
out('Refunds follow BR-REFUND-001. {pdac:cite id="BR-REFUND-001" digest="sha256:b5c5806732cb3e3f32a6b7da97fd3e712a1bb733b4bb50e2840874ae64713228"}', FG, duration=200)
pause(900)
type_command("prodshape citations verify")
out_status("current", "openspec/specs/billing/spec.md:4", GREEN)
out_status("current", "openspec/specs/checkout/spec.md:4", GREEN)
out_status("current", "openspec/specs/support/spec.md:4", GREEN)
out("3 citation(s): 3 current, 0 stale, 0 tampered, 0 unresolved", FG, True, 200)
out(TIP, COMMENT, duration=90)
pause(1900)

# ---------- ACT 3 ----------
type_command("# ACT 3 — the rule changes through normal review", comment=True)
type_command("sed -i 's/30 days/14 days/' docs/product/model/business-rules/br-refund-001.md")
pause(400)
type_command("prodshape citations verify")
out_status("stale", "openspec/specs/billing/spec.md:4", AMBER)
out_status("stale", "openspec/specs/checkout/spec.md:4", AMBER)
out_status("stale", "openspec/specs/support/spec.md:4", AMBER)
out_warning("openspec/specs/billing/spec.md [BR-REFUND-001]: Citation of 'BR-REFUND-001' is stale: canonical content changed since the citation was recorded")
out_warning("openspec/specs/checkout/spec.md [BR-REFUND-001]: Citation of 'BR-REFUND-001' is stale: canonical content changed since the citation was recorded")
out_warning("openspec/specs/support/spec.md [BR-REFUND-001]: Citation of 'BR-REFUND-001' is stale: canonical content changed since the citation was recorded")
out("3 citation(s): 0 current, 3 stale, 0 tampered, 0 unresolved", FG, True, 200)
out(TIP, COMMENT, duration=90)
pause(800)
type_command("# every citing spec flagged, file:line — nobody had to remember", comment=True)
pause(2400)

# ---------- end card ----------
render_frame(duration=3500, endcard=[
    ("Define once. Cite everywhere.", FG, True),
    ("Drift gets caught.", AMBER, True),
    ("", FG, False),
    ("pdac.dev  ·  npm install -g @prodshape/cli", DIM, False),
    ("output recorded from @prodshape/cli@0.13.0", COMMENT, False),
])

imgs = [f[0].quantize(colors=128, dither=Image.Dither.NONE) for f in frames]
durs = [f[1] for f in frames]

import subprocess
import sys
from pathlib import Path

OUT_GIF = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "public" / "pdac-demo.gif"
imgs[0].save(
    str(OUT_GIF),
    save_all=True, append_images=imgs[1:], duration=durs, loop=0, optimize=True,
)
total = sum(durs) / 1000
print(f"frames={len(frames)} size={W}x{H} duration={total:.1f}s")

# Video variants for the site, derived from the GIF so they carry exactly the
# same frames and the same end card. Stretched 1.25x on purpose: the video
# reads a touch slower than the GIF. Requires ffmpeg.
SLOWDOWN = "1.25"
VF = f"setpts={SLOWDOWN}*PTS,scale=trunc(iw/2)*2:trunc(ih/2)*2"
common = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(OUT_GIF), "-vf", VF, "-fps_mode", "vfr", "-pix_fmt", "yuv420p"]
subprocess.run([*common, "-c:v", "libvpx-vp9", "-crf", "42", "-b:v", "0", "-row-mt", "1", str(OUT_GIF.with_name("pdac-demo.webm"))], check=True)
subprocess.run([*common, "-c:v", "libx264", "-preset", "veryslow", "-crf", "28", "-tune", "animation", "-movflags", "+faststart", str(OUT_GIF.with_name("pdac-demo.mp4"))], check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(OUT_GIF), "-vframes", "1", str(OUT_GIF.with_name("pdac-demo-poster.png"))], check=True)
print("video variants written next to the GIF")
