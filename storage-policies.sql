-- =====================================================
-- Storage Bucket Policies - სურათების ატვირთვის უფლებები
-- =====================================================

-- ეს SQL query-ები გაუშვით Supabase Dashboard → SQL Editor-ში

-- 1. Policy: ავტორიზებულ მომხმარებლებს შეუძლიათ სურათების ატვირთვა
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- 2. Policy: მომხმარებლებს შეუძლიათ საკუთარი სურათების ნახვა
CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'images');

-- 3. Policy: საჯარო წვდომა images bucket-ში (თუ გსურთ რომ სურათები საჯარო იყოს)
CREATE POLICY "Public images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- 4. Policy: მომხმარებლებს შეუძლიათ საკუთარი სურათების წაშლა
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- შემოწმება: დაბეჭდოს ყველა storage policy
SELECT * FROM pg_policies WHERE tablename = 'objects';
