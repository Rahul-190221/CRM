"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { signIn } from "next-auth/react";
// import { FcGoogle } from "react-icons/fc";

import { loginUser } from "../utils/actions/loginUser";
import { getUserIdFromToken } from "../helpers/jwt";

export type FormValues = {
  email: string;
  password: string;
};

const britishLogo = "/assets/british-logos.svg";

type DecodedUser = {
  id?: string;
  email?: string;
  role?: "admin" | "bdm" | "user" | "teacher" | string;
  exp?: number;
};

const roleToPath: Record<string, string> = {
  admin: "/admin/dashboard",
  bdm: "/bdm/dashboard",
  user: "/dashboard",
  teacher: "/teacher/dashboard",
};

export default function LoginPage() {
  const [user, setUser] = useState<DecodedUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit } = useForm<FormValues>();
  const router = useRouter();

  // Restore user from existing token on first load
  useEffect(() => {
    try {
      const decoded = getUserIdFromToken() as DecodedUser;
      if (decoded) setUser(decoded);
    } catch (e) {
      // token invalid/expired
      Cookies.remove("accessToken");
      localStorage.removeItem("accessToken");
    }
  }, []);

  // Redirect based on role
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

      // store token (prefer cookie; keep localStorage only if you must)
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
    <div className="my-4 px-2 md:px-4 lg:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div className="hidden lg:block w-full lg:w-[80%] h-[70%] m-auto">
          {/* your SVG omitted for brevity */}
          <h1 className="font-bold text-5xl py-2 lg:py-6 text-[#00000f]">
            Welcome to <br /> Luminedge.
          </h1>

          <div className="mt-4 lg:mt-3 text-xl lg:text-2xl text-[#00000f]">
            The most premium exam venue awarded by <br />
            <span className="block h-2"></span>
            <Image
              src={britishLogo}
              width={90}
              height={35}
              className="inline-block ml-0 h-10 w-auto"
              alt=""
            />
          </div>

          <p className="text-lg mt-4 lg:mt-20 text-[#00000f]">
            If you don&apos;t have an account <br />
            you can{" "}
            <Link className="text-[#FACE39] font-bold px-2" href="/register">
              Sign up here
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="card card-body w-full lg:w-[80%] mx-auto mt-20 lg:mt-32 px-4 py-6 rounded-xl"
          style={{ boxShadow: "0px 10px 30px rgba(250, 206, 57, 0.35)" }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">Sign in</h1>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold ml-0">Email*</span>
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="enter your email"
                className="input input-bordered border-[#FACE39] w-full"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold ml-0">Password*</span>
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="input input-bordered border-[#FACE39] w-full pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <Link href="/forget-password">
              <p className="text-xs text-end text-[#00000f] mt-2">
                Forgot password?
              </p>
            </Link>

            {/* Sign in button */}
            <div className="form-control mt-8 lg:mt-12">
              <button
                type="submit"
                className="btn bg-[#FACE39] w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <p className="text-center text-sm md:text-base mt-4">
            Don&apos;t have an account?{" "}
            <Link className="text-[#FACE39] font-bold" href="/register">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
