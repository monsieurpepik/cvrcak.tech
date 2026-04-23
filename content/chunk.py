"""
chunk.py: raw pages -> semantic chunks (~300 tokens each)

Usage:
    python chunk.py --in raw_pages.json --out chunks.json

Output: JSON list of { page_number, chapter_id, section, content } objects.
Requires: tiktoken
"""

import argparse
import json
import re
import tiktoken
from pathlib import Path

ENCODER = tiktoken.get_encoding("cl100k_base")
TARGET_TOKENS = 300
MAX_TOKENS = 500


def token_count(text: str) -> int:
    return len(ENCODER.encode(text))


def split_into_chunks(page_number: int, chapter_id: int, text: str) -> list[dict]:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks = []
    current = []
    current_tokens = 0

    for sentence in sentences:
        t = token_count(sentence)
        if current_tokens + t > MAX_TOKENS and current:
            chunks.append({
                "page_number": page_number,
                "chapter_id": chapter_id,
                "section": None,
                "content": " ".join(current),
            })
            current = []
            current_tokens = 0
        current.append(sentence)
        current_tokens += t

    if current:
        chunks.append({
            "page_number": page_number,
            "chapter_id": chapter_id,
            "section": None,
            "content": " ".join(current),
        })

    return chunks


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--in", dest="input", default="raw_pages.json")
    parser.add_argument("--out", default="chunks.json")
    args = parser.parse_args()

    pages = json.loads(Path(args.input).read_text())
    all_chunks = []

    for page in pages:
        chunks = split_into_chunks(page["page_number"], page["chapter_id"], page["text"])
        all_chunks.extend(chunks)
        print(f"Page {page['page_number']}: {len(chunks)} chunks")

    Path(args.out).write_text(json.dumps(all_chunks, ensure_ascii=False, indent=2))
    print(f"Total chunks: {len(all_chunks)}")


if __name__ == "__main__":
    main()
