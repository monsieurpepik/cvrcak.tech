// Transcript for Tema 4.2 — line timestamps computed from per-section byte sizes
// at 128kbps, distributed evenly within each section.
// Section boundaries (stitched audio, ~355s total):
//   Uvod 0–38s | Osnove 38–127s | Primjer 1 127–203s | Primjer 2 203–305s | Sažetak 305–355s

export type TranscriptLine = {
  speaker: "N" | "M";
  text: string;
  startSeconds: number;
  section: string;
};

export const TRANSCRIPT: TranscriptLine[] = [
  // Uvod (0–38s, 5 lines, ~7.6s each)
  { speaker: "N", startSeconds: 0,   section: "Uvod", text: "Zdravo, Marko. Danas učimo sabiranje razlomaka sa različitim nazivnicima. Na prvi pogled može izgledati komplikovano, ali kad jednom shvatiš ideju, sve ostalo slijedi logično." },
  { speaker: "M", startSeconds: 8,   section: "Uvod", text: "Prošli put smo sabirali razlomke s istim nazivnikom. To je bilo lako." },
  { speaker: "N", startSeconds: 15,  section: "Uvod", text: "Tačno. Jedna četvrtina plus dvije četvrtine, samo sabereš brojnike i dobiješ tri četvrtine. Ali šta kad nazivnici nisu isti? Recimo, jedna polovina plus jedna trećina?" },
  { speaker: "M", startSeconds: 23,  section: "Uvod", text: "Pa... sabereš i to? Jedan plus jedan je dva, dva plus tri je pet... dvije petine?" },
  { speaker: "N", startSeconds: 30,  section: "Uvod", text: "Hajde da provjeriš tu ideju s nečim što možeš zamisliti." },

  // Osnove (38–127s, 9 lines, ~9.9s each)
  { speaker: "N", startSeconds: 38,  section: "Osnove", text: "Zamisli picu. Podijelili smo je na dva jednaka dijela. Ti uzmeš jedan. To je jedna polovina. Sada uzmi drugu picu iste veličine, ali ovu podijelimo na tri jednaka dijela. Ti uzmeš jedan komad odatle. To je jedna trećina. Stavi ta dva komada jedan pored drugog. Jesu li isti?" },
  { speaker: "M", startSeconds: 48,  section: "Osnove", text: "Ne. Polovina je veći komad." },
  { speaker: "N", startSeconds: 58,  section: "Osnove", text: "Tačno. Jedan komad je veći od drugog. Nije isto kao kad sabiramo, recimo, tri jabuke i dvije jabuke. Jabuke su sve iste. Ovdje su komadi različiti. Ne možemo ih jednostavno zbrojiti kao da su isti." },
  { speaker: "M", startSeconds: 68,  section: "Osnove", text: "Znači trebamo ih nekako izjednačiti?" },
  { speaker: "N", startSeconds: 78,  section: "Osnove", text: "Upravo. Trebamo ih pretvoriti u iste dijelove. Da bismo sabirali razlomke, nazivnici moraju biti isti. A da nam nazivnici budu isti, tražimo najmanji zajednički nazivnik, skraćeno NZN." },
  { speaker: "M", startSeconds: 88,  section: "Osnove", text: "Kako se nađe NZN?" },
  { speaker: "N", startSeconds: 98,  section: "Osnove", text: "NZN je najmanji broj koji je djeljiv i s jednim i s drugim nazivnikom. Piši višekratnike od dva: dva, četiri, šest, osam, deset, dvanaest... Sada višekratnike od tri: tri, šest, devet, dvanaest... Koji je najmanji broj koji se pojavljuje u oba niza?" },
  { speaker: "M", startSeconds: 108, section: "Osnove", text: "Šest." },
  { speaker: "N", startSeconds: 118, section: "Osnove", text: "Tačno. NZN od dva i tri je šest. Sada koristimo šest kao zajednički nazivnik." },

  // Primjer 1 (127–203s, 9 lines, ~8.4s each)
  { speaker: "N", startSeconds: 127, section: "Primjer 1", text: "Riješimo sada taj prvi primjer korak po korak. Jedna polovina plus jedna trećina. NZN smo već našli, to je šest. Trebamo pretvoriti oba razlomka tako da im nazivnik bude šest." },
  { speaker: "M", startSeconds: 135, section: "Primjer 1", text: "Kako se pretvara jedna polovina u šestine?" },
  { speaker: "N", startSeconds: 144, section: "Primjer 1", text: "Pitamo se: s čime množimo dva da dobijemo šest? S tri. I kad množimo nazivnik s tri, moramo množiti i brojnik s tri. Jedan puta tri je tri. Dakle jedna polovina postaje tri šestine." },
  { speaker: "M", startSeconds: 152, section: "Primjer 1", text: "I jedna trećina? S čime množim tri da dobijem šest? S dva. Jedan puta dva je dva. Znači jedna trećina postaje dvije šestine." },
  { speaker: "N", startSeconds: 161, section: "Primjer 1", text: "Savršeno. Sada imamo tri šestine plus dvije šestine. Isti nazivnik. Šta radimo?" },
  { speaker: "M", startSeconds: 169, section: "Primjer 1", text: "Saberemo brojnike. Tri plus dva je pet. Odgovor je pet šestina." },
  { speaker: "N", startSeconds: 178, section: "Primjer 1", text: "Tačno. Jedna polovina plus jedna trećina je pet šestina. Provjeri: polovina je tri šestine, trećina su dvije šestine, zajedno pet šestina od šest. To je malo manje od cijele, što ima smisla." },
  { speaker: "M", startSeconds: 186, section: "Primjer 1", text: "Zašto uvijek provjeravamo?" },
  { speaker: "N", startSeconds: 195, section: "Primjer 1", text: "Jer je lako pogriješiti pri množenju. Brza provjera u glavi te spasi od pogrešnog odgovora." },

  // Primjer 2 (203–305s, 13 lines, ~7.8s each)
  { speaker: "N", startSeconds: 203, section: "Primjer 2", text: "Hajde sada nešto malo složenije. Dvije trećine plus tri četvrtine." },
  { speaker: "M", startSeconds: 211, section: "Primjer 2", text: "Trebam NZN od tri i četiri. Višekratnici od tri: tri, šest, devet, dvanaest. Višekratnici od četiri: četiri, osam, dvanaest. NZN je dvanaest." },
  { speaker: "N", startSeconds: 219, section: "Primjer 2", text: "Odlično. Pretvori dvije trećine u dvanaestine." },
  { speaker: "M", startSeconds: 227, section: "Primjer 2", text: "Tri puta četiri je dvanaest, dakle množim s četiri. Dva puta četiri je osam. Dvije trećine postaju osam dvanaestina." },
  { speaker: "N", startSeconds: 235, section: "Primjer 2", text: "I tri četvrtine?" },
  { speaker: "M", startSeconds: 243, section: "Primjer 2", text: "Četiri puta tri je dvanaest, množim s tri. Tri puta tri je devet. Tri četvrtine postaju devet dvanaestina." },
  { speaker: "N", startSeconds: 251, section: "Primjer 2", text: "Sada saberi." },
  { speaker: "M", startSeconds: 259, section: "Primjer 2", text: "Osam dvanaestina plus devet dvanaestina. Osam plus devet je sedamnaest. Odgovor je sedamnaest dvanaestina." },
  { speaker: "N", startSeconds: 267, section: "Primjer 2", text: "Primijetio si nešto kod tog broja?" },
  { speaker: "M", startSeconds: 275, section: "Primjer 2", text: "Sedamnaest je veće od dvanaest. To je više od jednog cijelog." },
  { speaker: "N", startSeconds: 283, section: "Primjer 2", text: "Tačno. Možemo to zapisati i kao mješoviti broj. Dvanaest dvanaestina je jedan cijeli, a ostaje pet dvanaestina. Dakle jedan i pet dvanaestina. Oba oblika su tačna. Pogledaj šta traži zadatak, ili pitaj nastavnika koji oblik želi." },
  { speaker: "M", startSeconds: 291, section: "Primjer 2", text: "A da li se uvijek može uprosti razlomak?" },
  { speaker: "N", startSeconds: 299, section: "Primjer 2", text: "Dobro pitanje. Pet dvanaestina, da li postoji broj koji dijeli i pet i dvanaest? Pet je prost broj, a dvanaest nije djeljiv s pet. Dakle pet dvanaestina je već u najjednostavnijem obliku. Ali kad god završiš zadatak, vrijedi to provjeriti." },

  // Sažetak (305–355s, 9 lines, ~5.5s each)
  { speaker: "N", startSeconds: 305, section: "Sažetak", text: "Ponovimo korake. Svaki put kad sabiramo razlomke s različitim nazivnicima." },
  { speaker: "M", startSeconds: 311, section: "Sažetak", text: "Jedan. Nađem NZN od oba nazivnika, tražim najmanji broj koji je djeljiv s oba." },
  { speaker: "N", startSeconds: 317, section: "Sažetak", text: "Dva." },
  { speaker: "M", startSeconds: 323, section: "Sažetak", text: "Pretvaram oba razlomka u ekvivalentne razlomke s NZN kao nazivnikom. Množim i brojnik i nazivnik s istim brojem." },
  { speaker: "N", startSeconds: 329, section: "Sažetak", text: "Tri." },
  { speaker: "M", startSeconds: 335, section: "Sažetak", text: "Saberem brojnike. Nazivnik ostaje isti." },
  { speaker: "N", startSeconds: 341, section: "Sažetak", text: "I četiri." },
  { speaker: "M", startSeconds: 347, section: "Sažetak", text: "Provjerim je li odgovor smislen. Ako je veći od jedan, mogu ga zapisati kao mješoviti broj. I pogledam može li se uprostiti." },
  { speaker: "N", startSeconds: 350, section: "Sažetak", text: "To je sve. Četiri koraka i svaki zadatak sabiranja razlomaka sa različitim nazivnicima možeš riješiti. Probaj sam još koji primjer, i vidjet ćeš da postaje sve lakše. Ako zapneš na nečem iz ovog poglavlja, pitaj me, tu sam." },
];
