-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  name text,
  email text,
  phone text,
  role text check (role in ('admin', 'manager', 'technician', 'contador', 'asistente', 'supervisor')) default 'technician',
  status text check (status in ('active', 'inactive')) default 'active',

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security!
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- This triggers a profile creation when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, status)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'technician', 'active');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Manually insert the existing admin user if not present
-- We need to find the ID of LCAA27@GMAIL.COM first, but we can try to insert based on email if we could join, 
-- but simpler to just run the table creation first.
