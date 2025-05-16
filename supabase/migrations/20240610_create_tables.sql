-- Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value INTEGER NOT NULL CHECK (value >= 0 AND value <= 100),
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL,
  image TEXT,
  url TEXT,
  match INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create career_paths table
CREATE TABLE IF NOT EXISTS public.career_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  current_level TEXT NOT NULL,
  next_level TEXT NOT NULL,
  progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
  skills_needed TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;

-- Create policies for skills
CREATE POLICY "Users can view own skills" 
  ON public.skills FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills" 
  ON public.skills FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" 
  ON public.skills FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for courses
CREATE POLICY "Everyone can view courses" 
  ON public.courses FOR SELECT 
  USING (true);

-- Create policies for career_paths
CREATE POLICY "Users can view own career paths" 
  ON public.career_paths FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own career paths" 
  ON public.career_paths FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own career paths" 
  ON public.career_paths FOR UPDATE 
  USING (auth.uid() = user_id); 