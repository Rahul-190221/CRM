"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

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

const roleToPath: Record<string, string> = {
  admin: "/admin/dashboard",
  bdm: "/bdm/dashboard",
};

/* ── floating orb config ── */
const ORBS = [
  { size: 420, x: "10%",  y: "5%",  color: "#FACE39", blur: 120, delay: 0 },
  { size: 320, x: "70%",  y: "60%", color: "#FACE39", blur: 100, delay: 1.5 },
  { size: 260, x: "50%",  y: "10%", color: "#FACE39", blur: 90,  delay: 0.8 },
  { size: 200, x: "80%",  y: "5%",  color: "#FACE39", blur: 80,  delay: 2.2 },
  { size: 180, x: "20%",  y: "75%", color: "#FACE39", blur: 70,  delay: 1.1 },
];

/* ── floating phrase chips ── */
const PHRASES = [
  { text: "KICK-START YOUR JOURNEY",          x: "15%", y: "6%",  delay: 0,   dur: 20, size: "text-xs",     depth: 28 },
  { text: "Study Abroad Consultants in BD",   x: "13%", y: "22%", delay: 1.3, dur: 24, size: "text-[10px]", depth: 16 },
  { text: "Creating a Better Tomorrow",       x: "16%", y: "40%", delay: 0.7, dur: 22, size: "text-xs",     depth: 22 },
  { text: "Transform Your Future",            x: "14%", y: "60%", delay: 2.0, dur: 19, size: "text-[10px]", depth: 12 },
  { text: "One-Stop Solution",                x: "18%", y: "78%", delay: 1.6, dur: 21, size: "text-[10px]", depth: 18 },
  { text: "STUDY ABROAD JOURNEY",             x: "64%", y: "6%",  delay: 0.4, dur: 23, size: "text-xs",     depth: 24 },
  { text: "English Proficiency Training",     x: "63%", y: "22%", delay: 1.8, dur: 20, size: "text-[10px]", depth: 14 },
  { text: "IELTS • TOEFL • PTE • GRE",        x: "65%", y: "40%", delay: 0.9, dur: 18, size: "text-xs",     depth: 30 },
  { text: "UK • USA • Canada • Australia",    x: "63%", y: "60%", delay: 2.3, dur: 25, size: "text-[10px]", depth: 11 },
  { text: "FREE Counselling",                 x: "67%", y: "78%", delay: 1.1, dur: 22, size: "text-[10px]", depth: 20 },
];

/* ── floating geometric shapes ── */
const SHAPES = [
  { type: "square", size: 24, x: "22%", y: "38%", delay: 0,   dur: 16, rot: 45,  depth: 35 },
  { type: "square", size: 16, x: "72%", y: "22%", delay: 1.2, dur: 20, rot: 20,  depth: 18 },
  { type: "square", size: 20, x: "20%", y: "62%", delay: 0.6, dur: 18, rot: 12,  depth: 26 },
  { type: "square", size: 14, x: "74%", y: "75%", delay: 1.9, dur: 22, rot: 35,  depth: 14 },
  { type: "line",   w: 50,    x: "14%", y: "18%", delay: 0.3, dur: 17, rot: -30, depth: 22 },
  { type: "line",   w: 36,    x: "70%", y: "42%", delay: 1.5, dur: 19, rot: 40,  depth: 32 },
  { type: "line",   w: 44,    x: "17%", y: "80%", delay: 0.8, dur: 21, rot: -20, depth: 15 },
  { type: "line",   w: 30,    x: "68%", y: "60%", delay: 2.2, dur: 15, rot: 60,  depth: 28 },
];

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
  const cardRef = useRef<HTMLDivElement>(null);

  /* cursor glow */
  const glowX = useMotionValue(-999);
  const glowY = useMotionValue(-999);

  useEffect(() => {
    const move = (e: MouseEvent) => { glowX.set(e.clientX - 160); glowY.set(e.clientY - 160); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [glowX, glowY]);

  /* 3-D tilt */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

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
    router.replace(roleToPath[user.role] || "/dashboard");
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
    <div
      className="relative min-h-screen overflow-hidden bg-white flex items-center justify-center px-4"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        const my = ((e.clientY - r.top)  / r.height - 0.5) * 2;
        e.currentTarget.style.setProperty("--mx", mx.toFixed(3));
        e.currentTarget.style.setProperty("--my", my.toFixed(3));
      }}
    >

      {/* ── animated background orbs ── */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
            opacity: 0.10,
          }}
          animate={{
            x: [0, 40, -30, 20, 0],
            y: [0, -30, 40, -20, 0],
            scale: [1, 1.15, 0.9, 1.05, 1],
          }}
          transition={{
            duration: 14 + i * 2,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* cursor glow */}
      <motion.div
        className="fixed pointer-events-none z-0 rounded-full"
        style={{
          top: 0, left: 0,
          x: glowX, y: glowY,
          width: 320, height: 320,
          background: "radial-gradient(circle, rgba(250,206,57,0.18) 0%, rgba(250,206,57,0.06) 40%, transparent 70%)",
        }}
      />

      {/* grid overlay */}
      <div className="absolute inset-0 pointer-events-none auth-grid-overlay" />

      {/* ── floating phrase chips (CSS parallax outer + framer float inner) ── */}
      {PHRASES.map((p, i) => (
        <div
          key={i}
          className={`parallax-el parallax-el-phrase lp-ph-${i}`}
        >
          <motion.div
            animate={{ y: [0, -16, 8, -10, 0], x: [0, 8, -6, 4, 0], rotate: [-1.5, 1.5, -1, 1, -1.5] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          >
            <span className={`${p.size} font-bold tracking-wide px-3 py-1.5 rounded-full border border-[#FACE39]/40 bg-white text-[#00000F]/75 whitespace-nowrap shadow-[0_2px_12px_rgba(250,206,57,0.30)]`}>
              {p.text}
            </span>
          </motion.div>
        </div>
      ))}

      {/* ── floating geometric shapes (CSS parallax outer + framer rotate inner) ── */}
      {SHAPES.map((s, i) => (
        <div key={i} className={`parallax-el lp-sh-${i}`}>
          <motion.div
            animate={{ rotate: [s.rot, s.rot + 20, s.rot - 10, s.rot + 5, s.rot], y: [0, -12, 8, -6, 0] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
          >
            {s.type === "square" ? (
              <div className={`sh-sq-${i} border border-[#FACE39]/50 rounded-sm shadow-[0_0_8px_rgba(250,206,57,0.35)]`} />
            ) : (
              <div className={`sh-ln-${i - 4} h-0.5 bg-gradient-to-r from-transparent via-[#FACE39]/60 to-transparent rounded-full shadow-[0_0_6px_rgba(250,206,57,0.30)]`} />
            )}
          </motion.div>
        </div>
      ))}

      {/* ── dot clusters ── */}
      <motion.div
        className="absolute hidden lg:block pointer-events-none z-0"
        style={{ left: "20%", top: "42%" }}
        animate={{ rotate: [0, 15, -10, 8, 0], scale: [1, 1.08, 0.94, 1.04, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          {[0,1,2].map(row => [0,1,2].map(col => (
            <circle key={`${row}-${col}`} cx={8 + col * 16} cy={8 + row * 16} r={2} fill="#FACE39" fillOpacity={0.18} />
          )))}
        </svg>
      </motion.div>
      <motion.div
        className="absolute hidden lg:block pointer-events-none z-0"
        style={{ right: "20%", bottom: "12%" }}
        animate={{ rotate: [0, -12, 8, -5, 0], scale: [1, 1.06, 0.96, 1.03, 1] }}
        transition={{ duration: 22, repeat: Infinity, delay: 1.4, ease: "easeInOut" }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {[0,1,2].map(row => [0,1,2].map(col => (
            <circle key={`${row}-${col}`} cx={7 + col * 13} cy={7 + row * 13} r={1.5} fill="#FACE39" fillOpacity={0.15} />
          )))}
        </svg>
      </motion.div>

      {/* ── page entry ── */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* brand */}
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="mb-4 p-4 rounded-2xl bg-[#FACE39]/10 border border-[#FACE39]/20"
          >
            <Image src={mainlogo} alt="Luminedge" width={48} height={48} />
          </motion.div>
          <h1 className="text-3xl font-black text-[#00000F] tracking-tight">Luminedge</h1>
          <p className="text-sm font-medium text-[#00000F]/50 mt-1.5">Premium exam venue & training center</p>
        </motion.div>

        {/* 3D card */}
        <motion.div
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
          className="rounded-3xl overflow-hidden"
        >
          {/* white card */}
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
                <span className="text-xs font-bold text-[#00000F]/55 uppercase tracking-widest">or with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-xs font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">
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
                    <label className="block text-xs font-extrabold text-[#00000F]/80 uppercase tracking-widest">
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
                      <p className="text-[10px] text-[#00000F]/40 text-center">We also sent a backup link to your email</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit — hidden when set-password popup is open */}
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
        </motion.div>
      </motion.div>
    </div>
  );
}
