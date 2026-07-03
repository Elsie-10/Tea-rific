"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok || !data.success) {
      setError(data.error || "Unable to create account. Please try again.");
      return;
    }

    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#2C2C2C]">Create account</h1>
          <p className="text-sm text-[#6B3F1F] mt-2">Join Tea-Terrific and start ordering.</p>
        </div>

        {error ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-2xl border border-[#E5D9C5] bg-[#FBF7F1] px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#6B3F1F] focus:ring-2 focus:ring-[#EDE0D0]"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-2xl border border-[#E5D9C5] bg-[#FBF7F1] px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#6B3F1F] focus:ring-2 focus:ring-[#EDE0D0]"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-2xl border border-[#E5D9C5] bg-[#FBF7F1] px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#6B3F1F] focus:ring-2 focus:ring-[#EDE0D0]"
              placeholder="(optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-2xl border border-[#E5D9C5] bg-[#FBF7F1] px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#6B3F1F] focus:ring-2 focus:ring-[#EDE0D0]"
              placeholder="Create a password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#6B3F1F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#52311a] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B3F1F]">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
