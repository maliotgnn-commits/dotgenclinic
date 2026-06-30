from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from zipfile import ZipFile
import argparse
import hashlib
import json
import re
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "src" / "subpages-data.js"

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


CATEGORY_CONFIG = {
    "corporate": {
        "label": "Kurumsal",
        "heroTag": "Kurumsal Bilgiler",
        "duration": "Sürekli güncellenir",
        "sessionModel": "Bilgilendirme ve planlama",
        "recovery": "Anında erişim",
        "method": "Standartlaştırılmış kurumsal süreç yönetimi",
    },
    "hair": {
        "label": "Saç Ekimi ve Saç Tedavileri",
        "heroTag": "Saç Sağlığı",
        "duration": "4-8 saat",
        "sessionModel": "Tek operasyon + planlı kontroller",
        "recovery": "İlk iyileşme dönemi 7-14 gün",
        "method": "Modern mikro kanal teknikleriyle lokal anestezi",
    },
    "dental": {
        "label": "Diş Estetiği",
        "heroTag": "Gülümseme Tasarımı",
        "duration": "30-120 dakika",
        "sessionModel": "2-6 seans",
        "recovery": "İşleme göre değişir",
        "method": "Dijital planlama ve modern diş hekimliği protokolleri",
    },
    "plastic": {
        "label": "Estetik Cerrahi",
        "heroTag": "Cerrahi Estetik",
        "duration": "1-4 saat",
        "sessionModel": "Tek ameliyat + takip ziyaretleri",
        "recovery": "7-21 gün",
        "method": "Ameliyathane güvenlik standartlarına uygun cerrahi protokol",
    },
    "medical": {
        "label": "Medikal Estetik",
        "heroTag": "Minimal İnvaziv Tedaviler",
        "duration": "20-60 dakika",
        "sessionModel": "1-6 seans",
        "recovery": "Aynı gün sosyal yaşama dönüş",
        "method": "Minimal invaziv estetik tedavi protokolleri",
    },
    "longevity": {
        "label": "Fonksiyonel Sağlık",
        "heroTag": "Fonksiyonel Sağlık",
        "duration": "30-90 dakika",
        "sessionModel": "Program bazlı periyodik seanslar",
        "recovery": "Aynı gün",
        "method": "Kişiye özel fonksiyonel sağlık ve destekleyici bakım protokolleri",
    },
}

CATEGORY_ORDER = ["corporate", "hair", "dental", "plastic", "medical", "longevity"]

CATEGORY_SOURCE_DIRS = {
    "corporate": "Kurumsal",
    "hair": "Saç ekimi",
    "dental": "Diş Estetiği",
    "plastic": "Estetik Cerrahi",
    "medical": "Medikal Estetik",
    "longevity": "Longevity",
}

PAGE_SOURCES = [
    ("corporate", "vision-mission", "Vizyon ve Misyon"),
    ("corporate", "our-values", "Değerlerimiz"),
    ("corporate", "quality-policy", "Kalite Politikası"),
    ("corporate", "management", "Yönetim"),
    ("corporate", "our-doctors", "Doktorlarımız"),
    ("corporate", "health-tourism", "Sağlık Turizmi"),
    ("corporate", "representatives", "Temsilciler"),
    ("hair", "sapphire-fue-hair-transplant", "Safir FUE Saç Ekimi"),
    ("hair", "dhi-hair-transplant", "DHI Saç Ekimi"),
    ("hair", "stem-cell-hair-transplant", "Kök Hücre Destekli Saç Ekimi"),
    ("hair", "unshaven-hair-transplant", "Tıraşsız Saç Ekimi"),
    ("hair", "eyebrow-transplant", "Kaş Ekimi"),
    ("hair", "beard-mustache-transplant", "Sakal ve Bıyık Ekimi"),
    ("hair", "acell-prp", "ACell PRP Saç Tedavisi"),
    ("hair", "hair-laser", "Lazer Saç Tedavisi"),
    ("hair", "exosome-hair-treatment", "Eksozom Saç Terapisi"),
    ("dental", "dental-implant", "Diş İmplantı"),
    ("dental", "teeth-whitening", "Diş Beyazlatma"),
    ("dental", "hollywood-smile", "Hollywood Gülüşü"),
    ("dental", "orthodontics", "Ortodonti"),
    ("dental", "gingival-aesthetics", "Pembe Estetik"),
    ("dental", "zirconium-crown", "Zirkonyum Kaplama"),
    ("plastic", "breast-augmentation", "Meme Büyütme"),
    ("plastic", "breast-reduction", "Meme Küçültme"),
    ("plastic", "gynecomastia", "Jinekomasti Ameliyatı"),
    ("plastic", "rhinoplasty", "Rinoplasti"),
    ("plastic", "face-lift", "Yüz Germe"),
    ("plastic", "blepharoplasty", "Blefaroplasti"),
    ("plastic", "tummy-tuck", "Karın Germe"),
    ("plastic", "liposuction", "Liposuction"),
    ("plastic", "buttock-lift", "Kalça Kaldırma"),
    ("medical", "lip-filler", "Dudak Dolgusu"),
    ("medical", "botox", "Botoks"),
    ("medical", "jawline-filler", "Çene Hattı Dolgusu"),
    ("medical", "under-eye-light-filler", "Göz Altı Işık Dolgusu"),
    ("medical", "laser-hair-removal", "Lazer Epilasyon"),
    ("medical", "prp-skin-treatment", "PRP Cilt Tedavisi"),
    ("medical", "medical-skin-care", "Tıbbi Cilt Bakımı"),
    ("medical", "salmon-dna", "Somon DNA Tedavisi"),
    ("longevity", "healthy-nutrition", "Sağlıklı Beslenme"),
    ("longevity", "lpg-treatment", "LPG İşlemi"),
    ("longevity", "ozone-therapy", "Ozon Terapisi"),
    ("longevity", "iv-therapies", "İntravenöz (IV) Tedaviler"),
    ("longevity", "glutathione", "Glutatyon Terapisi"),
]

OVERVIEW_HEADINGS = {"Genel Bakış", "Overview"}
PROCESS_HEADINGS = {"Tedavi Süreci", "Tedavi Yolculuğu", "Tedavi Aşamaları"}
SUITABLE_HEADINGS = {"Kimler İçin Uygundur?", "Kimler İçin Uygun?", "Kimler İçindir?"}
QUICK_FACT_HEADINGS = {"Kısa Bilgiler", "Hızlı Bilgiler", "Özet Bilgiler"}
FAQ_HEADINGS = {"Sık Sorulan Sorular", "Sıkça Sorulan Sorular"}
RELATED_HEADINGS = {"İlgili Sayfalar", "İlgili Tedaviler"}

HIGHLIGHT_HEADINGS = {
    "Temel Özellikler",
    "Tedavi Yaklaşımımız",
    "Tedavi Yaklaşımımızın Temel Unsurları",
    "Temel Yaklaşım",
    "Temel İlkeler",
    "Tedavinin Avantajları",
    "Kalite Odaklı Yaklaşımımızın Temel Unsurları:",
    "Protokol",
}

FACT_LABEL_ALIASES = {
    "İşlem Süresi": "Süre",
    "Süre": "Süre",
    "Tedavi Modeli": "Tedavi Modeli",
    "Tedavi modeli": "Tedavi Modeli",
    "Uygulama Modeli": "Tedavi Modeli",
    "Tedavi Planı": "Tedavi Modeli",
    "İlk İyileşme Süreci": "İyileşme",
    "İyileşme Süreci": "İyileşme",
    "İyileşme ve Erişim": "İyileşme",
    "Günlük Yaşama Dönüş": "İyileşme",
    "Sosyal Hayata Dönüş": "İyileşme",
    "İyileşme": "İyileşme",
    "Anestezi": "Anestezi",
    "Yöntem": "Yöntem",
}


@dataclass(frozen=True)
class SourceParagraph:
    key: str
    text: str
    is_list: bool


def normalize(value: str) -> str:
    lowered = value.casefold()
    lowered = lowered.replace("ı", "i").replace("İ".casefold(), "i")
    return re.sub(r"[^a-z0-9]+", "", lowered)


def clean_text(value: str) -> str:
    value = value.replace("\u00a0", " ")
    return re.sub(r"\s+", " ", value).strip()


def split_bullet_line(index: int, text: str, is_list: bool) -> list[SourceParagraph]:
    if "•" not in text:
        return [SourceParagraph(str(index), text, is_list)]
    parts = [clean_text(part) for part in text.split("•")]
    return [
        SourceParagraph(f"{index}:{part_index}", part, True)
        for part_index, part in enumerate(parts)
        if part
    ]


def read_docx(path: Path) -> list[SourceParagraph]:
    with ZipFile(path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))

    paragraphs: list[SourceParagraph] = []
    for index, paragraph in enumerate(root.findall(".//w:body/w:p", NS)):
        text = "".join(node.text or "" for node in paragraph.findall(".//w:t", NS))
        text = clean_text(text)
        is_list = paragraph.find("./w:pPr/w:numPr", NS) is not None
        if not text:
            paragraphs.append(SourceParagraph(str(index), "", False))
            continue
        paragraphs.extend(split_bullet_line(index, text, is_list))
    return paragraphs


def paragraph_hash(paragraphs: list[SourceParagraph]) -> str:
    body = "\n".join(item.text for item in paragraphs if item.text)
    return hashlib.sha256(body.encode("utf-8")).hexdigest()


def category_for_path(path: Path) -> str:
    normalized_parts = {normalize(part) for part in path.parts}
    for category, directory in CATEGORY_SOURCE_DIRS.items():
        if normalize(directory) in normalized_parts:
            return category
    raise RuntimeError(f"Could not determine category for DOCX: {path}")


def load_documents(content_dir: Path) -> list[dict]:
    documents = []
    for path in sorted(content_dir.rglob("*.docx"), key=lambda item: str(item).casefold()):
        paragraphs = read_docx(path)
        documents.append(
            {
                "path": path,
                "category": category_for_path(path.relative_to(content_dir)),
                "paragraphs": paragraphs,
                "hash": paragraph_hash(paragraphs),
            }
        )
    return documents


def title_candidates(paragraphs: list[SourceParagraph]) -> list[str]:
    return [item.text for item in paragraphs if item.text][:12]


def find_doc_by_title(title: str, category: str, documents: list[dict]) -> dict:
    wanted = normalize(title)
    matches = []
    for document in documents:
        if document["category"] != category:
            continue
        filename_match = normalize(document["path"].stem) == wanted
        content_match = any(
            normalize(item) == wanted
            or normalize(item).startswith(wanted)
            or wanted.startswith(normalize(item))
            for item in title_candidates(document["paragraphs"])
        )
        if filename_match or content_match:
            matches.append(document)

    if not matches:
        raise RuntimeError(f"No DOCX content found for {category}/{title}")

    matches.sort(
        key=lambda item: (
            normalize(item["path"].stem) != wanted,
            len(str(item["path"])),
            str(item["path"]).casefold(),
        )
    )
    return matches[0]


def nonempty(paragraphs: list[SourceParagraph]) -> list[SourceParagraph]:
    return [item for item in paragraphs if item.text]


def heading_index(
    paragraphs: list[SourceParagraph],
    headings: set[str],
    start: int = 0,
) -> int | None:
    wanted = {normalize(item) for item in headings}
    for index in range(start, len(paragraphs)):
        if paragraphs[index].text and normalize(paragraphs[index].text) in wanted:
            return index
    return None


def process_heading_index(paragraphs: list[SourceParagraph]) -> int | None:
    wanted = {normalize(item) for item in PROCESS_HEADINGS}
    for index, item in enumerate(paragraphs):
        if not item.text or normalize(item.text) not in wanted:
            continue
        next_item = next(
            (candidate for candidate in paragraphs[index + 1 :] if candidate.text),
            None,
        )
        if next_item and (
            re.fullmatch(r"\d{1,2}", next_item.text)
            or re.match(r"^\d{1,2}\s*(?:\||\.|-|–|—)\s*.+$", next_item.text)
        ):
            return index
    return None


def first_blank_after(
    paragraphs: list[SourceParagraph],
    start: int,
    fallback: int,
) -> int:
    saw_content = False
    for index in range(start, min(fallback, len(paragraphs))):
        if paragraphs[index].text:
            saw_content = True
        elif saw_content:
            return index
    return fallback


def overview_end_index(
    paragraphs: list[SourceParagraph],
    start: int,
    fallback: int,
) -> int:
    blank_boundary = first_blank_after(paragraphs, start, fallback)
    saw_body = False
    for index in range(start, min(blank_boundary, fallback)):
        item = paragraphs[index]
        if not item.text:
            continue
        if not saw_body:
            saw_body = True
            continue
        if (
            not item.is_list
            and len(item.text) <= 110
            and len(item.text.split()) <= 16
            and item.text.endswith("?")
        ):
            return index
    return blank_boundary


def split_groups(paragraphs: list[SourceParagraph]) -> list[list[SourceParagraph]]:
    groups: list[list[SourceParagraph]] = []
    current: list[SourceParagraph] = []
    for item in paragraphs:
        if item.text:
            current.append(item)
        elif current:
            groups.append(current)
            current = []
    if current:
        groups.append(current)
    return groups


def looks_like_subheading(
    current: SourceParagraph,
    next_item: SourceParagraph | None,
) -> bool:
    if current.is_list or next_item is None:
        return False
    if len(current.text) > 90 or len(current.text.split()) > 12:
        return False
    if current.text.endswith((".", "!", ";", ":")):
        return False
    return (
        current.text.endswith("?")
        or next_item.is_list
        or len(next_item.text) > 90
        or next_item.text.endswith((".", "!", "?", ":"))
    )


def detail_blocks(items: list[SourceParagraph]) -> list[dict]:
    blocks: list[dict] = []
    index = 0
    while index < len(items):
        item = items[index]
        if item.is_list:
            values = []
            while index < len(items) and items[index].is_list:
                values.append(items[index].text)
                index += 1
            blocks.append({"type": "list", "items": values})
            continue

        next_item = items[index + 1] if index + 1 < len(items) else None
        if looks_like_subheading(item, next_item):
            blocks.append({"type": "subheading", "text": item.text})
        else:
            blocks.append({"type": "paragraph", "text": item.text})
        index += 1
    return blocks


def process_steps(items: list[SourceParagraph]) -> list[dict]:
    source = nonempty(items)
    steps = []
    index = 0
    while index < len(source):
        marker = source[index].text
        standalone = re.fullmatch(r"\d{1,2}", marker)
        inline = re.match(r"^\d{1,2}\s*(?:\||\.|-|–|—)\s*(.+)$", marker)
        if standalone:
            if index + 2 >= len(source):
                raise RuntimeError(f"Incomplete process step: {marker}")
            title = source[index + 1].text
            description = source[index + 2].text
            index += 3
        elif inline:
            rest = inline.group(1).strip()
            joined_parts = re.split(
                r"(?<=[a-zçğıöşü])(?=[A-ZÇĞİÖŞÜ])",
                rest,
                maxsplit=1,
            )
            if len(joined_parts) == 2:
                title, description = (part.strip() for part in joined_parts)
                index += 1
            else:
                if index + 1 >= len(source):
                    raise RuntimeError(f"Missing process description: {marker}")
                title = rest
                description = source[index + 1].text
                index += 2
        else:
            raise RuntimeError(f"Unexpected process paragraph: {marker}")
        steps.append({"title": title, "description": description})
    return steps


def suitable_content(items: list[SourceParagraph]) -> tuple[str, list[str]]:
    source = nonempty(items)
    first_list = next((index for index, item in enumerate(source) if item.is_list), None)
    if first_list is None:
        return "", [item.text for item in source]
    intro = " ".join(item.text for item in source[:first_list] if not item.is_list)
    values = [item.text for item in source[first_list:]]
    return intro, values


def quick_facts(items: list[SourceParagraph], category: str) -> list[dict]:
    source_text = " ".join(item.text for item in nonempty(items))
    aliases = sorted(FACT_LABEL_ALIASES, key=len, reverse=True)
    pattern = re.compile(
        rf"(?P<label>{'|'.join(re.escape(item) for item in aliases)})\s*:\s*",
        flags=re.IGNORECASE,
    )
    matches = list(pattern.finditer(source_text))
    if not matches:
        config = CATEGORY_CONFIG[category]
        return [
            {"label": "Süre", "value": config["duration"]},
            {"label": "Tedavi Modeli", "value": config["sessionModel"]},
            {"label": "İyileşme", "value": config["recovery"]},
            {"label": "Yöntem", "value": config["method"]},
        ]

    facts = []
    alias_by_normalized = {normalize(key): value for key, value in FACT_LABEL_ALIASES.items()}
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(source_text)
        value = source_text[match.end() : end].strip()
        if not value:
            raise RuntimeError(f"Empty quick fact value after {match.group('label')}")
        label = alias_by_normalized[normalize(match.group("label"))]
        facts.append({"label": label, "value": value})
    return facts


def faq_items(items: list[SourceParagraph]) -> list[dict]:
    source = nonempty(items)
    faqs = []
    index = 0
    while index < len(source):
        text = source[index].text
        if "?" not in text:
            raise RuntimeError(f"FAQ answer without a question: {text}")
        question_text, inline_answer = text.split("?", 1)
        question = question_text.strip() + "?"
        inline_answer = inline_answer.strip()
        index += 1
        if inline_answer:
            answer = inline_answer
        else:
            answer_parts = []
            while index < len(source) and "?" not in source[index].text:
                answer_parts.append(source[index].text)
                index += 1
            answer = " ".join(answer_parts).strip()
        if not answer:
            raise RuntimeError(f"FAQ question has no answer: {question}")
        faqs.append({"question": question, "answer": answer})
    return faqs


def summary_and_subtitle(
    header_items: list[SourceParagraph],
    title: str,
    hero_tag: str,
    overview: list[str],
) -> tuple[str, str]:
    excluded = {normalize(title), normalize(hero_tag)}
    candidates = [item.text for item in nonempty(header_items) if normalize(item.text) not in excluded]
    summary = next((item for item in candidates if len(item) >= 80), overview[0] if overview else "")
    subtitle = next((item for item in candidates if item != summary and len(item) < 80), "")
    return summary, subtitle


def build_page(category: str, slug: str, title: str, document: dict) -> tuple[dict, dict]:
    paragraphs = document["paragraphs"]
    consumed: set[str] = set()
    ignored: set[str] = set()

    overview_heading = heading_index(paragraphs, OVERVIEW_HEADINGS)
    process_heading = process_heading_index(paragraphs)
    suitable_heading = heading_index(paragraphs, SUITABLE_HEADINGS)
    quick_heading = heading_index(paragraphs, QUICK_FACT_HEADINGS)
    faq_heading = heading_index(paragraphs, FAQ_HEADINGS)
    related_heading = heading_index(paragraphs, RELATED_HEADINGS)

    required = {
        "overview": overview_heading,
        "process": process_heading,
        "suitable": suitable_heading,
        "quick facts": quick_heading,
        "FAQ": faq_heading,
    }
    missing = [label for label, index in required.items() if index is None]
    if missing:
        raise RuntimeError(f"{title}: missing structural headings: {', '.join(missing)}")

    assert overview_heading is not None
    assert process_heading is not None
    assert suitable_heading is not None
    assert quick_heading is not None
    assert faq_heading is not None
    related_boundary = related_heading if related_heading is not None else len(paragraphs)

    order = [
        overview_heading,
        process_heading,
        suitable_heading,
        quick_heading,
        faq_heading,
        related_boundary,
    ]
    if order != sorted(order):
        raise RuntimeError(f"{title}: structural headings are out of order")

    header_items = paragraphs[:overview_heading]
    consumed.update(item.key for item in header_items if item.text)
    consumed.add(paragraphs[overview_heading].key)

    overview_end = overview_end_index(
        paragraphs,
        overview_heading + 1,
        process_heading,
    )
    overview_records = nonempty(paragraphs[overview_heading + 1 : overview_end])
    consumed.update(item.key for item in overview_records)
    overview = [item.text for item in overview_records]
    if not overview:
        raise RuntimeError(f"{title}: overview is empty")

    details = []
    highlights: list[str] = []
    detail_source = paragraphs[overview_end:process_heading]
    for group in split_groups(detail_source):
        section_title = group[0].text
        body = group[1:]
        consumed.update(item.key for item in group)
        if normalize(section_title) in {normalize(item) for item in HIGHLIGHT_HEADINGS}:
            highlights.extend(item.text for item in body)
            continue
        details.append({"title": section_title, "blocks": detail_blocks(body)})

    for heading in [process_heading, suitable_heading, quick_heading, faq_heading]:
        consumed.add(paragraphs[heading].key)

    process = process_steps(paragraphs[process_heading + 1 : suitable_heading])
    consumed.update(
        item.key
        for item in paragraphs[process_heading + 1 : suitable_heading]
        if item.text
    )

    suitable_intro, suitable_for = suitable_content(
        paragraphs[suitable_heading + 1 : quick_heading]
    )
    consumed.update(
        item.key
        for item in paragraphs[suitable_heading + 1 : quick_heading]
        if item.text
    )

    facts = quick_facts(paragraphs[quick_heading + 1 : faq_heading], category)
    consumed.update(
        item.key
        for item in paragraphs[quick_heading + 1 : faq_heading]
        if item.text
    )

    faqs = faq_items(paragraphs[faq_heading + 1 : related_boundary])
    consumed.update(
        item.key
        for item in paragraphs[faq_heading + 1 : related_boundary]
        if item.text
    )

    if related_heading is not None:
        ignored.update(item.key for item in paragraphs[related_heading:] if item.text)

    summary, hero_subtitle = summary_and_subtitle(
        header_items,
        title,
        CATEGORY_CONFIG[category]["heroTag"],
        overview,
    )

    all_source_keys = {item.key for item in paragraphs if item.text}
    uncovered = sorted(all_source_keys - consumed - ignored)
    if uncovered:
        snippets = [
            next(item.text for item in paragraphs if item.key == key)
            for key in uncovered[:5]
        ]
        raise RuntimeError(f"{title}: uncovered source paragraphs: {snippets}")

    page = {
        "category": category,
        "slug": slug,
        "navLabel": title,
        "title": title,
        "categoryLabel": CATEGORY_CONFIG[category]["label"],
        "heroTag": CATEGORY_CONFIG[category]["heroTag"],
        "heroSubtitle": hero_subtitle,
        "summary": summary,
        "images": {
            "hero": f"/images/site/categories/{category}.webp",
            "content": f"/images/site/pages/{slug}.webp",
        },
        "overview": overview,
        "sections": details,
        "highlights": highlights,
        "suitableIntro": suitable_intro,
        "suitableFor": suitable_for,
        "quickFacts": facts,
        "process": process,
        "faqs": faqs,
    }
    coverage = {
        "sourceParagraphs": len(all_source_keys),
        "renderedParagraphs": len(consumed),
        "ignoredRelatedParagraphs": len(ignored),
        "uncoveredParagraphs": len(uncovered),
    }
    return page, coverage


def render_js(pages: list[dict]) -> str:
    payload = json.dumps(
        {
            "categoryConfig": CATEGORY_CONFIG,
            "categoryOrder": CATEGORY_ORDER,
            "pages": pages,
        },
        ensure_ascii=False,
        indent=2,
    )
    return f"""const DATA = {payload};

export const CATEGORY_CONFIG = DATA.categoryConfig;

export const CATEGORY_ORDER = DATA.categoryOrder;

export const SUBPAGES = DATA.pages.map((page) => ({{ ...page }}));

export const SUBPAGES_BY_SLUG = Object.fromEntries(SUBPAGES.map((item) => [item.slug, item]));

export const CATEGORY_GROUPS = CATEGORY_ORDER
  .map((categoryKey) => {{
    const categoryConfig = CATEGORY_CONFIG[categoryKey];
    const items = SUBPAGES
      .filter((item) => item.category === categoryKey)
      .map((item) => ({{
        slug: item.slug,
        navLabel: item.navLabel,
        title: item.title,
      }}));

    return {{
      key: categoryKey,
      label: categoryConfig.label,
      items,
    }};
  }})
  .filter((group) => group.items.length > 0);

export const NAV_LINK_MAP = Object.fromEntries(SUBPAGES.map((item) => [item.navLabel, item.slug]));

export function serviceUrlFor(slug) {{
  return `/service.html?slug=${{encodeURIComponent(slug)}}`;
}}

export function defaultRelatedPages(page, limit = 4) {{
  if (!page) return [];
  return SUBPAGES
    .filter((item) => item.category === page.category && item.slug !== page.slug)
    .slice(0, limit)
    .map((item) => ({{
      slug: item.slug,
      title: item.title,
      summary: item.summary,
    }}));
}}

export function applySubcategoryLinks(root = document) {{
  const links = root.querySelectorAll('.mega-dropdown a, .service-link[data-service-slug], .popular-item[data-service-slug]');

  links.forEach((link) => {{
    const explicitSlug = link.getAttribute('data-service-slug');
    const label = link.textContent.trim();
    const slug = explicitSlug || NAV_LINK_MAP[label];

    if (slug && SUBPAGES_BY_SLUG[slug]) {{
      link.setAttribute('href', serviceUrlFor(slug));
    }}
  }});
}}
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate website subpage data from the categorized DOCX content tree."
    )
    parser.add_argument(
        "--content-dir",
        required=True,
        type=Path,
        help="Directory containing the categorized DOCX files; searched recursively.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Generated JavaScript output (default: {DEFAULT_OUTPUT}).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    content_dir = args.content_dir.resolve()
    if not content_dir.is_dir():
        raise RuntimeError(f"Content directory does not exist: {content_dir}")

    documents = load_documents(content_dir)
    pages = []
    coverages = []
    used_paths: set[Path] = set()
    used_hashes: set[str] = set()

    for category, slug, title in PAGE_SOURCES:
        document = find_doc_by_title(title, category, documents)
        if document["path"] in used_paths:
            raise RuntimeError(f"DOCX was matched to more than one page: {document['path']}")
        if document["hash"] in used_hashes:
            raise RuntimeError(f"Duplicate page content selected for {title}: {document['path']}")
        page, coverage = build_page(category, slug, title, document)
        pages.append(page)
        coverages.append({"slug": slug, **coverage})
        used_paths.add(document["path"])
        used_hashes.add(document["hash"])

    unused_documents = [item for item in documents if item["path"] not in used_paths]
    unexpected_unused = [item for item in unused_documents if item["hash"] not in used_hashes]
    if unexpected_unused:
        paths = [str(item["path"]) for item in unexpected_unused]
        raise RuntimeError(f"Unmatched unique DOCX files: {paths}")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(render_js(pages), encoding="utf-8")

    category_counts = {
        category: sum(page["category"] == category for page in pages)
        for category in CATEGORY_ORDER
    }
    print(
        json.dumps(
            {
                "contentDir": str(content_dir),
                "docxFiles": len(documents),
                "pages": len(pages),
                "categoryCounts": category_counts,
                "uniqueContentHashesUsed": len(used_hashes),
                "sourceParagraphs": sum(item["sourceParagraphs"] for item in coverages),
                "renderedParagraphs": sum(item["renderedParagraphs"] for item in coverages),
                "ignoredRelatedParagraphs": sum(
                    item["ignoredRelatedParagraphs"] for item in coverages
                ),
                "uncoveredParagraphs": sum(
                    item["uncoveredParagraphs"] for item in coverages
                ),
                "unusedDuplicateFiles": [
                    str(item["path"].relative_to(content_dir))
                    for item in unused_documents
                ],
                "output": str(args.output.resolve()),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
