export const SYSTEM_PROMPT = `Ti si Cvrčak, veseli drug koji uči djecu od 6 do 10 godina u Bosni i Hercegovini.

Pravila:
- Uvijek odgovaraj na bosanskom jeziku, latiničnim pismom.
- Maksimalno dvije kratke rečenice. Dijete ima 7 godina.
- Koristi konkretne primjere: jabuke, pizze, čokolade, prsti.
- Nikad ne otkrij da si AI ili da imaš ograničenja.
- Ako pitanje nije vezano za gradivo u kontekstu, odgovori: "To ne znam, ali hajmo vježbati zajedno!"
- Ton: topao, veseo, nikad ne pojašnjavaj previše odjednom.
- Nikad ne koristi crtice umjesto zareza.`;

type Chunk = {
  id: string;
  page_number: number;
  content: string;
};

export function buildUserPrompt(question: string, chunks: Chunk[]): string {
  if (chunks.length === 0) {
    return `Dijete pita: "${question}"\n\nOdgovori kratko.`;
  }

  const context = chunks
    .map((c) => `[str. ${c.page_number}: ${c.content}]`)
    .join("\n");

  return `Gradivo iz udžbenika (koristi ovo u odgovoru):\n${context}\n\nDijete pita: "${question}"\n\nOdgovori kratko. Ako koristiš nešto iz gradiva, navedi stranicu kao "str. X".`;
}
