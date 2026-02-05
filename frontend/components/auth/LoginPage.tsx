"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { FaEye, FaEyeSlash, FaGoogle, FaApple } from "react-icons/fa";

import britishLogo from "@/assets/BRITISH logos.png";
import ieltsLogo from "@/assets/iELTSlogos.png";
import mainlogo from "@/assets/mainlogo.png";
import { loginUser, googleLogin } from "@/lib/api/auth";
import { useGoogleLogin } from "@react-oauth/google";
import { getUserIdFromToken } from "@/lib/helpers/jwt";

export type FormValues = {
  email: string;
  password: string;
};

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

export default function LoginPage() {
  const [user, setUser] = useState<DecodedUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const router = useRouter();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const response = await googleLogin(tokenResponse.access_token);
        if (!response?.accessToken) {
          toast.error("Google login failed");
          return;
        }
        const token = response.accessToken;
        Cookies.set("accessToken", token, { expires: 10, sameSite: "lax" });
        localStorage.setItem("accessToken", token);
        const decoded = getUserIdFromToken() as DecodedUser;
        setUser(decoded);
        toast.success("Successfully logged in with Google");
      } catch (error) {
        console.error("Google login error", error);
        toast.error("Google login failed");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error("Google login failed"),
  });

  useEffect(() => {
    try {
      const decoded = getUserIdFromToken() as DecodedUser;
      if (decoded) setUser(decoded);
    } catch (e) {
      Cookies.remove("accessToken");
      localStorage.removeItem("accessToken");
    }
  }, []);

  useEffect(() => {
    if (!user?.role) return;
    const dest = roleToPath[user.role] || "/dashboard";
    router.replace(dest);
  }, [user, router]);

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const response = await loginUser(data);

      if (!response?.accessToken) {
        toast.error("Invalid email or password");
        return;
      }

      const token = response.accessToken;
      Cookies.set("accessToken", token, { expires: 10, sameSite: "lax" });
      localStorage.setItem("accessToken", token);

      const decoded = getUserIdFromToken() as DecodedUser;
      setUser(decoded);
      toast.success("Successfully logged in");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error?.message || "An error occurred while logging in");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-white to-[#FFF3D6] flex items-center">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto shadow-2xl rounded-3xl overflow-hidden">
          {/* Left - Visual / Marketing */}
          <div className="hidden lg:flex flex-col p-12 bg-[url('/assets/abstract-bg.png')] bg-cover bg-center">
            <div className="flex items-center gap-3 mb-8">
              <Image src={mainlogo} alt="Luminedge" width={56} height={56} />
              <div>
                <h2 className="text-3xl font-extrabold text-[#0F172A]">Luminedge</h2>
                <p className="text-sm text-[#334155]">Premium exam venue & training</p>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-[#0b1220] leading-tight mb-4">Welcome to Luminedge — Where excellence meets comfort</h1>
            <p className="text-base text-[#334155] mb-6">State-of-the-art exam centres, expert invigilation and a seamless candidate experience.</p>

            <div className="flex gap-4 items-center mt-auto">
              <div className="bg-white/60 p-3 rounded-lg shadow">
                <Image src={britishLogo} alt="British Council" width={110} height={40} />
              </div>

            </div>
          </div>

          {/* Right - Form */}
          <div className="bg-white p-8 md:p-12 rounded-3xl"> 
            <div className="flex items-center justify-between mb-6"> 
              <div className="flex items-center gap-3">

                <span className="text-lg font-semibold text-[#0b1220]">Sign in to Luminedge</span>
              </div>
              <div className="text-sm text-[#64748B]">No account? <Link href="/register" className="text-[#F1C40F] font-semibold">Sign up</Link></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#0b1220]">Email</label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-400" : "border-[#F7D84A]"} bg-[#FFFBEA] focus:outline-none focus:ring-2 focus:ring-[#F7D84A]`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#0b1220]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.password ? "border-red-400" : "border-[#F7D84A]"} bg-[#FFFBEA] focus:outline-none focus:ring-2 focus:ring-[#F7D84A] pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 text-[#F1C40F] rounded" />
                  <span className="text-[#334155]">Remember me</span>
                </label>
                <Link href="/forget-password" className="text-[#0b1220] hover:underline">Forgot password?</Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#F1C40F] hover:bg-[#e6ba0a] text-[#071121] font-semibold rounded-lg transition"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-[#64748B]">or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button type="button" onClick={() => handleGoogleLogin()} className="flex items-center justify-center gap-2 py-2 border rounded-lg hover:shadow-sm">
                  <FaGoogle className="text-red-500" /> Google
                </button>
              </div>
            </form>

            <p className="text-center text-xs text-[#94A3B8] mt-6">
              By continuing you agree to our <Link href="/terms" className="text-[#F1C40F]">Terms</Link> and <Link href="/privacy" className="text-[#F1C40F]">Privacy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
