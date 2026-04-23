-- Enable pgvector extension
create extension if not exists vector;

-- Ingested textbook content with embeddings
create table chunks (
  id           uuid primary key default gen_random_uuid(),
  textbook     text not null,        -- 'Matematika 5'
  chapter_id   int  not null,        -- 4
  section      text,                 -- 'Tema 4.2 Sabiranje razlomaka...'
  page_number  int  not null,        -- for citation
  content      text not null,
  embedding    vector(3072),         -- text-embedding-3-large
  created_at   timestamptz default now()
);

-- No vector index for Slice 1: sequential scan is fast enough at ~50-100 chunks.
-- Add hnsw index when pgvector is upgraded to support >2000 dims (v1+).
create index on chunks (chapter_id);
