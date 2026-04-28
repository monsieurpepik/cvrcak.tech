create table vjezbanka_exercises (
  id               uuid primary key default gen_random_uuid(),
  chapter_id       int  not null,
  question_text    text not null,
  visual_type      text not null check (visual_type in ('fractions', 'number_line', 'counting', 'comparison')),
  visual_data      jsonb not null,
  choices          jsonb not null,
  feedback_correct text not null,
  feedback_wrong   text not null,
  sort_order       int  not null default 0,
  created_at       timestamptz default now()
);

create index on vjezbanka_exercises (chapter_id, sort_order);

-- Seed: 10 exercises for chapter 4 (Razlomci), grades 1-4
insert into vjezbanka_exercises (chapter_id, question_text, visual_type, visual_data, choices, feedback_correct, feedback_wrong, sort_order) values
(4, 'Koliko je 1/2 + 1/4?', 'fractions', '{"numerator": 3, "denominator": 4}',
 '[{"label":"2/6","correct":false},{"label":"3/4","correct":true},{"label":"1/6","correct":false},{"label":"1/2","correct":false}]',
 'Tačno! Tri četvrtine. Bravo!', 'Nije to. Pogledaj krugiće ponovo.', 1),

(4, 'Koja slika pokazuje 2/3?', 'fractions', '{"numerator": 2, "denominator": 3}',
 '[{"label":"1/3","correct":false},{"label":"2/3","correct":true},{"label":"3/3","correct":false},{"label":"2/4","correct":false}]',
 'Odlično! Dva od tri dijela su popunjena.', 'Pogledaj koliko je kvadratića popunjeno.', 2),

(4, 'Koliko je 3/4 - 1/4?', 'fractions', '{"numerator": 2, "denominator": 4}',
 '[{"label":"2/4","correct":true},{"label":"4/4","correct":false},{"label":"1/4","correct":false},{"label":"2/8","correct":false}]',
 'Tačno! Dva od četiri dijela ostaju.', 'Oduzmi jedan dio od tri dijela.', 3),

(4, 'Koliko dijelova ima polovina?', 'fractions', '{"numerator": 1, "denominator": 2}',
 '[{"label":"1 od 2","correct":true},{"label":"1 od 3","correct":false},{"label":"2 od 4","correct":false},{"label":"1 od 4","correct":false}]',
 'Tačno! Polovina znači jedan od dva jednaka dijela.', 'Polovina znači podijeliti na dva jednaka dijela.', 4),

(4, 'Koji razlomak je manji: 1/2 ili 1/4?', 'fractions', '{"numerator": 1, "denominator": 4}',
 '[{"label":"1/2","correct":false},{"label":"1/4","correct":true},{"label":"Isti su","correct":false},{"label":"Ne znam","correct":false}]',
 'Tačno! Jedan od četiri dijela je manji od jednog od dva dijela.', 'Pomisli: četvrtina pizze ili polovina pizze, šta je manje?', 5),

(4, 'Koliko je 1/4 + 1/4 + 1/4?', 'fractions', '{"numerator": 3, "denominator": 4}',
 '[{"label":"3/12","correct":false},{"label":"3/4","correct":true},{"label":"3/8","correct":false},{"label":"1/4","correct":false}]',
 'Bravo! Tri četvrtine.', 'Saberi samo brojnike, nazivnik ostaje isti.', 6),

(4, 'Koja slika pokazuje cijeli broj 1?', 'fractions', '{"numerator": 4, "denominator": 4}',
 '[{"label":"1/4","correct":false},{"label":"2/4","correct":false},{"label":"3/4","correct":false},{"label":"4/4","correct":true}]',
 'Tačno! Kad su svi dijelovi popunjeni, to je cijela jedinica.', 'Cijeli znači svi dijelovi su popunjeni.', 7),

(4, 'Koliko je 2/4 iskaže kao polovina?', 'fractions', '{"numerator": 1, "denominator": 2}',
 '[{"label":"1/4","correct":false},{"label":"1/2","correct":true},{"label":"2/2","correct":false},{"label":"1/3","correct":false}]',
 'Odlično! Dvije četvrtine je isto što i jedna polovina.', 'Pokušaj nacrtati: dvije četvrtine i polovina su isti dio.', 8),

(4, 'Koji razlomak nije jednak ostalima?', 'fractions', '{"numerator": 1, "denominator": 3}',
 '[{"label":"2/4","correct":false},{"label":"1/2","correct":false},{"label":"1/3","correct":true},{"label":"3/6","correct":false}]',
 'Tačno! Trećina nije ista kao polovina.', 'Pogledaj koji razlomak ima drugačiji udio od ostalih.', 9),

(4, 'Koliko je 1/2 - 1/4?', 'fractions', '{"numerator": 1, "denominator": 4}',
 '[{"label":"0","correct":false},{"label":"1/4","correct":true},{"label":"1/2","correct":false},{"label":"1/6","correct":false}]',
 'Tačno! Polovina minus četvrtina je jedna četvrtina.', 'Pretvori 1/2 u 2/4, pa oduzmi 1/4.', 10);
