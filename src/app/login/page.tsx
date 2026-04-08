"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

/**
 * Pixel Retro Theme Login Page
 * 
 * Features:
 * - Email and Password fields
 * - Success: Update auth store and redirect to /community
 * - Failure: Show specific error message
 * - Loading state with disabled button
 * - Link to /signup
 */
export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Simple validation for the login form
  const isEmailValid = /\S+@\S+\.\S+/.test(formData.email);
  const isPasswordValid = formData.password.length > 0;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      const response = await login(formData);
      // Store token and user data in global store (and localStorage)
      setAuth(response.access_token, response.user);
      // Navigate to community page after successful login
      router.push("/community");
    } catch (err: unknown) {
      // User requested specific error message for login failures
      setError("이메일 또는 비밀번호가 올바르지 않습니다");
    } finally {
      setLoading(false);
    }
  };

  const px = { fontFamily: '"Press Start 2P", cursive' } as const;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-yellow-400"
      style={{
        background: "linear-gradient(180deg, #fde047 0%, #facc15 100%)",
      }}
    >
      <div
        className="max-w-md w-full bg-white border-[4px] border-black shadow-[8px_8px_0_#000] p-8"
        style={{ ...px }}
      >
        <h1
          className="text-2xl mb-10 text-center uppercase tracking-tighter"
          style={{ animation: "float 3s ease-in-out infinite" }}
        >
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-[10px] mb-3 text-black">
              [ Email Address ]
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border-[3px] border-black p-3 text-[12px] focus:outline-none focus:bg-yellow-50 placeholder-gray-400"
              placeholder="PLAYER@MAIL.COM"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[10px] mb-3 text-black">
              [ Password ]
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border-[3px] border-black p-3 text-[12px] focus:outline-none focus:bg-yellow-50 placeholder-gray-400"
              placeholder="********"
              required
            />
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-100 border-[2px] border-red-500 p-2 text-red-600 text-[8px] leading-relaxed">
              ! ERROR: {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full py-5 border-[4px] border-black text-white text-[14px] transition-all transform active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_#000] ${!isFormValid || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#a855f7] hover:translate-x-0.5 hover:translate-y-0.5 shadow-[6px_6px_0_#000] hover:shadow-[4px_4px_0_#000]"
              }`}
          >
            {loading ? "AUTHENTICATING..." : "START SESSION"}
          </button>
        </form>

        {/* Footer Link to Signup */}
        <div className="mt-10 text-center text-[10px] leading-relaxed">
          계정이 없으신가요? <br />
          <Link href="/signup" className="text-blue-600 hover:text-blue-800 underline block mt-2 uppercase">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
