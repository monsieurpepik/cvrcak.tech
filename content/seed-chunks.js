// Inserts synthetic textbook chunks with real OpenAI embeddings into Supabase.
// Run once to unblock end-to-end testing before the real PDF arrives.
//
// Usage:
//   OPENAI_API_KEY=sk-... SUPABASE_URL=https://...supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... node content/seed-chunks.js

const CHAPTER_ID = 4;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || "https://bmfbibwphuocdevhbypm.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!OPENAI_API_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing OPENAI_API_KEY or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const CHUNKS = [
  {
    page_number: 58,
    content: "Razlomak se sastoji od brojnika i nazivnika. Brojnik pokazuje koliko dijelova uzimamo, a nazivnik pokazuje na koliko jednakih dijelova je podijeljena cjelina. Na primjer, razlomak 3/4 znači da smo podijelili cjelinu na 4 jednaka dijela i uzeli 3 od njih.",
  },
  {
    page_number: 60,
    content: "Sabiranje razlomaka sa istim nazivnikom je jednostavno: sabiramo samo brojnike, a nazivnik ostaje isti. Na primjer: 1/5 + 2/5 = 3/5. Zbrajamo samo 1 i 2, dok nazivnik 5 ostaje nepromijenjen.",
  },
  {
    page_number: 62,
    content: "Kada razlomci imaju različite nazivnike, ne možemo ih odmah sabirati. Prvo moramo pronaći najmanji zajednički nazivnik (NZN). NZN je najmanji broj koji je djeljiv s oba nazivnika. Na primjer, za razlomke 1/3 i 1/4, NZN je 12, jer je 12 najmanji broj djeljiv i s 3 i s 4.",
  },
  {
    page_number: 63,
    content: "Da bismo pronašli NZN, možemo koristiti metodu množenja nazivnika ili metodu traženja zajedničkih višekratnika. Na primjer, višekratnici broja 3 su: 3, 6, 9, 12, 15... Višekratnici broja 4 su: 4, 8, 12, 16... Najmanji zajednički višekratnik je 12, dakle NZN(3, 4) = 12.",
  },
  {
    page_number: 64,
    content: "Nakon što pronađemo NZN, svaki razlomak proširujemo tako da mu nazivnik postane NZN. Razlomak 1/3 proširujemo s 4 i dobivamo 4/12. Razlomak 1/4 proširujemo s 3 i dobivamo 3/12. Sada možemo sabirati: 4/12 + 3/12 = 7/12.",
  },
  {
    page_number: 65,
    content: "Proširivanje razlomka znači množenje i brojnika i nazivnika istim brojem. Vrijednost razlomka se pri tome ne mijenja. Na primjer, 1/3 = 2/6 = 3/9 = 4/12. Svi ovi razlomci su jednaki, samo su zapisani u drugom obliku.",
  },
  {
    page_number: 66,
    content: "Primjer: Saberi razlomke 2/3 i 1/6. Korak 1: Nađi NZN(3, 6) = 6. Korak 2: Proširi 2/3 s brojem 2: dobivamo 4/6. Razlomak 1/6 već ima nazivnik 6, ne treba proširivati. Korak 3: Saberi: 4/6 + 1/6 = 5/6. Rezultat je 5/6.",
  },
  {
    page_number: 67,
    content: "Primjer: Saberi razlomke 1/2 i 1/3. NZN(2, 3) = 6. Proširi 1/2 s 3: dobijaš 3/6. Proširi 1/3 s 2: dobijaš 2/6. Saberi: 3/6 + 2/6 = 5/6. Provjera: 5/6 je veće od oba sabirka, što je tačno jer su oba pozitivna razlomka.",
  },
  {
    page_number: 69,
    content: "Kada je rezultat sabiranja razlomaka nepravilni razlomak (gdje je brojnik veći od nazivnika), pretvaramo ga u mješoviti broj. Na primjer, 7/4 = 1 i 3/4, jer 7 podijeljeno s 4 daje 1 sa ostatkom 3.",
  },
  {
    page_number: 71,
    content: "Zadaci za vježbu: (1) Saberi 1/4 i 1/3. (2) Saberi 2/5 i 1/4. (3) Saberi 3/8 i 1/4. (4) Koliko je 1/2 + 1/6? (5) Marko je pojeo 1/4 pice, a Amina 1/3 pice. Koliki dio pice su zajedno pojeli? Rješenja: (1) 7/12, (2) 13/20, (3) 5/8, (4) 2/3, (5) 7/12.",
  },
];

async function embed(text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-large",
      input: text,
    }),
  });
  const data = await res.json();
  if (!data.data) throw new Error(`OpenAI error: ${JSON.stringify(data)}`);
  return data.data[0].embedding;
}

async function insertChunk(chunk, embedding) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/chunks`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      textbook: "matematika-5",
      chapter_id: CHAPTER_ID,
      content: chunk.content,
      embedding,
      page_number: chunk.page_number,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Insert failed: ${err}`);
  }
}

async function main() {
  console.log(`Seeding ${CHUNKS.length} synthetic chunks for chapter ${CHAPTER_ID}...\n`);
  for (let i = 0; i < CHUNKS.length; i++) {
    const chunk = CHUNKS[i];
    process.stdout.write(`[${i + 1}/${CHUNKS.length}] Embedding page ${chunk.page_number}... `);
    const embedding = await embed(chunk.content);
    await insertChunk(chunk, embedding);
    console.log("done");
  }
  console.log("\nAll chunks inserted. The ask function is ready to test.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
