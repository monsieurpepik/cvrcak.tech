"""
generate_audio.py: script.md -> TTS -> normalized mp3 -> Supabase Storage

Usage:
    python generate_audio.py --script script.md --provider elevenlabs --out episode.mp3

Providers: elevenlabs | openai | azure
Reads provider API keys from .env
Requires: requests, pydub, ffmpeg, python-dotenv, supabase

Script format:
    [N] Nastavnica: Danas ćemo naučiti...
    [M] Marko: Zašto moramo da...
    Each line prefixed with [N] or [M] for voice routing.
"""

import argparse
import os
import re
import json
import subprocess
import tempfile
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

VOICE_MAP = {
    "elevenlabs": {
        "N": os.getenv("ELEVENLABS_VOICE_NASTAVNICA", ""),
        "M": os.getenv("ELEVENLABS_VOICE_MARKO", ""),
    },
    "openai": {
        "N": "nova",
        "M": "echo",
    },
}

LINE_PATTERN = re.compile(r"^\[(N|M)\]\s+(.+)$", re.MULTILINE)
MARKER_PATTERN = re.compile(r"^##\s+(.+)$", re.MULTILINE)


def parse_script(script_path: str):
    text = Path(script_path).read_text()
    lines = []
    for match in LINE_PATTERN.finditer(text):
        lines.append({"speaker": match.group(1), "text": match.group(2).strip()})
    markers = []
    for match in MARKER_PATTERN.finditer(text):
        markers.append(match.group(1).strip())
    return lines, markers


def synthesize_elevenlabs(text: str, voice_id: str) -> bytes:
    import requests
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {"xi-api-key": os.environ["ELEVENLABS_API_KEY"]}
    body = {"text": text, "model_id": "eleven_turbo_v2_5", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
    r = requests.post(url, headers=headers, json=body)
    r.raise_for_status()
    return r.content


def synthesize_openai(text: str, voice: str) -> bytes:
    from openai import OpenAI
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    response = client.audio.speech.create(model="tts-1-hd", voice=voice, input=text)
    return response.content


def normalize_mp3(input_path: str, output_path: str):
    subprocess.run([
        "ffmpeg", "-y", "-i", input_path,
        "-af", "loudnorm",
        "-ar", "44100", "-ac", "1", "-b:a", "128k",
        output_path,
    ], check=True)


def upload_to_supabase(mp3_path: str, episode_filename: str) -> str:
    from supabase import create_client
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    with open(mp3_path, "rb") as f:
        sb.storage.from_("audio").upload(episode_filename, f, {"content-type": "audio/mpeg"})
    url = sb.storage.from_("audio").get_public_url(episode_filename)
    return url


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--script", required=True)
    parser.add_argument("--provider", choices=["elevenlabs", "openai", "azure"], default="elevenlabs")
    parser.add_argument("--out", default="episode.mp3")
    parser.add_argument("--upload", action="store_true", help="Upload to Supabase Storage after generation")
    args = parser.parse_args()

    lines, markers = parse_script(args.script)
    print(f"Parsed {len(lines)} lines, {len(markers)} chapter markers")

    segments = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, line in enumerate(lines):
            print(f"  Synthesizing line {i + 1}/{len(lines)}: [{line['speaker']}] {line['text'][:50]}...")
            if args.provider == "elevenlabs":
                audio = synthesize_elevenlabs(line["text"], VOICE_MAP["elevenlabs"][line["speaker"]])
            elif args.provider == "openai":
                audio = synthesize_openai(line["text"], VOICE_MAP["openai"][line["speaker"]])
            else:
                raise NotImplementedError("Azure provider not yet implemented")

            seg_path = f"{tmp}/seg_{i:04d}.mp3"
            Path(seg_path).write_bytes(audio)
            segments.append(seg_path)

        concat_list = f"{tmp}/concat.txt"
        Path(concat_list).write_text("\n".join(f"file '{s}'" for s in segments))

        raw_out = f"{tmp}/raw.mp3"
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list, "-c", "copy", raw_out], check=True)
        normalize_mp3(raw_out, args.out)

    print(f"Audio written to {args.out}")

    if args.upload:
        url = upload_to_supabase(args.out, f"poglavlje-4/{Path(args.out).name}")
        print(f"Uploaded: {url}")


if __name__ == "__main__":
    main()
