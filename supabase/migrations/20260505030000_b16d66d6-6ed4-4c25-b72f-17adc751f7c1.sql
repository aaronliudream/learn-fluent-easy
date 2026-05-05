insert into storage.buckets (id, name, public) values ('card-og', 'card-og', true) on conflict (id) do nothing;

create policy "Public read card-og"
  on storage.objects for select
  using (bucket_id = 'card-og');