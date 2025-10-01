# 🔧 Supabase კონფიგურაციის ინსტრუქცია

ეს ფაილი შეიცავს დეტალურ ნაბიჯ-ნაბიჯ ინსტრუქციებს Supabase-ის სრული კონფიგურაციისთვის.

---

## ნაბიჯი 1: Supabase პროექტის შექმნა

1. **დარეგისტრირდით**: https://supabase.com
2. **შექმენით პროექტი**:
   - დააწექით "New Project"
   - Project Name: `ai-generator` (ან თქვენი სურვილისამებრ)
   - Database Password: შეინახეთ უსაფრთხოდ!
   - Region: აირჩიეთ უახლოესი (Europe West მაგალითად)
   - დააწექით "Create new project"
3. **დაელოდეთ**: პროექტის ინიციალიზაცია გრძელდება ~2 წუთი

---

## ნაბიჯი 2: API გასაღებების მიღება

1. **გადადით პარამეტრებში**:
   - მარცხენა მენიუში დააწექით ⚙️ **Settings**
   - აირჩიეთ **API**

2. **დააკოპირეთ გასაღებები**:
   ```
   Project URL: https://xxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **შექმენით `.env.local` ფაილი პროექტში**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **გადატვირთეთ დევ სერვერი**:
   ```bash
   # Terminal-ში დააწექით Ctrl+C და თავიდან გაუშვით:
   npm run dev
   ```

---

## ნაბიჯი 3: მონაცემთა ბაზის სტრუქტურის შექმნა

1. **გადადით SQL Editor-ში**:
   - მარცხენა მენიუში: 🗄️ **SQL Editor**
   - დააწექით **New Query**

2. **დააკოპირეთ და გაუშვით SQL სკრიპტი**:
   - გახსენით `supabase-setup.sql` ფაილი
   - დააკოპირეთ **მთლიანად** ყველა კოდი
   - ჩასვით SQL Editor-ში
   - დააწექით **Run** (ან Ctrl+Enter)

3. **შეამოწმეთ შედეგი**:
   - უნდა დაინახოთ: "Success. No rows returned"
   - თუ error მიიღეთ, შემოწმეთ არის თუ არა უკვე შექმნილი ცხრილები

4. **დაადასტურეთ ცხრილები**:
   - გადადით: 🗄️ **Database** → **Tables**
   - უნდა ჩანდეს:
     - ✅ `profiles`
     - ✅ `generations`

---

## ნაბიჯი 4: Storage Bucket-ის შექმნა

1. **გადადით Storage-ში**:
   - მარცხენა მენიუში: 🪣 **Storage**
   - დააწექით **New bucket**

2. **შექმენით bucket**:
   - Name: `images`
   - Public bucket: ☑️ **დაეთმინეთ** (რომ URL-ები იყოს საჯაროდ ხელმისაწვდომი)
   - დააწექით **Create bucket**

3. **კონფიგურირეთ Policies** (თუ საჭიროა):
   - დააწექით `images` bucket-ზე
   - **Policies** → **New Policy**
   - **გასაადვილებლად**: დააწექით "Allow public access" template

---

## ნაბიჯი 5: Authentication Settings

1. **გადადით Auth კონფიგურაციაში**:
   - მარცხენა მენიუში: 🔐 **Authentication** → **Providers**

2. **Email Provider** (უკვე ჩართულია):
   - **Email Auth**: ჩართულია ავტომატურად
   - **Confirm email**: ჩართეთ თუ გსურთ email დადასტურება
   - **Secure email change**: რეკომენდებულია

3. **კონფიგურირეთ Email Templates** (Optional):
   - **Authentication** → **Email Templates**
   - შეგიძლიათ მოარგოთ confirmation email-ის დიზაინი

---

## ნაბიჯი 6: OAuth Providers (Optional - სოციალური შესვლა)

### 🔵 Google OAuth

1. **Google Cloud Console**:
   - გადადით: https://console.cloud.google.com/
   - შექმენით პროექტი ან აირჩიეთ არსებული

2. **OAuth Consent Screen**:
   - **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name, Support email და Developer contact ჩაწერეთ

3. **შექმენით Credentials**:
   - **Credentials** → **Create Credentials** → **OAuth Client ID**
   - Application type: **Web application**
   - Name: `AI Generator`
   - **Authorized redirect URIs**:
     ```
     https://xxxxxxxxxx.supabase.co/auth/v1/callback
     ```
     (ჩაანაცვლეთ `xxxxxxxxxx` თქვენი Supabase project ID-ით)
   - **Create**

4. **დააკოპირეთ Client ID და Secret**

5. **Supabase-ში დააკონფიგურირეთ**:
   - **Authentication** → **Providers** → **Google**
   - ჩართეთ toggle
   - ჩასვით **Client ID** და **Client Secret**
   - **Save**

---

### 🔵 Facebook OAuth

1. **Facebook Developers**:
   - გადადით: https://developers.facebook.com/
   - **My Apps** → **Create App**

2. **აირჩიეთ App Type**:
   - **Consumer**
   - შეავსეთ ინფორმაცია და შექმენით აპლიკაცია

3. **დაამატეთ Facebook Login**:
   - **Add a Product** → **Facebook Login** → **Set Up**
   - **Settings** → **Valid OAuth Redirect URIs**:
     ```
     https://xxxxxxxxxx.supabase.co/auth/v1/callback
     ```
   - **Save Changes**

4. **მიიღეთ App ID და Secret**:
   - **Settings** → **Basic**
   - დააკოპირეთ **App ID** და **App Secret**

5. **Supabase-ში**:
   - **Authentication** → **Providers** → **Facebook**
   - ჩართეთ და ჩასვით **App ID** და **App Secret**
   - **Save**

---

### 🔵 Apple OAuth (რთულია)

Apple OAuth უფრო რთული კონფიგურაციაა და საჭიროებს:
- Apple Developer Program ($99/წელიწადში)
- Services ID-ს შექმნას
- Private Key-ის გენერაციას

**რეკომენდაცია**: პირველ ეტაპზე გამოტოვეთ Apple და გამოიყენეთ Google/Facebook.

თუ მაინც გჭირდებათ, იხილეთ Supabase დოკუმენტაცია:
https://supabase.com/docs/guides/auth/social-login/auth-apple

---

## ნაბიჯი 7: ტესტირება

### 1. **გაუშვით აპლიკაცია**:
```bash
npm run dev
```

### 2. **შეეცადეთ რეგისტრაციას**:
- გადადით: http://localhost:3000/auth/signup
- შეიყვანეთ email და პაროლი
- დააჭირეთ "რეგისტრაცია"

### 3. **შეამოწმეთ Supabase-ში**:
- **Authentication** → **Users**
- უნდა ჩანდეს თქვენი ახალი მომხმარებელი

### 4. **შეამოწმეთ Database**:
- **SQL Editor** → New Query:
  ```sql
  SELECT * FROM public.profiles;
  ```
- უნდა ჩანდეს თქვენი პროფილი `remaining_credits = 5`-ით

### 5. **შეეცადეთ შესვლას**:
- გადადით: http://localhost:3000/auth/login
- შედით თქვენი email/პაროლით
- უნდა გადამისამართდეთ `/dashboard`-ზე

---

## ✅ Checklist - რა უნდა იყოს კონფიგურირებული:

- [ ] Supabase პროექტი შექმნილია
- [ ] `.env.local` ფაილი შექმნილი API გასაღებებით
- [ ] `profiles` ცხრილი შექმნილია
- [ ] `generations` ცხრილი შექმნილია
- [ ] `decrement_credits()` ფუნქცია შექმნილია
- [ ] `images` Storage bucket შექმნილია
- [ ] Email Authentication მუშაობს
- [ ] (Optional) Google OAuth კონფიგურირებულია
- [ ] (Optional) Facebook OAuth კონფიგურირებულია
- [ ] რეგისტრაცია და შესვლა ტესტირებულია

---

## 🆘 ხშირი პრობლემები

### Error: "Invalid API key"
- შეამოწმეთ `.env.local` ფაილი
- დარწმუნდით რომ `NEXT_PUBLIC_` პრეფიქსი სწორია
- გადატვირთეთ dev server (Ctrl+C → npm run dev)

### Error: "Email not confirmed"
- Supabase-ში: **Authentication** → **Email Auth**
- გამორთეთ "Confirm email" თუ ტესტირებას ახდენთ

### OAuth არ მუშაობს localhost-ზე
- ზოგიერთი provider (Apple) არ იმუშავებს localhost-ზე
- გამოიყენეთ production URL (Vercel) სრული ტესტირებისთვის

### RLS Policy Error
- შეამოწმეთ რომ SQL სკრიპტი სრულად გაეშვა
- **Database** → **Policies** - უნდა ჩანდეს პოლისები

---

## 📚 დამატებითი რესურსები

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**როცა ყველაფერი მზად იქნება, შეგვატყობინეთ რომ გავაგრძელოთ ეტაპი 2! 🚀**
