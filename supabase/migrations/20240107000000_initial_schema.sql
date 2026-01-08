-- Enable pgvector extension for embedding storage
create extension if not exists vector with schema extensions;

-- Create custom enum types
create type pillar_type as enum ('health', 'mental', 'wealth', 'relationships', 'purpose');
create type goal_status as enum ('active', 'completed', 'archived');

-- Profiles table (linked to Supabase Auth users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  communication_style text,
  coaching_approach text,
  timezone text,
  onboarding_completed boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Goals table
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  pillar pillar_type not null,
  title text not null,
  description text,
  target_value numeric,
  current_value numeric default 0 not null,
  target_date date,
  status goal_status default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Daily logs table
create table daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  log_date date not null,
  mood_score integer check (mood_score >= 1 and mood_score <= 10),
  energy_level integer check (energy_level >= 1 and energy_level <= 10),
  sleep_hours numeric check (sleep_hours >= 0 and sleep_hours <= 24),
  exercise_minutes integer check (exercise_minutes >= 0),
  journal_entry text,
  pillar_scores jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, log_date)
);

-- Coaching sessions table with vector embedding for similarity search
create table coaching_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  summary text,
  embedding vector(1536), -- OpenAI/Claude embedding dimension
  pillar_focus text,
  emotional_valence numeric check (emotional_valence >= -1 and emotional_valence <= 1),
  action_items jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- User streaks table
create table user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  streak_type text not null,
  current_count integer default 0 not null,
  longest_count integer default 0 not null,
  last_activity_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, streak_type)
);

-- Create indexes for common queries
create index goals_user_id_idx on goals(user_id);
create index goals_pillar_idx on goals(pillar);
create index goals_status_idx on goals(status);
create index daily_logs_user_id_idx on daily_logs(user_id);
create index daily_logs_log_date_idx on daily_logs(log_date);
create index coaching_sessions_user_id_idx on coaching_sessions(user_id);
create index coaching_sessions_created_at_idx on coaching_sessions(created_at);
create index user_streaks_user_id_idx on user_streaks(user_id);

-- Create vector similarity search index for coaching sessions
create index coaching_sessions_embedding_idx on coaching_sessions
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at on all tables
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_goals_updated_at
  before update on goals
  for each row execute function update_updated_at_column();

create trigger update_daily_logs_updated_at
  before update on daily_logs
  for each row execute function update_updated_at_column();

create trigger update_coaching_sessions_updated_at
  before update on coaching_sessions
  for each row execute function update_updated_at_column();

create trigger update_user_streaks_updated_at
  before update on user_streaks
  for each row execute function update_updated_at_column();

-- Function to auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile when user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
