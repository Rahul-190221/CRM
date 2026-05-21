"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import mainlogo from "@/assets/mainlogo.png";
import { loginUser, googleLogin, setPassword as setPasswordApi } from "@/lib/api/auth";
import { useGoogleLogin } from "@react-oauth/google";
import { getUserIdFromToken } from "@/lib/helpers/jwt";

export type FormValues = { email: string; password: string };

type DecodedUser = {
  id?: string;
  email?: string;
  role?: "admin" | "bdm" | string;
  exp?: number;
};

function dashboardPathForRole(role: string): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "bdm" || role === "senior-bdm" || role === "junior-bdm") return "/bdm/dashboard";
  return "/dashboard";
}


export default function LoginPage() {
  const [user, setUser] = useState<DecodedUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [setupPasswordEmail, setSetupPasswordEmail] = useState<string | null>(null);
  const [setupPassword, setSetupPassword] = useState('');
  const [setupPasswordConfirm, setSetupPasswordConfirm] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const router = useRouter();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const response = await googleLogin(tokenResponse.access_token);
        if (!response?.accessToken) {
          toast.error("Account not found. Please sign up first.");
          setTimeout(() => router.push("/register"), 1500);
          return;
        }
        const token = response.accessToken;
        Cookies.set("accessToken", token, { expires: 10, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
        localStorage.setItem("accessToken", token);
        const decoded = getUserIdFromToken() as DecodedUser;
        setUser(decoded);
        toast.success("Successfully logged in with Google");
      } catch {
        toast.error("Account not found. Please sign up first.");
        setTimeout(() => router.push("/register"), 1500);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Account not found. Please sign up first.");
      setTimeout(() => router.push("/register"), 1500);
    },
  });

  useEffect(() => {
    try {
      const decoded = getUserIdFromToken() as DecodedUser;
      if (decoded) setUser(decoded);
    } catch {
      Cookies.remove("accessToken");
      localStorage.removeItem("accessToken");
    }
  }, []);

  useEffect(() => {
    if (!user?.role) return;
    router.replace(dashboardPathForRole(user.role));
  }, [user, router]);

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const response = await loginUser(data);
      if (response?.message === 'PASSWORD_SETUP_REQUIRED') {
        setSetupPasswordEmail(response.email);
        toast('We also sent a setup link to your email as backup', { icon: '📧' });
        return;
      }
      if (!response?.accessToken) {
        toast.error("Account not found. Please sign up first.");
        setTimeout(() => router.push("/register"), 1500);
        return;
      }
      const token = response.accessToken;
      Cookies.set("accessToken", token, { expires: 10, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
      localStorage.setItem("accessToken", token);
      setUser(getUserIdFromToken() as DecodedUser);
      toast.success("Successfully logged in");
    } catch (error: any) {
      toast.error(error?.message || "An error occurred while logging in");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSetPassword() {
    if (setupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (setupPassword !== setupPasswordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSetupLoading(true);
    try {
      const response = await setPasswordApi(setupPasswordEmail!, setupPassword);
      const token = response.accessToken;
      Cookies.set("accessToken", token, { expires: 10, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
      localStorage.setItem("accessToken", token);
      setSetupPasswordEmail(null);
      setSetupPassword('');
      setSetupPasswordConfirm('');
      setUser(getUserIdFromToken() as DecodedUser);
      toast.success("Password set! You're now signed in.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to set password");
    } finally {
      setSetupLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl"
      >
        {/* brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-4 p-4 rounded-2xl bg-[#FACE39]/10 border border-[#FACE39]/20">
            <Image src={mainlogo} alt="Luminedge" width={48} height={48} style={{ width: 48, height: 'auto' }} />
          </div>
          <h1 className="text-3xl font-black text-[#00000F] tracking-tight">Luminedge</h1>
          <p className="text-sm font-medium text-[#00000F]/50 mt-1.5">Premium exam venue & training center</p>
        </div>

        {/* card */}
        <div className="rounded-3xl overflow-hidden">
          <div className="relative bg-white border border-[#FACE39]/15 rounded-3xl shadow-[0_8px_80px_rgba(250,206,57,0.18),0_2px_24px_rgba(0,0,0,0.08)]">
            {/* top yellow glow line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FACE39] to-transparent rounded-t-3xl" />

            {/* tab bar */}
            <div className="flex border-b border-gray-100">
              <div className="flex-1 relative py-5 text-center text-base font-extrabold text-[#FACE39]">
                Sign In
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-x-4 bottom-0 h-0.5 bg-[#FACE39] rounded-full"
                />
              </div>
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="flex-1 py-5 text-sm font-semibold text-[#00000F]/45 hover:text-[#00000F]/80 transition"
              >
                Sign Up
              </button>
            </div>

            <div className="p-10">
              {/* Google */}
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-[#00000F] transition mb-8 hover:border-[#FACE39]/60 hover:shadow-[0_4px_16px_rgba(250,206,57,0.25)]"
              >
                <FaGoogle className="text-red-400 text-base" />
                Continue with Google
              </motion.button>

              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[13px] font-bold text-[#00000F]/55 uppercase tracking-widest">or with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-[13px] font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">
                    Email address
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                    })}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-2xl border text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 transition ${
                      errors.email ? "border-red-400" : "border-gray-200 focus:border-[#FACE39]/60"
                    }`}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500 mt-1"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[13px] font-extrabold text-[#00000F]/80 uppercase tracking-widest">
                      Password
                    </label>
                    <Link href="/forget-password" className="text-xs text-[#FACE39] hover:text-[#E8B010] font-semibold transition">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 6, message: "Minimum 6 characters" },
                      })}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 pr-11 rounded-2xl border text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 transition ${
                        errors.password ? "border-red-400" : "border-gray-200 focus:border-[#FACE39]/60"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition"
                    >
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500 mt-1"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Remember me */}
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="h-4 w-4 accent-[#FACE39] rounded" />
                  <span className="text-sm font-bold text-[#00000F]/75">Remember me</span>
                </label>

                {/* Set Password Modal */}
                <AnimatePresence>
                  {setupPasswordEmail && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-xl border border-[#FACE39]/50 bg-[#FACE39]/8 px-4 py-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-extrabold text-[#00000F]/80 uppercase tracking-widest">Set Your Password</p>
                          <p className="text-xs text-[#00000F]/55 mt-0.5">Your account uses Google. Set a password to also sign in with email.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setSetupPasswordEmail(null); setSetupPassword(''); setSetupPasswordConfirm(''); }}
                          className="text-[#00000F]/40 hover:text-[#00000F]/70 text-lg leading-none ml-2"
                        >×</button>
                      </div>
                      <div className="relative">
                        <input
                          type={showSetupPassword ? "text" : "password"}
                          value={setupPassword}
                          onChange={e => setSetupPassword(e.target.value)}
                          placeholder="New password"
                          className="w-full px-4 py-3 pr-11 rounded-2xl border border-gray-200 focus:border-[#FACE39]/60 text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 transition"
                        />
                        <button type="button" onClick={() => setShowSetupPassword(!showSetupPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition">
                          {showSetupPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showSetupPassword ? "text" : "password"}
                          value={setupPasswordConfirm}
                          onChange={e => setSetupPasswordConfirm(e.target.value)}
                          placeholder="Confirm password"
                          className="w-full px-4 py-3 pr-11 rounded-2xl border border-gray-200 focus:border-[#FACE39]/60 text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 transition"
                        />
                        <button type="button" onClick={() => setShowSetupPassword(!showSetupPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition">
                          {showSetupPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                      </div>
                      <motion.button
                        type="button"
                        onClick={handleSetPassword}
                        disabled={setupLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="auth-submit-btn w-full py-3 rounded-2xl font-bold text-sm text-[#00000F] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {setupLoading ? "Setting password..." : "Set Password & Sign In"}
                      </motion.button>
                      <p className="text-[12px] text-[#00000F]/40 text-center">We also sent a backup link to your email</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`auth-submit-btn relative w-full py-3.5 rounded-2xl font-bold text-sm text-[#00000F] overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed${setupPasswordEmail ? ' hidden' : ''}`}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Signing in...
                      </>
                    ) : "Sign in"}
                  </span>
                </motion.button>
              </form>
            </div>

            {/* footer */}
            <div className="px-10 pb-8 text-center">
              <p className="text-xs font-bold text-[#00000F]/55">
                By continuing you agree to our{" "}
                <Link href="/terms" className="text-[#FACE39] hover:text-[#E8B010] font-extrabold underline underline-offset-2">Terms</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#FACE39] hover:text-[#E8B010] font-extrabold underline underline-offset-2">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
