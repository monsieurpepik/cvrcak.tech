create table buddy_ask_logs (
  id                   uuid primary key default gen_random_uuid(),
  input_type           text not null check (input_type in ('text', 'voice')),
  raw_question         text not null,
  retrieved_chunk_ids  uuid[],
  answer               text,
  source_page          int,
  refused              boolean not null default false,
  latency_ms           int,
  model                text,
  created_at           timestamptz default now()
);
