from __future__ import annotations

import math
from pathlib import Path
from typing import List, Tuple

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1080
HEIGHT = 1920
FPS = 30
DURATION = 30
TOTAL_FRAMES = FPS * DURATION

BRAND_TEAL = (65, 165, 185)
BRAND_TEAL_DARK = (45, 138, 158)
BRAND_TEAL_LIGHT = (174, 222, 222)
BRAND_CREAM = (235, 206, 141)
WHITE = (250, 252, 247)
INK = (26, 58, 64)
INK_MID = (61, 107, 117)
BORDER = (200, 232, 236)

SCRIPT_DIR = Path(__file__).resolve().parent
APP_DIR = Path(r"C:\Users\HonestFan\Pictures\Guitars\images\March\cathel-creamy-pwa\cathel-creamy-pwa")
CLIENT_LOGO = APP_DIR / "client-logo.png"
RAY_LOGO = APP_DIR / "LOGOO.jpeg"
OUTPUT = SCRIPT_DIR / "cathdel_creamy_mockup_ad_30s.mp4"


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates: List[Path] = []
    if bold:
        candidates.extend(
            [
                Path(r"C:\Windows\Fonts\segoeuib.ttf"),
                Path(r"C:\Windows\Fonts\arialbd.ttf"),
                Path(r"C:\Windows\Fonts\bahnschrift.ttf"),
            ]
        )
    else:
        candidates.extend(
            [
                Path(r"C:\Windows\Fonts\segoeui.ttf"),
                Path(r"C:\Windows\Fonts\arial.ttf"),
                Path(r"C:\Windows\Fonts\bahnschrift.ttf"),
            ]
        )

    for font_path in candidates:
        if font_path.exists():
            return ImageFont.truetype(str(font_path), size=size)
    return ImageFont.load_default()


FONT_H1 = load_font(64, bold=True)
FONT_H2 = load_font(42, bold=True)
FONT_H3 = load_font(30, bold=True)
FONT_BODY = load_font(26, bold=False)
FONT_SMALL = load_font(22, bold=False)
FONT_TINY = load_font(18, bold=False)


SCENES = [
    {
        "start": 0,
        "end": 3,
        "title": "Sales, Loyalty and Analytics in One App",
        "subtitle": "Built for fast school-break selling on mobile, tablet, and desktop.",
        "chip": "Overview",
        "ui": "overview",
        "bg": ((20, 68, 86), BRAND_TEAL),
        "tab": "Showcase",
    },
    {
        "start": 3,
        "end": 7,
        "title": "Issue Customer QR Codes Instantly",
        "subtitle": "Register once, generate a unique QR, and identify buyers in seconds.",
        "chip": "Step 1",
        "ui": "qr_issue",
        "bg": ((25, 84, 99), (76, 176, 191)),
        "tab": "Customers",
    },
    {
        "start": 7,
        "end": 11,
        "title": "Scan or Select to Start Checkout",
        "subtitle": "Queue-friendly workflow for high traffic break windows.",
        "chip": "Step 2",
        "ui": "scan",
        "bg": ((20, 71, 92), (71, 156, 183)),
        "tab": "Sell",
    },
    {
        "start": 11,
        "end": 15,
        "title": "Capture Every Transaction Detail",
        "subtitle": "Product, quantity, payment method, and time of sale.",
        "chip": "Step 3",
        "ui": "checkout",
        "bg": ((24, 78, 96), (88, 177, 196)),
        "tab": "Sell",
    },
    {
        "start": 15,
        "end": 19,
        "title": "Automated Loyalty Tracking",
        "subtitle": "Repeat purchases are tracked and reward eligibility is flagged.",
        "chip": "Step 4",
        "ui": "loyalty",
        "bg": ((31, 95, 108), (101, 193, 207)),
        "tab": "Loyalty",
    },
    {
        "start": 19,
        "end": 23,
        "title": "Business Intelligence Dashboard",
        "subtitle": "Monitor revenue, orders, units sold, activity, and trends.",
        "chip": "Step 5",
        "ui": "dashboard",
        "bg": ((24, 70, 92), (73, 143, 175)),
        "tab": "Dashboard",
    },
    {
        "start": 23,
        "end": 27,
        "title": "Targeted WhatsApp Outreach",
        "subtitle": "Segment customers by loyalty status or inactivity.",
        "chip": "Step 6",
        "ui": "broadcast",
        "bg": ((34, 113, 93), (74, 179, 140)),
        "tab": "Broadcast",
    },
    {
        "start": 27,
        "end": 30,
        "title": "Demo Data Only for Confidentiality",
        "subtitle": "All names and numbers shown are synthetic sample data.",
        "chip": "Data Safety",
        "ui": "cta",
        "bg": (BRAND_TEAL_DARK, BRAND_TEAL),
        "tab": "Showcase",
    },
]


def make_gradient(top: Tuple[int, int, int], bottom: Tuple[int, int, int]) -> Image.Image:
    arr = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
    for c in range(3):
        arr[:, :, c] = np.linspace(top[c], bottom[c], HEIGHT, dtype=np.uint8).reshape(HEIGHT, 1)
    img = Image.fromarray(arr, mode="RGB")
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (255, 255, 255, 0))
    d = ImageDraw.Draw(overlay)
    d.ellipse((WIDTH - 450, -150, WIDTH + 280, 430), fill=(255, 255, 255, 30))
    d.ellipse((-220, HEIGHT - 480, 500, HEIGHT + 180), fill=(235, 206, 141, 30))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> List[str]:
    lines: List[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            attempt = f"{current} {word}"
            width = draw.textbbox((0, 0), attempt, font=font)[2]
            if width <= max_width:
                current = attempt
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return lines


def draw_center_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.ImageFont,
    color: Tuple[int, int, int],
    center_x: int,
    y: int,
    max_width: int,
    line_gap: int = 8,
) -> int:
    lines = wrap_text(draw, text, font, max_width)
    cy = y
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        draw.text((center_x - w // 2, cy), line, fill=color, font=font)
        cy += h + line_gap
    return cy


def rounded_rect(draw: ImageDraw.ImageDraw, box: Tuple[int, int, int, int], radius: int, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_qr_pattern(draw: ImageDraw.ImageDraw, x: int, y: int, size: int) -> None:
    modules = 25
    cell = size / modules

    def is_finder(mx: int, my: int) -> bool:
        zones = [(0, 0), (modules - 7, 0), (0, modules - 7)]
        for zx, zy in zones:
            if zx <= mx < zx + 7 and zy <= my < zy + 7:
                return True
        return False

    for my in range(modules):
        for mx in range(modules):
            if is_finder(mx, my):
                continue
            bit = ((mx * 17 + my * 13 + 7) % 23) % 2 == 0
            if bit:
                draw.rectangle(
                    (
                        x + mx * cell,
                        y + my * cell,
                        x + (mx + 1) * cell,
                        y + (my + 1) * cell,
                    ),
                    fill=(20, 28, 36),
                )

    def draw_finder(fx: int, fy: int):
        fxp = x + fx * cell
        fyp = y + fy * cell
        draw.rectangle((fxp, fyp, fxp + 7 * cell, fyp + 7 * cell), fill=(20, 28, 36))
        draw.rectangle((fxp + cell, fyp + cell, fxp + 6 * cell, fyp + 6 * cell), fill=WHITE)
        draw.rectangle((fxp + 2 * cell, fyp + 2 * cell, fxp + 5 * cell, fyp + 5 * cell), fill=(20, 28, 36))

    draw_finder(0, 0)
    draw_finder(modules - 7, 0)
    draw_finder(0, modules - 7)


def draw_app_shell(
    frame: Image.Image,
    draw: ImageDraw.ImageDraw,
    box: Tuple[int, int, int, int],
    active_tab: str,
    app_logo: Image.Image,
) -> Tuple[int, int, int, int]:
    x1, y1, x2, y2 = box
    w = x2 - x1

    rounded_rect(draw, (x1, y1, x2, y2), 52, fill=(10, 18, 28), outline=(190, 220, 225), width=3)
    notch_w = int(w * 0.34)
    rounded_rect(
        draw,
        (x1 + (w - notch_w) // 2, y1 + 12, x1 + (w + notch_w) // 2, y1 + 30),
        12,
        fill=(17, 25, 34),
    )

    sx1, sy1, sx2, sy2 = x1 + 20, y1 + 26, x2 - 20, y2 - 20
    rounded_rect(draw, (sx1, sy1, sx2, sy2), 34, fill=(234, 248, 250), outline=BORDER, width=2)

    header_h = 124
    rounded_rect(draw, (sx1 + 10, sy1 + 10, sx2 - 10, sy1 + header_h), 20, fill=BRAND_TEAL, outline=(55, 150, 169), width=2)
    frame.alpha_composite(app_logo, (sx1 + 20, sy1 + 22))
    draw.text((sx1 + 126, sy1 + 30), "Cathdel Creamy", fill=WHITE, font=FONT_SMALL)
    draw.text((sx1 + 126, sy1 + 58), "Business Manager", fill=(220, 244, 248), font=FONT_TINY)
    draw.text((sx2 - 150, sy1 + 28), "Wed 11 Mar", fill=(226, 247, 250), font=FONT_TINY)
    draw.ellipse((sx2 - 46, sy1 + 58, sx2 - 28, sy1 + 76), fill=(75, 212, 129))

    nav_y = sy1 + header_h + 16
    rounded_rect(draw, (sx1 + 10, nav_y, sx2 - 10, nav_y + 56), 14, fill=(245, 252, 253), outline=BORDER, width=2)
    tabs = ["Sell", "Loyalty", "Dashboard", "Broadcast", "Settings"]
    tx = sx1 + 26
    for tab in tabs:
        tab_w = draw.textbbox((0, 0), tab, font=FONT_TINY)[2] + 26
        fill = BRAND_TEAL if tab == active_tab else (255, 255, 255)
        txt = WHITE if tab == active_tab else INK_MID
        rounded_rect(draw, (tx, nav_y + 10, tx + tab_w, nav_y + 46), 16, fill=fill, outline=(148, 205, 214), width=1)
        draw.text((tx + 13, nav_y + 19), tab, fill=txt, font=FONT_TINY)
        tx += tab_w + 8

    content_y = nav_y + 72
    rounded_rect(
        draw,
        (sx1 + 14, content_y, sx2 - 14, content_y + 40),
        12,
        fill=(255, 246, 228),
        outline=(232, 196, 138),
        width=2,
    )
    draw.text((sx1 + 26, content_y + 11), "DEMO DATA ONLY  -  fake names and fake numbers", fill=(145, 95, 30), font=FONT_TINY)

    return (sx1 + 18, content_y + 54, sx2 - 18, sy2 - 20)


def draw_overview(draw: ImageDraw.ImageDraw, box: Tuple[int, int, int, int]) -> None:
    x1, y1, x2, _ = box
    w = x2 - x1
    rounded_rect(draw, (x1, y1, x2, y1 + 140), 14, fill=WHITE, outline=BORDER, width=2)
    draw.text((x1 + 14, y1 + 16), "Live Usage Snapshot", fill=INK, font=FONT_SMALL)
    draw.text((x1 + 16, y1 + 60), "Revenue: R12 480", fill=INK_MID, font=FONT_TINY)
    draw.text((x1 + w // 2, y1 + 60), "Orders: 428", fill=INK_MID, font=FONT_TINY)
    draw.text((x1 + 16, y1 + 92), "Customers: 173", fill=INK_MID, font=FONT_TINY)
    draw.text((x1 + w // 2, y1 + 92), "Rewards: 34", fill=INK_MID, font=FONT_TINY)

    items = [
        "Track sales at point of sale",
        "Issue and scan customer QR codes",
        "Automate loyalty and outreach",
    ]
    yy = y1 + 158
    for idx, item in enumerate(items, start=1):
        rounded_rect(draw, (x1, yy, x2, yy + 80), 14, fill=WHITE, outline=BORDER, width=2)
        draw.text((x1 + 14, yy + 22), f"{idx}. {item}", fill=INK, font=FONT_TINY)
        yy += 92


def draw_qr_issue(draw: ImageDraw.ImageDraw, box: Tuple[int, int, int, int]) -> None:
    x1, y1, x2, _ = box
    w = x2 - x1
    left_w = int(w * 0.58)

    rounded_rect(draw, (x1, y1, x1 + left_w, y1 + 420), 14, fill=WHITE, outline=BORDER, width=2)
    draw.text((x1 + 14, y1 + 16), "New Customer Registration", fill=INK, font=FONT_SMALL)
    fields = [
        ("Parent Name", "Naledi Molefe (Demo)"),
        ("Child Name", "Ari Molefe (Demo)"),
        ("Grade / Class", "Grade 4"),
        ("WhatsApp", "079 000 2211"),
    ]
    fy = y1 + 58
    for label, value in fields:
        draw.text((x1 + 16, fy), label, fill=INK_MID, font=FONT_TINY)
        rounded_rect(draw, (x1 + 16, fy + 20, x1 + left_w - 16, fy + 64), 10, fill=(247, 252, 253), outline=BORDER, width=2)
        draw.text((x1 + 28, fy + 34), value, fill=INK, font=FONT_TINY)
        fy += 78
    rounded_rect(draw, (x1 + 16, fy + 4, x1 + left_w - 16, fy + 58), 12, fill=BRAND_TEAL, outline=(55, 146, 165), width=2)
    draw.text((x1 + 30, fy + 21), "Save & Generate QR", fill=WHITE, font=FONT_TINY)

    qx1 = x1 + left_w + 14
    rounded_rect(draw, (qx1, y1, x2, y1 + 420), 14, fill=WHITE, outline=BORDER, width=2)
    draw.text((qx1 + 14, y1 + 16), "Customer QR (Issued)", fill=INK, font=FONT_SMALL)
    qr_size = min(220, x2 - qx1 - 28)
    qrx = qx1 + (x2 - qx1 - qr_size) // 2
    qry = y1 + 66
    rounded_rect(draw, (qrx - 10, qry - 10, qrx + qr_size + 10, qry + qr_size + 10), 10, fill=WHITE, outline=(180, 200, 210), width=2)
    draw_qr_pattern(draw, qrx, qry, qr_size)
    draw.text((qx1 + 16, qry + qr_size + 20), "QR ID: CC-DEMO-1042", fill=INK, font=FONT_TINY)
    draw.text((qx1 + 16, qry + qr_size + 50), "Ready to scan at checkout", fill=INK_MID, font=FONT_TINY)


def draw_scan(draw: ImageDraw.ImageDraw, box: Tuple[int, int, int, int]) -> None:
    x1, y1, x2, _ = box
    w = x2 - x1
    rounded_rect(draw, (x1, y1, x2, y1 + 340), 14, fill=(12, 24, 30), outline=(42, 84, 94), width=2)
    sx1 = x1 + 68
    sx2 = x2 - 68
    sy1 = y1 + 56
    sy2 = y1 + 284
    draw.rectangle((sx1, sy1, sx2, sy2), outline=(121, 234, 250), width=4)
    draw.line((sx1 + 10, (sy1 + sy2) // 2, sx2 - 10, (sy1 + sy2) // 2), fill=(121, 234, 250), width=3)
    draw.text((x1 + 24, y1 + 300), "Point camera at customer QR code", fill=(180, 220, 228), font=FONT_TINY)

    rounded_rect(draw, (x1, y1 + 360, x1 + w // 2 - 8, y1 + 440), 12, fill=WHITE, outline=BORDER, width=2)
    rounded_rect(draw, (x1 + w // 2 + 8, y1 + 360, x2, y1 + 440), 12, fill=BRAND_CREAM, outline=(212, 176, 112), width=2)
    draw.text((x1 + 24, y1 + 391), "Scan QR", fill=INK, font=FONT_TINY)
    draw.text((x1 + w // 2 + 28, y1 + 391), "Select Student", fill=INK, font=FONT_TINY)


def draw_checkout(draw: ImageDraw.ImageDraw, box: Tuple[int, int, int, int]) -> None:
    x1, y1, x2, _ = box
    draw.text((x1, y1), "Sale for Naledi Molefe (Demo)", fill=INK, font=FONT_SMALL)
    y = y1 + 44
    for name, qty, price in [("R6 Ice Cream", "x2", "R12"), ("Choc Dip Stick", "x1", "R10"), ("Family Pack", "x1", "R100")]:
        rounded_rect(draw, (x1, y, x2, y + 68), 12, fill=WHITE, outline=BORDER, width=2)
        draw.text((x1 + 14, y + 20), name, fill=INK, font=FONT_TINY)
        draw.text((x2 - 190, y + 20), qty, fill=INK_MID, font=FONT_TINY)
        draw.text((x2 - 95, y + 20), price, fill=BRAND_TEAL_DARK, font=FONT_TINY)
        y += 80

    rounded_rect(draw, (x1, y + 8, x2, y + 94), 12, fill=WHITE, outline=BORDER, width=2)
    draw.text((x1 + 14, y + 38), "Payment: Card", fill=INK_MID, font=FONT_TINY)
    draw.text((x2 - 180, y + 30), "TOTAL R122", fill=INK, font=FONT_H3)
    rounded_rect(draw, (x1, y + 118, x2, y + 196), 14, fill=BRAND_TEAL, outline=(55, 146, 165), width=2)
    draw.text((x1 + 20, y + 147), "Record Sale", fill=WHITE, font=FONT_SMALL)


def draw_loyalty(draw: ImageDraw.ImageDraw, box: Tuple[int, int, int, int]) -> None:
    x1, y1, x2, _ = box
    draw.text((x1, y1), "Loyalty Tracker", fill=INK, font=FONT_SMALL)
    y = y1 + 46
    customers = [("Naledi Molefe (Demo)", 8), ("Sizwe Khumalo (Demo)", 5), ("Ari Molefe (Demo)", 9)]
    for name, stamps in customers:
        rounded_rect(draw, (x1, y, x2, y + 120), 12, fill=WHITE, outline=BORDER, width=2)
        draw.text((x1 + 14, y + 14), name, fill=INK, font=FONT_TINY)
        for i in range(10):
            cx = x1 + 16 + i * 46
            cy = y + 58
            fill = BRAND_CREAM if i < stamps else (233, 244, 246)
            outline = (212, 176, 112) if i < stamps else BORDER
            draw.ellipse((cx, cy, cx + 28, cy + 28), fill=fill, outline=outline, width=2)
        draw.text((x2 - 110, y + 92), f"{stamps}/10", fill=BRAND_TEAL_DARK, font=FONT_TINY)
        y += 136


def draw_dashboard(draw: ImageDraw.ImageDraw, box: Tuple[int, int, int, int]) -> None:
    x1, y1, x2, _ = box
    w = x2 - x1
    draw.text((x1, y1), "Dashboard", fill=INK, font=FONT_SMALL)

    stats = [("Revenue", "R12 480"), ("Orders", "428"), ("Units", "882"), ("Customers", "173")]
    y = y1 + 44
    for idx, (label, value) in enumerate(stats):
        col = idx % 2
        row = idx // 2
        bx = x1 + col * (w // 2 + 8)
        by = y + row * 90
        rounded_rect(draw, (bx, by, bx + w // 2 - 8, by + 76), 12, fill=WHITE, outline=BORDER, width=2)
        draw.text((bx + 12, by + 12), label, fill=INK_MID, font=FONT_TINY)
        draw.text((bx + 12, by + 36), value, fill=INK, font=FONT_SMALL)

    cy = y + 192
    rounded_rect(draw, (x1, cy, x2, cy + 208), 12, fill=WHITE, outline=BORDER, width=2)
    draw.text((x1 + 12, cy + 12), "Sales Trend (Last 7 Days)", fill=INK, font=FONT_TINY)
    bars = [0.4, 0.58, 0.53, 0.74, 0.92, 0.81, 0.68]
    for i, val in enumerate(bars):
        bx = x1 + 22 + i * 76
        by = cy + 178 - int(120 * val)
        rounded_rect(draw, (bx, by, bx + 44, cy + 178), 8, fill=BRAND_TEAL, outline=(55, 146, 165), width=1)


def draw_broadcast(draw: ImageDraw.ImageDraw, box: Tuple[int, int, int, int]) -> None:
    x1, y1, x2, _ = box
    draw.text((x1, y1), "WhatsApp Broadcast", fill=INK, font=FONT_SMALL)
    rounded_rect(draw, (x1, y1 + 44, x2, y1 + 156), 12, fill=WHITE, outline=BORDER, width=2)
    draw.text((x1 + 12, y1 + 66), "Promo Brain recommends 23 contacts", fill=INK, font=FONT_TINY)
    draw.text((x1 + 12, y1 + 96), "Segment: Inactive this week", fill=INK_MID, font=FONT_TINY)

    rounded_rect(draw, (x1, y1 + 170, x2, y1 + 332), 12, fill=(232, 245, 233), outline=(178, 225, 188), width=2)
    msg = "Hi from Cathdel Creamy.\nDemo promo: Buy 2 get 1 free today.\nReply YES to reserve."
    draw.multiline_text((x1 + 14, y1 + 194), msg, fill=(29, 69, 40), font=FONT_TINY, spacing=8)
    rounded_rect(draw, (x1, y1 + 348, x2, y1 + 424), 14, fill=(37, 211, 102), outline=(18, 171, 79), width=2)
    draw.text((x1 + 18, y1 + 376), "Open WhatsApp", fill=WHITE, font=FONT_SMALL)


def draw_cta(draw: ImageDraw.ImageDraw, box: Tuple[int, int, int, int]) -> None:
    x1, y1, x2, _ = box
    rounded_rect(draw, (x1, y1, x2, y1 + 340), 16, fill=WHITE, outline=BORDER, width=2)
    draw.text((x1 + 16, y1 + 18), "Cathdel Creamy", fill=INK, font=FONT_H2)
    draw.text((x1 + 16, y1 + 90), "Sell faster", fill=BRAND_TEAL_DARK, font=FONT_SMALL)
    draw.text((x1 + 16, y1 + 126), "Reward more", fill=BRAND_TEAL_DARK, font=FONT_SMALL)
    draw.text((x1 + 16, y1 + 162), "Grow daily revenue", fill=BRAND_TEAL_DARK, font=FONT_SMALL)
    draw.text((x1 + 16, y1 + 212), "Confidentiality safe demo", fill=INK, font=FONT_TINY)
    draw.text((x1 + 16, y1 + 238), "All displayed customer records are synthetic.", fill=INK_MID, font=FONT_TINY)
    rounded_rect(draw, (x1 + 16, y1 + 270, x2 - 16, y1 + 324), 12, fill=BRAND_TEAL, outline=(55, 146, 165), width=2)
    draw.text((x1 + 34, y1 + 288), "Install and start selling smarter", fill=WHITE, font=FONT_TINY)


def draw_app_content(draw: ImageDraw.ImageDraw, ui_type: str, content_box: Tuple[int, int, int, int]) -> None:
    if ui_type == "overview":
        draw_overview(draw, content_box)
    elif ui_type == "qr_issue":
        draw_qr_issue(draw, content_box)
    elif ui_type == "scan":
        draw_scan(draw, content_box)
    elif ui_type == "checkout":
        draw_checkout(draw, content_box)
    elif ui_type == "loyalty":
        draw_loyalty(draw, content_box)
    elif ui_type == "dashboard":
        draw_dashboard(draw, content_box)
    elif ui_type == "broadcast":
        draw_broadcast(draw, content_box)
    elif ui_type == "cta":
        draw_cta(draw, content_box)


def scene_for_time(t: float) -> dict:
    for s in SCENES:
        if s["start"] <= t < s["end"]:
            return s
    return SCENES[-1]


def blend_scene_bg(scene_a: dict, scene_b: dict, alpha: float, cache: dict) -> Image.Image:
    key_a = ("bg", scene_a["start"])
    key_b = ("bg", scene_b["start"])
    if key_a not in cache:
        cache[key_a] = make_gradient(scene_a["bg"][0], scene_a["bg"][1])
    if key_b not in cache:
        cache[key_b] = make_gradient(scene_b["bg"][0], scene_b["bg"][1])
    if alpha <= 0:
        return cache[key_a].copy()
    if alpha >= 1:
        return cache[key_b].copy()
    return Image.blend(cache[key_a], cache[key_b], alpha)


def main() -> None:
    if not CLIENT_LOGO.exists() or not RAY_LOGO.exists():
        raise FileNotFoundError("Brand logos not found in app directory.")

    app_logo = Image.open(CLIENT_LOGO).convert("RGBA")
    ray_logo = Image.open(RAY_LOGO).convert("RGBA")

    app_logo_small = app_logo.copy()
    app_logo_small.thumbnail((90, 60), Image.Resampling.LANCZOS)
    app_logo_brand = app_logo.copy()
    app_logo_brand.thumbnail((260, 140), Image.Resampling.LANCZOS)
    ray_logo.thumbnail((170, 94), Image.Resampling.LANCZOS)

    bg_cache: dict = {}
    writer = imageio.get_writer(
        str(OUTPUT),
        fps=FPS,
        codec="libx264",
        quality=8,
        pixelformat="yuv420p",
        macro_block_size=1,
    )

    for frame_idx in range(TOTAL_FRAMES):
        t = frame_idx / FPS
        scene = scene_for_time(t)
        next_scene_idx = SCENES.index(scene) + 1
        transition_alpha = 0.0
        if scene["end"] - t < 0.35 and next_scene_idx < len(SCENES):
            transition_alpha = 1.0 - (scene["end"] - t) / 0.35
        next_scene = SCENES[next_scene_idx] if next_scene_idx < len(SCENES) else scene

        frame = blend_scene_bg(scene, next_scene, max(0.0, min(1.0, transition_alpha)), bg_cache).convert("RGBA")
        draw = ImageDraw.Draw(frame)

        frame.alpha_composite(app_logo_brand, (36, 20))
        frame.alpha_composite(ray_logo, (WIDTH - ray_logo.width - 30, 24))
        draw.text((WIDTH - ray_logo.width - 28, 18), "Data Insights by Ray", fill=WHITE, font=FONT_TINY)

        chip_text = scene["chip"]
        chip_w = draw.textbbox((0, 0), chip_text, font=FONT_TINY)[2] + 34
        rounded_rect(
            draw,
            (40, 198, 40 + chip_w, 242),
            16,
            fill=(255, 255, 255, 52),
            outline=(255, 255, 255, 132),
            width=2,
        )
        draw.text((56, 210), chip_text, fill=WHITE, font=FONT_TINY)

        y_after_title = draw_center_text(draw, scene["title"], FONT_H1, WHITE, WIDTH // 2, 278, WIDTH - 130, line_gap=8)
        draw_center_text(draw, scene["subtitle"], FONT_BODY, (229, 245, 249), WIDTH // 2, y_after_title + 12, WIDTH - 170, line_gap=7)

        local_t = (t - scene["start"]) / max(0.001, (scene["end"] - scene["start"]))
        bob = int(math.sin(local_t * math.pi * 2) * 8)
        card_w = 630
        card_h = 1120
        cx = WIDTH // 2
        card_x1 = cx - card_w // 2
        card_y1 = 728 + bob
        card_x2 = card_x1 + card_w
        card_y2 = card_y1 + card_h

        rounded_rect(draw, (card_x1 - 12, card_y1 - 14, card_x2 + 12, card_y2 + 14), 60, fill=(7, 18, 26, 84))
        content = draw_app_shell(frame, draw, (card_x1, card_y1, card_x2, card_y2), scene["tab"], app_logo_small)
        draw_app_content(draw, scene["ui"], content)

        writer.append_data(np.array(frame.convert("RGB")))
        if frame_idx % 90 == 0:
            print(f"Rendered frame {frame_idx}/{TOTAL_FRAMES}")

    writer.close()
    print(f"Done: {OUTPUT}")


if __name__ == "__main__":
    main()

