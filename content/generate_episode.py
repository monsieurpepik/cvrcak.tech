"""
generate_episode.py: Generate full Tema 4.2 episode with ElevenLabs.

Parses script-tema-4-2.md, synthesizes each line with the correct voice,
stitches into a normalized mono mp3, produces a chapter-markers JSON sidecar,
and optionally uploads to Supabase Storage.

Usage:
    python3 generate_episode.py
    python3 generate_episode.py --upload
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

NASTAVNICA_VOICE = "VB7D8zswiztJjyl8LI3a"  # female teacher, Bosnian/South Slavic
MARKO_VOICE = "adxhr4Ei7ASJ3Cz7fxwX"  # boy voice, Bosnian/South Slavic

MODEL = "eleven_multilingual_v2"


def parse_script(path: Path):
    text = path.read_text(encoding="utf-8")
    lines = []
    chapter_markers = []

    for raw_line in text.splitlines():
        line = raw_line.strip()

        # Chapter marker: ## [POGLAVLJE: Uvod] ~ 0:00
        m = re.match(r"^##\s+\[POGLAVLJE:\s*(.+?)\]\s*~\s*([\d:]+)", line)
        if m:
            label = m.group(1).strip()
            ts = m.group(2).strip()
            # Convert mm:ss to seconds
            parts = ts.split(":")
            seconds = int(parts[0]) * 60 + int(parts[1])
            chapter_markers.append({"label": label, "timestamp_seconds": seconds})
            continue

        # Speaker line: NASTAVNICA: ... or MARKO: ...
        m = re.match(r"^(NASTAVNICA|MARKO):\s+(.+)$", line)
        if m:
            speaker = "N" if m.group(1) == "NASTAVNICA" else "M"
            text_content = m.group(2).strip()
            lines.append({"speaker": speaker, "text": text_content})

    return lines, chapter_markers


def synthesize_line(client, text: str, voice_id: str, index: int) -> bytes:
    from elevenlabs import VoiceSettings

    audio = client.text_to_speech.convert(
        voice_id=voice_id,
        text=text,
        model_id=MODEL,
        voice_settings=VoiceSettings(
            stability=0.5,
            similarity_boost=0.75,
            style=0.3,
            use_speaker_boost=True,
        ),
        output_format="mp3_44100_128",
    )
    data = b"".join(audio)
    print(f"  [{index:02d}] {'N' if voice_id == NASTAVNICA_VOICE else 'M'} {len(data):,}b  {text[:60]}...")
    return data


def stitch_and_normalize(chunks: list[bytes], out_path: Path):
    with tempfile.TemporaryDirectory() as tmp:
        list_file = Path(tmp) / "list.txt"
        entries = []
        for i, data in enumerate(chunks):
            p = Path(tmp) / f"seg_{i:04d}.mp3"
            p.write_bytes(data)
            entries.append(f"file '{p}'")
        list_file.write_text("\n".join(entries))

        raw = Path(tmp) / "raw.mp3"
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


def upload_to_supabase(mp3_path: Path, markers_path: Path):
    from supabase import create_client

    sb = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )

    # Upload mp3
    with open(mp3_path, "rb") as f:
        sb.storage.from_("audio").upload(
            f"poglavlje-4/{mp3_path.name}", f,
            {"content-type": "audio/mpeg", "upsert": "true"},
        )
    mp3_url = sb.storage.from_("audio").get_public_url(f"poglavlje-4/{mp3_path.name}")
    print(f"  MP3 uploaded: {mp3_url}")

    return mp3_url


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--upload", action="store_true", help="Upload to Supabase Storage after generation")
    args = parser.parse_args()

    from elevenlabs.client import ElevenLabs
    client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])

    print("Parsing script...")
    lines, chapter_markers = parse_script(SCRIPT_PATH)
    print(f"  {len(lines)} lines, {len(chapter_markers)} chapter markers")
    for m in chapter_markers:
        print(f"    [{m['timestamp_seconds']:>3}s] {m['label']}")

    print(f"\nSynthesizing {len(lines)} lines with ElevenLabs ({MODEL})...")
    chunks = []
    for i, line in enumerate(lines):
        voice_id = NASTAVNICA_VOICE if line["speaker"] == "N" else MARKO_VOICE
        audio = synthesize_line(client, line["text"], voice_id, i + 1)
        chunks.append(audio)

    print(f"\nStitching and normalizing -> {OUT_MP3.name}...")
    stitch_and_normalize(chunks, OUT_MP3)

    size_mb = OUT_MP3.stat().st_size / 1_000_000
    print(f"  Done: {size_mb:.1f} MB")

    # Get duration
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(OUT_MP3)],
        capture_output=True, text=True,
    )
    duration = int(float(result.stdout.strip()))
    minutes = duration // 60
    seconds = duration % 60
    print(f"  Duration: {minutes}:{seconds:02d}")

    # Write markers JSON
    OUT_MARKERS.write_text(json.dumps(chapter_markers, ensure_ascii=False, indent=2))
    print(f"  Markers: {OUT_MARKERS.name}")

    if args.upload:
        print("\nUploading to Supabase Storage...")
        mp3_url = upload_to_supabase(OUT_MP3, OUT_MARKERS)

        # Insert episode row
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
        print("  Episode row inserted into Supabase.")
        print(f"\nAudio URL: {mp3_url}")
    else:
        print(f"\nDone. Run with --upload to push to Supabase.")
        print(f"Local file: {OUT_MP3}")


if __name__ == "__main__":
    main()
