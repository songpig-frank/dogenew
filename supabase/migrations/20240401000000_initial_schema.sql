-- Create submissions table
create table if not exists submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text not null,
  category text not null check (category in ('Praise', 'Complaint', 'Recommendation')),
  media_url text,
  user_id uuid references auth.users(id),
  likes integer default 0,
  comments integer default 0
);

-- Create storage bucket for media
insert into storage.buckets (id, name)
values ('submission-media', 'submission-media')
on conflict do nothing;

-- Set up storage policy
create policy "Anyone can upload media"
on storage.objects for insert
with check (bucket_id = 'submission-media');

create policy "Anyone can view media"
on storage.objects for select
using (bucket_id = 'submission-media');