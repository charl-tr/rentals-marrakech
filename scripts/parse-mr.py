#!/usr/bin/env python3
"""Parse marrakechrealty.com fiche HTML files into structured JSON."""
import json
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
FICHES_DIR = PROJECT_ROOT / "scripts" / "fixtures" / "fiches"
OUT_FILE = PROJECT_ROOT / "scripts" / "fixtures" / "properties.json"

# Allow override via CLI: `python parse-mr.py <fiches_dir> <out_file>`
if len(sys.argv) >= 2:
    FICHES_DIR = Path(sys.argv[1])
if len(sys.argv) >= 3:
    OUT_FILE = Path(sys.argv[2])


def clean_html(html: str) -> str:
    h = re.sub(r"<script[\s\S]*?</script>", "", html, flags=re.I)
    h = re.sub(r"<style[\s\S]*?</style>", "", h, flags=re.I)
    h = re.sub(r"<!--[\s\S]*?-->", "", h)
    # Strip Wayback Machine toolbar/banner (injected at top of archived pages)
    h = re.sub(
        r"<!-- BEGIN WAYBACK TOOLBAR INSERT -->[\s\S]*?<!-- END WAYBACK TOOLBAR INSERT -->",
        "",
        h,
    )
    h = re.sub(r'<div[^>]*id="wm-[^"]*"[\s\S]*?</div>', "", h)
    # Unwrap Wayback URLs back to their original form so parsing works uniformly
    # Pattern: /web/20250815185630/https://www.marrakechrealty.com/... → https://www.marrakechrealty.com/...
    h = re.sub(
        r"https?://web\.archive\.org/web/\d+(?:im_|cs_)?/(https?://[^\"'\s>]+)",
        r"\1",
        h,
    )
    h = re.sub(r"/web/\d+(?:im_|cs_)?/(https?://[^\"'\s>]+)", r"\1", h)
    return h


def text_lines(html: str) -> list[str]:
    text = re.sub(r"<[^>]+>", "\n", html)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&euro;", "€", text)
    text = re.sub(r"&rsquo;", "'", text)
    text = re.sub(r"&lsquo;", "'", text)
    text = re.sub(r"&ldquo;", '"', text)
    text = re.sub(r"&rdquo;", '"', text)
    text = re.sub(r"&#8211;", "–", text)
    text = re.sub(r"&#8217;", "'", text)
    text = re.sub(r"&#039;", "'", text)
    text = re.sub(r"&amp;", "&", text)
    return [l.strip() for l in text.split("\n") if l.strip()]


def first_match(pattern, text, group=1, flags=re.I | re.S):
    m = re.search(pattern, text, flags)
    return m.group(group).strip() if m else None


def extract_fiche(html: str, url_path: str) -> dict | None:
    clean = clean_html(html)
    lines = text_lines(clean)

    # H1 = title
    h1 = first_match(r"<h1[^>]*>([\s\S]*?)</h1>", clean)
    if h1:
        h1 = re.sub(r"<[^>]+>", "", h1)
        h1 = re.sub(r"\s+", " ", h1).strip()
        h1 = (
            h1.replace("&rsquo;", "'")
            .replace("&#8211;", "–")
            .replace("&euro;", "€")
            .replace("&#8217;", "'")
            .replace("&#039;", "'")
            .replace("&amp;", "&")
        )

    # Slug from URL (last non-empty segment)
    parts = [p for p in url_path.split("/") if p]
    slug = parts[-1] if parts else ""

    # Listing type — premier segment (vente|location|programme|essaouira)
    listing_segment = parts[0] if parts else ""
    listing = {
        "vente": "vente",
        "location": "location",
        "programme": "programme-neuf",
        "essaouira": "vente",  # fiches essaouira — on les traite en vente par défaut
    }.get(listing_segment, "vente")

    # Reference
    ref = first_match(r"R[ée]f\s*:?\s*([A-Z0-9]+)", " ".join(lines[:50]))

    # Status — from MR badge class .bien-options.bg-{loue|vendu|new|compromis}
    status = "available"
    badge = re.search(
        r'<div class="bien-options[^"]*?\bbg-(loue|vendu|new|compromis)\b',
        clean,
        re.I,
    )
    if badge:
        status = {
            "loue": "rented",
            "vendu": "sold",
            "new": "new",
            "compromis": "reserved",
        }[badge.group(1).lower()]

    # Find the "Caractéristiques du bien" block — it has labelled rows
    # We use the line-list approach: find labels and take the value on the next line.
    def field_after(label: str) -> str | None:
        for i, l in enumerate(lines):
            if l.strip().lower().rstrip(":").strip() == label.lower():
                # Next non-empty line
                for nxt in lines[i + 1 : i + 4]:
                    if nxt and nxt.lower() not in {label.lower() + " :", label.lower()}:
                        return nxt
        return None

    type_bien_raw = field_after("Type de bien")
    # Format like "vente / Villa" or "vente / Riad rénové"
    type_bien = None
    if type_bien_raw and "/" in type_bien_raw:
        type_bien = type_bien_raw.split("/")[1].strip()
    elif type_bien_raw:
        type_bien = type_bien_raw

    ville = field_after("Ville") or field_after("Quartier")
    surface_terrain = field_after("Surface terrain")
    surface_habitable = field_after("Surface habitable")
    bedrooms = field_after("Nombre de chambres") or field_after("Chambres")

    def to_int(s: str | None) -> int | None:
        if not s:
            return None
        m = re.search(r"(\d+)", s.replace(" ", ""))
        return int(m.group(1)) if m else None

    surface_terrain_n = to_int(surface_terrain)
    surface_habitable_n = to_int(surface_habitable)
    bedrooms_n = to_int(bedrooms)

    # Prices: les refs du type "VMK329" contiennent des digits qui se collent
    # au prix dans le texte ("VMK329 495 000 €" → on ne veut capter que 495 000).
    # On strip d'abord toute ref connue + les suffixes numériques des refs.
    def first_price(unit_pattern: str, text: str) -> int | None:
        # Match one to three digits, then groups of exactly 3 digits separated by space
        m = re.search(
            r"(?<![\d])(\d{1,3}(?:[\s\u00a0]\d{3})+)\s*" + unit_pattern,
            text,
            re.I,
        )
        if not m:
            return None
        return int(re.sub(r"\s", "", m.group(1)))

    joined = " ".join(lines)
    # Retirer la ref du texte pour éviter la concat "VMK329" + "495 000"
    if ref:
        joined = re.sub(r"\bR[ée]f\s*:?\s*" + re.escape(ref), "", joined, flags=re.I)
        joined = re.sub(r"\b" + re.escape(ref) + r"\b", "", joined)
    price_eur = first_price(r"€", joined)
    price_mad = first_price(r"(?:Dhs|MAD)", joined)

    # Sanity check : prix vente réaliste (50k-20M€), location (200-50k€)
    if price_eur is not None:
        if listing == "vente" and not (50_000 <= price_eur <= 20_000_000):
            price_eur = None  # valeur suspect, on préfère null à faux
        elif listing == "location" and not (200 <= price_eur <= 50_000):
            price_eur = None

    # Description: capture everything between "Description du bien" and "Caractéristiques du bien"
    description_lines = []
    capturing = False
    for l in lines:
        if l == "Description du bien":
            capturing = True
            continue
        if capturing and l in {"Caractéristiques du bien", "Equipements"}:
            break
        if capturing:
            description_lines.append(l)
    description = "\n".join(description_lines)

    # Equipments: lines after "Equipements" until "Besoin"
    equipements = []
    capturing = False
    for l in lines:
        if l == "Equipements":
            capturing = True
            continue
        if capturing and (
            l.startswith("Besoin")
            or l.startswith("Pour obtenir")
            or l.startswith("Nos annonces")
        ):
            break
        if capturing and len(l) < 60:  # likely a tag
            equipements.append(l)

    # Images : keep only /wp-content/uploads/ paths that look like property photos
    # (skip logos, icons, related-property thumbs >=585x380)
    raw_imgs = re.findall(
        r'(?:src|data-src|data-orig-file)=["\']'
        r"(https://www\.marrakechrealty\.com/wp-content/uploads/"
        r'[^"\']+?\.(?:jpg|jpeg|png|webp))',
        clean,
        re.I,
    )
    imgs = []
    seen = set()
    for u in raw_imgs:
        # Strip ?v=... query
        u_norm = re.sub(r"\?.*$", "", u)
        if u_norm in seen:
            continue
        # Skip obvious icons/logos and similar-property thumbs
        low = u_norm.lower()
        if any(
            s in low
            for s in [
                "logo",
                "favicon",
                "icon",
                "-66x66",
                "-585x380",
                "-150x",
                "-300x",
                "-200x200",
            ]
        ):
            continue
        seen.add(u_norm)
        imgs.append(u_norm)

    return {
        "url": url_path,
        "slug": slug,
        "ref": ref,
        "title": h1,
        "listing": listing,
        "status": status,
        "typeBien": type_bien,
        "ville": ville,
        "bedrooms": bedrooms_n,
        "surfaceTerrain": surface_terrain_n,
        "surfaceHabitable": surface_habitable_n,
        "priceEur": price_eur,
        "priceMad": price_mad,
        "description": description,
        "equipements": equipements,
        "images": imgs[:10],
    }


def main():
    if not FICHES_DIR.exists():
        sys.exit(f"No fiches dir at {FICHES_DIR}")
    out = []
    for f in sorted(FICHES_DIR.glob("*.html")):
        # Reconstruct URL from filename (was: vente_slug.html → vente/slug)
        stem = f.stem
        if "_" in stem:
            parts = stem.split("_", 1)
            url_path = "/".join(parts)
        else:
            url_path = stem
        try:
            # errors='replace' pour tolérer les bytes invalides (quelques fiches MR
            # ont du windows-1252 mal déclaré)
            html = f.read_text(encoding="utf-8", errors="replace")
            data = extract_fiche(html, url_path)
            if data:
                out.append(data)
                print(
                    f"OK  {data['ref'] or '?'} | {data['typeBien'] or '?'} | "
                    f"{data['priceEur'] or '?'}€ | {data['title'][:60] if data['title'] else '?'}"
                )
        except Exception as e:
            print(f"ERR {f.name}: {e}")
    OUT_FILE.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    print(f"\n{len(out)} fiches → {OUT_FILE}")


if __name__ == "__main__":
    main()
