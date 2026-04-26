"""
generate_episode_dialogue.py: Generate Tema 4.2 episode using ElevenLabs text-to-dialogue API.

Splits the script into 5 sections by chapter marker (Uvod, Osnove, Primjer 1, Primjer 2, Sažetak).
Each section is generated as one coherent dialogue call with eleven_v3 model, so voices interact
naturally rather than being stitched line-by-line. Sections are joined at chapter seams with ffmpeg.

Usage:
    python3 generate_episode_dialogue.py
    python3 generate_episode_dialogue.py --upload
"""

import os
import re
import json
import subprocess
import tempfile
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

SCRIPT_PATH = Path(__file__).parent / "script-tema-4-2.md"
OUT_DIR = Path(__file__).parent
OUT_MP3 = OUT_DIR / "tema-4-2.mp3"
OUT_MARKERS = OUT_DIR / "tema-4-2-markers.json"

NASTAVNICA_VOICE = "VB7D8zswiztJjyl8LI3a"  # female teacher, South Slavic
MARKO_VOICE = "adxhr4Ei7ASJ3Cz7fxwX"       # boy voice, South Slavic

MODEL = "eleven_v3"


def parse_script(path: Path):
    """
    Parse script into sections. Each section contains:
      - label: chapter name
      - timestamp_seconds: int
      - lines: list of {"speaker": "N"|"M", "text": str}
    """
    text = path.read_text(encoding="utf-8")
    sections = []
    current_section = None

    for raw_line in text.splitlines():
        line = raw_line.strip()

        # Chapter marker: ## [POGLAVLJE: Uvod] ~ 0:00
        m = re.match(r"^##\s+\[POGLAVLJE:\s*(.+?)\]\s*~\s*([\d:]+)", line)
        if m:
            label = m.group(1).strip()
            ts = m.group(2).strip()
            parts = ts.split(":")
            seconds = int(parts[0]) * 60 + int(parts[1])
            current_section = {"label": label, "timestamp_seconds": seconds, "lines": []}
            sections.append(current_section)
            continue

        # Speaker line: NASTAVNICA: ... or MARKO: ...
        m = re.match(r"^(NASTAVNICA|MARKO):\s+(.+)$", line)
        if m and current_section is not None:
            speaker = "N" if m.group(1) == "NASTAVNICA" else "M"
            text_content = m.group(2).strip()
            current_section["lines"].append({"speaker": speaker, "text": text_content})

    return sections


def section_char_count(section):
    return sum(len(l["text"]) for l in section["lines"])


def synthesize_section(client, section: dict, idx: int) -> bytes:
    from elevenlabs import DialogueInput

    label = section["label"]
    lines = section["lines"]
    char_count = section_char_count(section)
    print(f"  [{idx+1}] {label}: {len(lines)} lines, {char_count} chars")

    inputs = [
        DialogueInput(
            text=l["text"],
            voice_id=NASTAVNICA_VOICE if l["speaker"] == "N" else MARKO_VOICE,
        )
        for l in lines
    ]

    audio_iter = client.text_to_dialogue.convert(
        model_id=MODEL,
        inputs=inputs,
    )
    data = b"".join(audio_iter)
    print(f"       -> {len(data):,} bytes")
    return data


def stitch_and_normalize(chunks: list[bytes], out_path: Path):
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        list_file = tmp / "list.txt"
        entries = []
        for i, data in enumerate(chunks):
            p = tmp / f"sec_{i:02d}.mp3"
            p.write_bytes(data)
            entries.append(f"file '{p}'")
        list_file.write_text("\n".join(entries))

        raw = tmp / "raw.mp3"
        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(list_file),
             "-c", "copy", str(raw)],
            check=True, capture_output=True,
        )

        # Normalize loudness, mono, 128kbps
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(raw),
             "-af", "loudnorm",
             "-ar", "44100", "-ac", "1", "-b:a", "128k",
             str(out_path)],
            check=True, capture_output=True,
        )


def upload_to_supabase(mp3_path: Path) -> str:
    from supabase import create_client

    sb = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )

    with open(mp3_path, "rb") as f:
        sb.storage.from_("audio").upload(
            f"poglavlje-4/{mp3_path.name}", f,
            {"content-type": "audio/mpeg", "upsert": "true"},
        )
    url = sb.storage.from_("audio").get_public_url(f"poglavlje-4/{mp3_path.name}")
    print(f"  MP3 uploaded: {url}")
    return url


def get_duration(mp3_path: Path) -> int:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(mp3_path)],
        capture_output=True, text=True, check=True,
    )
    return int(float(result.stdout.strip()))


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--upload", action="store_true", help="Upload to Supabase Storage after generation")
    args = parser.parse_args()

    from elevenlabs.client import ElevenLabs
    client = ElevenLabs(
        api_key=os.environ["ELEVENLABS_API_KEY"],
        timeout=None,  # no timeout — eleven_v3 dialogue can take 2+ min for large sections
    )

    print("Parsing script...")
    sections = parse_script(SCRIPT_PATH)
    print(f"  {len(sections)} sections:")
    for s in sections:
        print(f"    [{s['timestamp_seconds']:>3}s] {s['label']} — {len(s['lines'])} lines, {section_char_count(s)} chars")

    # Warn if any section is near the 2000-char limit
    for s in sections:
        if section_char_count(s) > 1800:
            print(f"  WARNING: {s['label']} has {section_char_count(s)} chars (limit ~2000)")

    print(f"\nGenerating {len(sections)} dialogue sections with ElevenLabs {MODEL}...")
    chunks = []
    for i, section in enumerate(sections):
        audio = synthesize_section(client, section, i)
        chunks.append(audio)

    print(f"\nStitching {len(chunks)} sections and normalizing -> {OUT_MP3.name}...")
    stitch_and_normalize(chunks, OUT_MP3)

    size_mb = OUT_MP3.stat().st_size / 1_000_000
    duration = get_duration(OUT_MP3)
    minutes = duration // 60
    seconds = duration % 60
    print(f"  Done: {size_mb:.1f} MB, {minutes}:{seconds:02d}")

    # Build chapter markers from section timestamps (these are approximate from script;
    # actual seams land at section boundaries in the stitched file)
    chapter_markers = [
        {"label": s["label"], "timestamp_seconds": s["timestamp_seconds"]}
        for s in sections
    ]
    OUT_MARKERS.write_text(json.dumps(chapter_markers, ensure_ascii=False, indent=2))
    print(f"  Markers: {OUT_MARKERS.name}")

    if args.upload:
        print("\nUploading to Supabase Storage...")
        mp3_url = upload_to_supabase(OUT_MP3)

        from supabase import create_client
        sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
        sb.table("episodes").upsert({
            "chapter_id": 4,
            "topic": "Sabiranje razlomaka sa različitim nazivnicima",
            "subtopic": "Tema 4.2",
            "audio_url": mp3_url,
            "duration_seconds": duration,
            "chapter_markers": chapter_markers,
            "learning_points": [
                "Razlomci s različitim nazivnicima ne mogu se odmah sabirati.",
                "Najpre treba pronaći najmanji zajednički nazivnik (NZN).",
                "NZN je najmanji broj koji je djeljiv s oba nazivnika.",
                "Svaki razlomak proširimo da dobijemo isti nazivnik.",
                "Tek tada sabiramo brojnike, nazivnik ostaje isti.",
            ],
        }).execute()
        print("  Episode row updated in Supabase.")
        print(f"\nAudio URL: {mp3_url}")
    else:
        print(f"\nDone. Run with --upload to push to Supabase.")
        print(f"Local file: {OUT_MP3}")


if __name__ == "__main__":
    main()
