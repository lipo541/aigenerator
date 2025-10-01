import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
            შემოგვიერთდით
          </h1>
          <p className="text-gray-300 text-lg">დაიწყეთ AI ვიზუალის შექმნა დღესვე</p>
        </div>
        <SignupForm />
      </div>
    </main>
  );
}
