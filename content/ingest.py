"""
ingest.py: PDF -> raw text per page

Usage:
    python ingest.py --pdf path/to/matematika5.pdf --chapter 4 --out raw_pages.json

Output: JSON list of { page_number, text } objects for the target chapter range.
Requires: pdfplumber, pytesseract, Pillow
"""

import argparse
import json
import pdfplumber
import pytesseract
from PIL import Image
from pathlib import Path


def extract_page(page) -> str:
    text = page.extract_text() or ""
    if len(text.strip()) < 50:
        # Fallback to OCR for scanned pages
        img = page.to_image(resolution=300).original
        text = pytesseract.image_to_string(img, lang="srp")
    return text.strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--start-page", type=int, required=True, help="First PDF page of the chapter")
    parser.add_argument("--end-page", type=int, required=True, help="Last PDF page of the chapter")
    parser.add_argument("--chapter-id", type=int, default=4)
    parser.add_argument("--out", default="raw_pages.json")
    args = parser.parse_args()

    pages = []
    with pdfplumber.open(args.pdf) as pdf:
        for i in range(args.start_page - 1, args.end_page):
            page = pdf.pages[i]
            text = extract_page(page)
            pages.append({
                "page_number": i + 1,
                "chapter_id": args.chapter_id,
                "text": text,
            })
            print(f"Page {i + 1}: {len(text)} chars")

    Path(args.out).write_text(json.dumps(pages, ensure_ascii=False, indent=2))
    print(f"Wrote {len(pages)} pages to {args.out}")


if __name__ == "__main__":
    main()
