"""
tts_test.py: Generate blind TTS comparison samples from the Uvod section.

Produces three files in tts-samples/:
  provider-a.mp3  (ElevenLabs)
  provider-b.mp3  (OpenAI tts-1-hd)
  provider-c.mp3  (Azure Neural)

Each file is a stitched dialogue with two voices: Nastavnica and Marko.
Files are labelled A/B/C so scoring is blind.

Usage:
  python3 tts_test.py

Requires in .env:
  OPENAI_API_KEY
  ELEVENLABS_API_KEY
  AZURE_SPEECH_KEY
  AZURE_SPEECH_REGION

Skip a provider by leaving its key blank in .env — the script will warn and skip.

Dependencies:
  pip3 install openai elevenlabs pydub
  brew install ffmpeg   (needed by pydub for mp3 encoding)
"""

import os
import io
import subprocess
import tempfile
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

# ---------------------------------------------------------------------------
# Sample text — Uvod section only, split by speaker line
# ---------------------------------------------------------------------------
DIALOGUE = [
    ("nastavnica", "Zdravo, Marko. Danas učimo sabiranje razlomaka sa različitim nazivnicima. Na prvi pogled može izgledati komplikovano, ali kad jednom shvatiš ideju, sve ostalo slijedi logično."),
    ("marko",      "Prošli put smo sabirali razlomke s istim nazivnikom. To je bilo lako."),
    ("nastavnica", "Tačno. Jedna četvrtina plus dvije četvrtine, samo sabereš brojnike i dobiješ tri četvrtine. Ali šta kad nazivnici nisu isti? Recimo, jedna polovina plus jedna trećina?"),
    ("marko",      "Pa... sabereš i to? Jedan plus jedan je dva, dva plus tri je pet... dvije petine?"),
    ("nastavnica", "Hajde da provjeriš tu ideju s nečim što možeš zamisliti."),
]

OUT_DIR = Path(__file__).parent / "tts-samples"
OUT_DIR.mkdir(exist_ok=True)


# ---------------------------------------------------------------------------
# Utility: stitch audio chunks into one mp3 using ffmpeg concat
# ---------------------------------------------------------------------------
def stitch_to_mp3(chunks: list[bytes], out_path: Path):
    """Write a list of raw audio bytes (mp3 or wav) into a single mp3."""
    with tempfile.TemporaryDirectory() as tmp:
        list_file = Path(tmp) / "list.txt"
        parts = []
        for i, data in enumerate(chunks):
            p = Path(tmp) / f"part_{i}.mp3"
            p.write_bytes(data)
            parts.append(p)
            list_file.open("a").write(f"file '{p}'\n")

        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(list_file),
             "-acodec", "libmp3lame", "-b:a", "128k", "-ac", "1", str(out_path)],
            check=True,
            capture_output=True,
        )
    print(f"  Saved: {out_path.name}")


# ---------------------------------------------------------------------------
# Provider A: ElevenLabs
# ---------------------------------------------------------------------------
def generate_elevenlabs():
    api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        print("SKIP ElevenLabs: ELEVENLABS_API_KEY not set in .env")
        return

    from elevenlabs.client import ElevenLabs
    from elevenlabs import VoiceSettings

    client = ElevenLabs(api_key=api_key)

    # Recommended multilingual v2 voices for Bosnian:
    # Nastavnica: "Sarah" (warm female) or "Charlotte"
    # Marko: "Charlie" (young-sounding male)
    # Change these IDs after browsing elevenlabs.io/voice-library
    NASTAVNICA_VOICE = os.getenv("EL_NASTAVNICA_VOICE", "EXAVITQu4vr4xnSDxMaL")  # Sarah
    MARKO_VOICE      = os.getenv("EL_MARKO_VOICE",      "IKne3meq5aSn9XLyUdCD")  # Charlie

    print("Generating: ElevenLabs (provider-a.mp3)...")
    chunks = []
    for speaker, text in DIALOGUE:
        voice_id = NASTAVNICA_VOICE if speaker == "nastavnica" else MARKO_VOICE
        audio = client.text_to_speech.convert(
            voice_id=voice_id,
            text=text,
            model_id="eleven_turbo_v2_5",
            voice_settings=VoiceSettings(
                stability=0.5,
                similarity_boost=0.75,
                style=0.3,
                use_speaker_boost=True,
            ),
            output_format="mp3_44100_128",
        )
        data = b"".join(audio)
        chunks.append(data)
        print(f"  [{speaker}] {len(data):,} bytes")

    stitch_to_mp3(chunks, OUT_DIR / "provider-a.mp3")


# ---------------------------------------------------------------------------
# Provider B: OpenAI tts-1-hd
# ---------------------------------------------------------------------------
def generate_openai():
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        print("SKIP OpenAI: OPENAI_API_KEY not set in .env")
        return

    from openai import OpenAI
    client = OpenAI(api_key=api_key)

    # OpenAI voices: nova/shimmer (female), echo/fable (male-ish)
    # No child voice available — fable is the softest/youngest sounding
    NASTAVNICA_VOICE = "nova"
    MARKO_VOICE      = "fable"

    print("Generating: OpenAI tts-1-hd (provider-b.mp3)...")
    chunks = []
    for speaker, text in DIALOGUE:
        voice = NASTAVNICA_VOICE if speaker == "nastavnica" else MARKO_VOICE
        response = client.audio.speech.create(
            model="tts-1-hd",
            voice=voice,
            input=text,
            response_format="mp3",
        )
        data = response.read()
        chunks.append(data)
        print(f"  [{speaker}] {len(data):,} bytes")

    stitch_to_mp3(chunks, OUT_DIR / "provider-b.mp3")


# ---------------------------------------------------------------------------
# Provider C: Azure Neural TTS
# ---------------------------------------------------------------------------
def generate_azure():
    speech_key    = os.getenv("AZURE_SPEECH_KEY", "").strip()
    speech_region = os.getenv("AZURE_SPEECH_REGION", "").strip()
    if not speech_key or not speech_region:
        print("SKIP Azure: AZURE_SPEECH_KEY or AZURE_SPEECH_REGION not set in .env")
        return

    try:
        import azure.cognitiveservices.speech as speechsdk
    except ImportError:
        print("SKIP Azure: run 'pip3 install azure-cognitiveservices-speech' first")
        return

    # Azure Bosnian voices (bs-BA locale):
    # Nastavnica: bs-BA-VesnaNeural (female)
    # Marko: bs-BA-GoranNeural (male) — no child voice in bs-BA, use sr-RS-NicholasNeural as fallback
    NASTAVNICA_VOICE = "bs-BA-VesnaNeural"
    MARKO_VOICE      = "bs-BA-GoranNeural"

    config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
    config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3
    )

    print("Generating: Azure Neural (provider-c.mp3)...")
    chunks = []
    for speaker, text in DIALOGUE:
        voice = NASTAVNICA_VOICE if speaker == "nastavnica" else MARKO_VOICE
        config.speech_synthesis_voice_name = voice
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=config, audio_config=None
        )
        result = synthesizer.speak_text_async(text).get()
        if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
            print(f"  Azure error for [{speaker}]: {result.reason}")
            return
        chunks.append(result.audio_data)
        print(f"  [{speaker}] {len(result.audio_data):,} bytes")

    stitch_to_mp3(chunks, OUT_DIR / "provider-c.mp3")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("=== Cvrčak TTS Blind Test ===")
    print(f"Output: {OUT_DIR}/\n")

    generate_elevenlabs()
    print()
    generate_openai()
    print()
    generate_azure()

    print("\nDone. Files in tts-samples/:")
    for f in sorted(OUT_DIR.glob("*.mp3")):
        size_kb = f.stat().st_size // 1024
        print(f"  {f.name}  ({size_kb} KB)")

    print("""
Scoring rubric (1-5 each):
  1. Prirodnost govora (naturalness)
  2. Toplina Nastavnice (warmth of teacher voice)
  3. Uvjerljivost Marka (does Marko sound like a kid?)
  4. Izgovor Bosanskih termina (fraction vocab: nazivnik, razlomak, NZN)
  5. Bih li slušao 8 minuta ovoga? (would you listen for 8 min?)
""")
