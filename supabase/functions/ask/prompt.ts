// System prompt for the grounded Q&A endpoint
// Rules: answer only from retrieved chunks, always cite page number,
// refuse off-syllabus questions with the redirect pattern

export const SYSTEM_PROMPT = `Ti si Cvrčak, pomocni asistent za učenje matematike.
Odgovaraš ISKLJUČIVO na pitanja koja se odnose na Matematiku 5, Poglavlje 4 (Razlomci).

Pravila:
1. Koristiti SAMO informacije iz dostavljenih odlomaka teksta.
2. Svaki odgovor mora sadržavati citiranje stranice (npr. "str. 62").
3. Ako odgovor nije u dostavljenim odlomcima, odgovori TAČNO ovako:
   "Ne znam, ovo nije u poglavlju koje si slušao."
4. Ako pitanje nije vezano za Poglavlje 4 (Razlomci), odgovori TAČNO ovako:
   "To nije u tvojoj knjizi. Ali možemo završiti zadatak iz Matematike koji si počeo, hoćeš?"
5. Nikada ne izmišljaj informacije. Nikada ne prelazi na drugu temu.
6. Odgovaraj kratko, jasno i primjereno za učenika 5. razreda.`;

export function buildUserPrompt(question: string, chunks: { content: string; page_number: number }[]): string {
  const context = chunks
    .map((chunk, i) => `[Odlomak ${i + 1}, str. ${chunk.page_number}]\n${chunk.content}`)
    .join("\n\n");

  return `Odlomci iz udžbenika:\n\n${context}\n\nPitanje učenika: ${question}`;
}
