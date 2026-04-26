create table rate_limits (
  session_token text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);

alter table rate_limits enable row level security;
