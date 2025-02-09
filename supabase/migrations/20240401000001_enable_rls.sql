-- Enable RLS
alter table submissions enable row level security;

-- Create policies
create policy "Enable insert for anonymous users"
on submissions for insert
with check (true);

create policy "Enable read access for all users"
on submissions for select
using (true);