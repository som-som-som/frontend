"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { AxiosError } from "axios";

/**
 * Pixel Retro Theme Signup Page
 * 
 * Includes:
 * - Username validation (min 2 chars)
 * - Email format validation
 * - Password validation (min 6 chars)
 * - API integration with error handling
 * - Zustand store integration
 */
export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validation logic
  const isUsernameValid = formData.username.length >= 2;
  const isEmailValid = /\S+@\S+\.\S+/.test(formData.email);
  const isPasswordValid = formData.password.length >= 6;
  const isFormValid = isUsernameValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      const response = await register(formData);
      // Immediately log in with the returned token and user data
      setAuth(response.access_token, response.user);
      router.push("/community");
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        // Handle server-side validation messages (e.g., duplicate email)
        setError(JSON.stringify(err.response.data.message));
      } else if (err instanceof AxiosError && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to register. Please try again.");
      }
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
          New Member
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label className="block text-[10px] mb-3 text-black">
              [ Nickname ]
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full border-[3px] border-black p-3 text-[12px] focus:outline-none focus:bg-yellow-50 placeholder-gray-400"
              placeholder="2+ chars required"
              required
            />
          </div>

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
              placeholder="example@mail.com"
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
              placeholder="6+ chars required"
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
            {loading ? "PROCESSING..." : "REGISTER NOW"}
          </button>
        </form>

        {/* Navigation Link */}
        <div className="mt-10 text-center text-[10px] leading-relaxed">
          ALREADY JOINED? <br />
          <Link href="/login" className="text-blue-600 hover:text-blue-800 underline block mt-2">
            GO TO LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
}
