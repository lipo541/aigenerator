# AI Image Generator - ეტაპი 1: დასრულებული ✅

AI-ით გენერირებული სურათების აპლიკაცია Next.js 15, Supabase და Tailwind CSS-ით.

## 🎯 პროექტის სტატუსი

### ✅ დასრულებული ეტაპები:

**ეტაპი 1.1: პროექტის ინიციალიზაცია და ბაზის დაყენება**
- ✅ Next.js 15 + TypeScript პროექტი
- ✅ Supabase SDK ინტეგრაცია
- ✅ Tailwind CSS კონფიგურაცია
- ✅ გარემოს ცვლადების მომზადება

**ეტაპი 1.2: ავთენტიფიკაციის იმპლემენტაცია**
- ✅ AuthContext - მომხმარებლის სესიის მართვა
- ✅ ელ-ფოსტა/პაროლით რეგისტრაცია და შესვლა
- ✅ სოციალური პროვაიდერები (Google, Facebook, Apple)
- ✅ Protected Routes - Dashboard დაცული გვერდი
- ✅ Session მენეჯმენტი

---

## 🚀 სწრაფი დაწყება

### 1. Supabase პროექტის შექმნა

1. გადადით [https://supabase.com](https://supabase.com) და შექმენით ანგარიში
2. დააწექით "New Project"
3. შეარჩიეთ ორგანიზაცია და შეიყვანეთ:
   - Project Name: `ai-generator`
   - Database Password: (შეინახეთ უსაფრთხოდ)
   - Region: აირჩიეთ უახლოესი
4. დაელოდეთ პროექტის შექმნას (~2 წუთი)

### 2. API გასაღებების მიღება

1. გადადით: **Project Settings** (⚙️) → **API**
2. დააკოპირეთ:
   - **Project URL**: `https://xxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. გარემოს ცვლადების კონფიგურაცია

შექმენით `.env.local` ფაილი პროექტის root-ში:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. აპლიკაციის გაშვება

```bash
npm run dev
```

გახსენით ბრაუზერში: [http://localhost:3000](http://localhost:3000)

---

## 🔐 OAuth Providers-ის კონფიგურაცია

### Google OAuth

1. გადადით: [Google Cloud Console](https://console.cloud.google.com/)
2. შექმენით ახალი პროექტი ან აირჩიეთ არსებული
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth Client ID**
4. Application Type: **Web application**
5. Authorized redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
6. დააკოპირეთ **Client ID** და **Client Secret**
7. Supabase-ში: **Authentication** → **Providers** → **Google**
8. ჩართეთ და ჩასვით Client ID და Secret

### Facebook OAuth

1. გადადით: [Facebook Developers](https://developers.facebook.com/)
2. **My Apps** → **Create App** → **Consumer**
3. აირჩიეთ **Facebook Login**
4. **Settings** → **Basic** - დააკოპირეთ **App ID** და **App Secret**
5. **Facebook Login** → **Settings** → Valid OAuth Redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
6. Supabase-ში: **Authentication** → **Providers** → **Facebook**
7. ჩართეთ და ჩასვით App ID და Secret

### Apple OAuth

1. გადადით: [Apple Developer](https://developer.apple.com/)
2. **Certificates, IDs & Profiles** → **Identifiers** → **+**
3. აირჩიეთ **App IDs** და შექმენით Services ID
4. Enable **Sign In with Apple**
5. დააკონფიგურირეთ Redirect URL:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
6. Supabase-ში: **Authentication** → **Providers** → **Apple**
7. ჩართეთ და ჩასვით საჭირო პარამეტრები

---

## 📁 პროექტის სტრუქტურა

```
ai-generator-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # ავთენტიფიკაციის გვერდები
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── dashboard/         # დაცული გვერდი
│   │   │   └── page.tsx
│   │   ├── layout.tsx         # Root layout + AuthProvider
│   │   ├── page.tsx           # მთავარი გვერდი
│   │   └── globals.css
│   ├── components/
│   │   └── auth/              # ავთენტიფიკაციის კომპონენტები
│   │       ├── LoginForm.tsx
│   │       └── SignupForm.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx    # Auth სტეიტის მენეჯმენტი
│   └── lib/
│       └── supabaseClient.ts  # Supabase კლიენტი
├── .env.local                 # გარემოს ცვლადები (არ დაემატოს git-ში!)
├── .env.local.sample          # მაგალითი
└── package.json
```

---

## 🧪 ტესტირება

### შემოწმება:

1. **მთავარი გვერდი**: http://localhost:3000
2. **რეგისტრაცია**: http://localhost:3000/auth/signup
3. **შესვლა**: http://localhost:3000/auth/login
4. **Dashboard**: http://localhost:3000/dashboard (მოითხოვს ავთორიზაციას)

### ელ-ფოსტით რეგისტრაცია:
- შეიყვანეთ email და პაროლი (მინ. 6 სიმბოლო)
- Supabase გამოგიგზავნით confirmation email-ს
- დაადასტურეთ email-ი და შედით

### სოციალური შესვლა:
- OAuth providers მუშაობს მხოლოდ კონფიგურაციის შემდეგ
- ადგილობრივად (localhost) ზოგიერთ provider-ს შეიძლება ჰქონდეს შეზღუდვები

---

## 📋 შემდეგი ეტაპები

### ეტაპი 2: მონაცემთა მოდელი და კრედიტების სისტემა
- [ ] `profiles` ცხრილის შექმნა (username, remaining_credits)
- [ ] `generations` ცხრილის შექმნა (prompt, image_url, style)
- [ ] Row Level Security (RLS) პოლისების დაყენება
- [ ] `decrement_credits()` PostgreSQL ფუნქცია
- [ ] კრედიტების UI კომპონენტი

### ეტაპი 3: AI ინტეგრაცია
- [ ] AI სერვისის შერჩევა (Replicate / Stability AI / DALL-E)
- [ ] `/api/generate` API Route
- [ ] გენერაციის ლოგიკა
- [ ] Supabase Storage ინტეგრაცია
- [ ] ფოტოს შენახვა და URL დაბრუნება

### ეტაპი 4: UI და ფრონტ-ენდი
- [ ] გენერაციის ფორმა და სტილების არჩევანი
- [ ] Loading state და პროგრესის ინდიკატორი
- [ ] შედეგების ჩვენება
- [ ] ისტორიის გვერდი (/history)
- [ ] ჩამოტვირთვის ფუნქციონალი

### ეტაპი 5: მონეტიზაცია
- [ ] Stripe ინტეგრაცია
- [ ] სააბონენტო გეგმები
- [ ] Webhook-ები კრედიტების დასამატებლად
- [ ] დეპლოიმენტი Vercel-ზე

---

## 🛠️ ტექნოლოგიები

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth (Email + OAuth)
- **Deployment**: Vercel (მომავალი)

---

## 📚 დოკუმენტაცია

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 მხარდაჭერა

თუ დახმარება გჭირდებათ Supabase-ის კონფიგურაციაში, შეგიძლიათ:
1. გადადით Supabase Discord: https://discord.supabase.com
2. ნახეთ Supabase დოკუმენტაცია: https://supabase.com/docs/guides/auth

---

**სტატუსი**: ✅ ეტაპი 1 დასრულებული - გთხოვთ დააკონფიგურიროთ Supabase და გაგრძელდება ეტაპი 2!

