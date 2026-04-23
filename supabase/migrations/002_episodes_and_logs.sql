-- Audio overview episodes
create table episodes (
  id               uuid primary key default gen_random_uuid(),
  chapter_id       int  not null,
  topic            text not null,          -- 'Sabiranje razlomaka sa različitim nazivnicima'
  subtopic         text,                   -- 'Tema 4.2'
  audio_url        text not null,          -- Supabase Storage public URL
  duration_seconds int  not null,
  chapter_markers  jsonb not null,         -- [{ label, timestamp_seconds }, ...]
  learning_points  text[] not null,        -- "Šta ćeš naučiti" 4 items
  created_at       timestamptz default now()
);

-- Q&A trace log for evaluation
create table ask_logs (
  id                  uuid primary key default gen_random_uuid(),
  question            text not null,
  retrieved_chunk_ids uuid[] not null,
  answer              text,
  citation_page       int,
  refused             boolean not null,
  latency_ms          int,
  model               text,               -- 'claude-3-5-sonnet' or 'gpt-4o'
  created_at          timestamptz default now()
);
