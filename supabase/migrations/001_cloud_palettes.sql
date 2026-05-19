create table if not exists cloud_palettes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  colors      jsonb not null,
  created_at  timestamptz default now()
);

alter table cloud_palettes enable row level security;

create policy "Users manage own palettes"
  on cloud_palettes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
