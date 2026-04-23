"""
embed.py: chunks -> OpenAI embeddings -> Supabase pgvector

Usage:
    python embed.py --in chunks.json

Requires: openai, supabase, python-dotenv
Reads OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY from .env
"""

import argparse
import json
import os
import time
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client

load_dotenv()

EMBEDDING_MODEL = "text-embedding-3-large"
BATCH_SIZE = 20


def embed_batch(client: OpenAI, texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [item.embedding for item in response.data]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--in", dest="input", default="chunks.json")
    args = parser.parse_args()

    chunks = json.loads(Path(args.input).read_text())

    openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    supabase = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )

    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        texts = [c["content"] for c in batch]
        embeddings = embed_batch(openai_client, texts)

        rows = [
            {
                "textbook": "Matematika 5",
                "chapter_id": c["chapter_id"],
                "section": c.get("section"),
                "page_number": c["page_number"],
                "content": c["content"],
                "embedding": emb,
            }
            for c, emb in zip(batch, embeddings)
        ]

        supabase.table("chunks").insert(rows).execute()
        print(f"Inserted chunks {i + 1} to {i + len(batch)}")
        time.sleep(0.5)

    print("Done.")


if __name__ == "__main__":
    main()
