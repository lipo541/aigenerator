-- =====================================================
-- AI Image Generator - Supabase SQL Setup
-- ეტაპი 2: მონაცემთა ბაზის სტრუქტურა
-- =====================================================

-- ეს SQL სკრიპტები უნდა გაუშვათ Supabase SQL Editor-ში
-- გადადით: Supabase Dashboard → SQL Editor → New Query

-- =====================================================
-- 1. PROFILES TABLE - მომხმარებლის პროფილი და კრედიტები
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  remaining_credits INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) ჩართვა
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: მომხმარებელს შეუძლია მხოლოდ საკუთარი პროფილის ნახვა
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: მომხმარებელს შეუძლია საკუთარი პროფილის განახლება
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: ავტომატურად შექმნას პროფილი ახალი მომხმარებლის რეგისტრაციისას
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, remaining_credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    5  -- საწყისი კრედიტები
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger-ის დაკავშირება auth.users-თან
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. GENERATIONS TABLE - გენერირებული სურათების ისტორია
-- =====================================================

CREATE TABLE IF NOT EXISTS public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  style_chosen TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS ჩართვა
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Policy: მომხმარებელს შეუძლია მხოლოდ საკუთარი გენერაციების ნახვა
CREATE POLICY "Users can view their own generations"
  ON public.generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: მომხმარებელს შეუძლია ახალი გენერაციის შექმნა
CREATE POLICY "Users can insert their own generations"
  ON public.generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: მომხმარებელს შეუძლია საკუთარი გენერაციების წაშლა
CREATE POLICY "Users can delete their own generations"
  ON public.generations
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. DECREMENT CREDITS FUNCTION - კრედიტების შემცირება
-- =====================================================

CREATE OR REPLACE FUNCTION public.decrement_credits(user_id_input UUID)
RETURNS JSONB AS $$
DECLARE
  current_credits INTEGER;
  result JSONB;
BEGIN
  -- შევამოწმოთ მიმდინარე კრედიტები
  SELECT remaining_credits INTO current_credits
  FROM public.profiles
  WHERE id = user_id_input
  FOR UPDATE;  -- Lock row for transaction safety

  -- თუ არ არის საკმარისი კრედიტები
  IF current_credits IS NULL THEN
    result := jsonb_build_object(
      'success', false,
      'error', 'User profile not found',
      'remaining_credits', 0
    );
    RETURN result;
  END IF;

  IF current_credits < 1 THEN
    result := jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'remaining_credits', current_credits
    );
    RETURN result;
  END IF;

  -- შევამციროთ კრედიტები
  UPDATE public.profiles
  SET 
    remaining_credits = remaining_credits - 1,
    updated_at = NOW()
  WHERE id = user_id_input;

  -- დავაბრუნოთ წარმატების შედეგი
  result := jsonb_build_object(
    'success', true,
    'remaining_credits', current_credits - 1
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. ADD CREDITS FUNCTION - კრედიტების დამატება (გადახდის შემდეგ)
-- =====================================================

CREATE OR REPLACE FUNCTION public.add_credits(
  user_id_input UUID,
  credits_to_add INTEGER
)
RETURNS JSONB AS $$
DECLARE
  new_credits INTEGER;
  result JSONB;
BEGIN
  -- დავამატოთ კრედიტები
  UPDATE public.profiles
  SET 
    remaining_credits = remaining_credits + credits_to_add,
    updated_at = NOW()
  WHERE id = user_id_input
  RETURNING remaining_credits INTO new_credits;

  IF new_credits IS NULL THEN
    result := jsonb_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  ELSE
    result := jsonb_build_object(
      'success', true,
      'remaining_credits', new_credits
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. STORAGE BUCKET - სურათების შესანახად
-- =====================================================

-- ეს ბრძანება უნდა გაუშვათ Supabase Dashboard-ში:
-- Storage → Create New Bucket
-- Bucket Name: images
-- Public: Yes (რომ URL-ები იყოს საჯაროდ ხელმისაწვდომი)

-- თუ SQL-ით გსურთ:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('images', 'images', true);

-- Storage Policy: ნებისმიერს შეუძლია სურათების ნახვა
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'images');

-- Storage Policy: ავტორიზებულს შეუძლია ატვირთვა
-- CREATE POLICY "Authenticated users can upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- =====================================================
-- 6. HELPER VIEWS - დამხმარე ხედები
-- =====================================================

-- View: მომხმარებლის სტატისტიკა
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  p.id,
  p.username,
  p.remaining_credits,
  COUNT(g.id) as total_generations,
  MAX(g.created_at) as last_generation_at
FROM public.profiles p
LEFT JOIN public.generations g ON p.id = g.user_id
GROUP BY p.id, p.username, p.remaining_credits;

-- RLS for view
ALTER VIEW public.user_stats SET (security_invoker = true);

-- =====================================================
-- 7. INDEXES - პერფორმანსისთვის
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- =====================================================
-- ✅ დასრულება
-- =====================================================

-- შეამოწმეთ ყველა ცხრილი:
-- SELECT * FROM public.profiles;
-- SELECT * FROM public.generations;

-- შეამოწმეთ RLS პოლისები:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

COMMENT ON TABLE public.profiles IS 'მომხმარებლის პროფილები და კრედიტების ბალანსი';
COMMENT ON TABLE public.generations IS 'AI-ით გენერირებული სურათების ისტორია';
COMMENT ON FUNCTION public.decrement_credits IS 'კრედიტების უსაფრთხო შემცირება ტრანზაქციის ფარგლებში';
COMMENT ON FUNCTION public.add_credits IS 'კრედიტების დამატება გადახდის შემდეგ';
