-- RPC function called by the ask edge function for similarity search
create or replace function match_chunks(
  query_embedding vector(3072),
  chapter_filter  int,
  match_count     int default 5
)
returns table (
  id          uuid,
  content     text,
  page_number int,
  section     text,
  similarity  float
)
language sql stable
as $$
  select
    id,
    content,
    page_number,
    section,
    1 - (embedding <=> query_embedding) as similarity
  from chunks
  where chapter_id = chapter_filter
  order by embedding <=> query_embedding
  limit match_count;
$$;
