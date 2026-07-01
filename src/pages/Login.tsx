import React, { useState } from "react";
import logo from "../assets/logoBNB.png";
import { useTheme } from "../context/ThemeContext";
import { loginAdmin } from "../api/auth/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const Login: React.FC = () => {
  const { login } = useAuth()

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload on form submit
    if (loading) return; // Prevent double submissions
    try {

      setLoading(true);
      const data = await loginAdmin({
        email, password
      })

      if (data.success) {
        login(data.token);
        navigate("/dashboard");
      }
      else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-500 relative overflow-hidden font-sans selection:bg-brand-gold selection:text-brand-charcoal ${isDark ? "bg-[#111111]" : "bg-[#F9F7F2]"
        }`}
    >
      {/* Premium Minimal Background Gradients */}
      <div
        className={`absolute top-0 right-0 w-[45rem] h-[45rem] rounded-full blur-[140px] pointer-events-none transition-opacity duration-700 ${isDark
          ? "bg-[#7B1113]/10 opacity-60"
          : "bg-[#7B1113]/5 opacity-40"
          }`}
      />
      <div
        className={`absolute bottom-0 left-0 w-[45rem] h-[45rem] rounded-full blur-[140px] pointer-events-none transition-opacity duration-700 ${isDark
          ? "bg-[#C89B3C]/5 opacity-50"
          : "bg-[#C89B3C]/3 opacity-30"
          }`}
      />

      {/* Theme Switcher Button - Minimalist & Elegant */}
      <button
        onClick={toggleTheme}
        className={`absolute top-8 right-8 flex items-center gap-2 px-3 py-1.5 border tracking-widest text-[10px] uppercase font-bold transition-all duration-300 rounded-none cursor-pointer ${isDark
          ? "border-brand-gold/20 text-brand-gold hover:border-brand-gold hover:text-brand-cream"
          : "border-brand-maroon/20 text-brand-maroon hover:border-brand-maroon hover:bg-brand-maroon hover:text-brand-cream"
          }`}
      >
        {isDark ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 117.072 0l-.707.707M6.343 6.343l-.707-.707m12.728 12.728l-.707-.707" />
            </svg>
            Light Mode
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Dark Mode
          </>
        )}
      </button>

      {/* Login Card */}
      <div
        className={`w-full max-w-[420px] p-10 border transition-all duration-500 rounded-none shadow-2xl relative z-10 ${isDark
          ? "bg-[#181818] border-[#2A2A2A] text-brand-cream"
          : "bg-[#FFFFFF] border-[#E8E2D5] text-brand-charcoal"
          }`}
      >

        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <img
              src={logo}
              alt="BNB Logo"
              className="h-14 w-auto object-contain select-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const span = document.createElement('span');
                  span.className = 'text-brand-maroon dark:text-brand-gold font-sans text-2xl font-extrabold tracking-widest';
                  span.innerText = 'B N B';
                  parent.appendChild(span);
                }
              }}
            />
          </div>

          {/* Refined Typography (Classic Serif + Geometric Sans Serif) */}
          <h2 className={`font-sans text-2xl tracking-wider font-extrabold uppercase ${isDark ? "text-brand-cream" : "text-[#3D0A0C]"
            }`}>
            Balaji Namkeen
          </h2>
          <p className={`text-[9px] font-bold tracking-[0.3em] uppercase mt-2 ${isDark ? "text-brand-gold" : "text-brand-maroon"
            }`}>
            Bhandar • Administrative Login
          </p>
        </div>

        {/* Minimalist Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Email input field with a sharp, thin bottom border */}
          <div className="relative group">
            <input
              type="email"
              required
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full py-2.5 bg-transparent border-b text-sm transition-all duration-300 rounded-none focus:outline-none ${isDark
                ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                }`}
              placeholder="Email Address"
            />
            <span
              className={`absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-focus-within:w-full ${isDark ? "bg-brand-gold" : "bg-brand-maroon"
                }`}
            />
          </div>

          {/* Password input field */}
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full py-2.5 pr-10 bg-transparent border-b text-sm transition-all duration-300 rounded-none focus:outline-none ${isDark
                ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                }`}
              placeholder="Password"
            />
            <span
              className={`absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-focus-within:w-full ${isDark ? "bg-brand-gold" : "bg-brand-maroon"
                }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-0 top-1/2 -translate-y-1/2 transition-colors cursor-pointer ${isDark ? "text-[#777777] hover:text-brand-cream" : "text-[#8E8677] hover:text-brand-charcoal"
                }`}
            >
              {showPassword ? (
                <span className="text-[10px] uppercase font-bold tracking-widest">Hide</span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-widest">Show</span>
              )}
            </button>
          </div>

          {/* Utility Row (Remember Me / Forgot Password) */}
          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className={`w-3.5 h-3.5 rounded-none appearance-none border transition-all duration-200 cursor-pointer ${isDark
                  ? "border-[#444444] checked:bg-brand-gold checked:border-brand-gold"
                  : "border-[#CCC5B8] checked:bg-brand-maroon checked:border-brand-maroon"
                  }`}
              />
              <span className={isDark ? "text-brand-beige/60" : "text-[#7A7263]"}>
                Remember Me
              </span>
            </label>
            <a
              href="#"
              className={`font-semibold hover:underline transition duration-200 ${isDark ? "text-brand-gold hover:text-brand-cream" : "text-brand-maroon hover:text-brand-charcoal"
                }`}
            >
              Forgot Password?
            </a>
          </div>

          {/* Premium Refined Action Button */}
          <button
            type="submit"
            className={`w-full py-3.5 font-bold tracking-[0.2em] text-[11px] uppercase border transition-all duration-300 rounded-none cursor-pointer ${isDark
              ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
              : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
              }`}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Footer brand info */}
        <div className="mt-12 text-center">
          <p className={`text-[9px] uppercase tracking-widest font-bold ${isDark ? "text-[#555555]" : "text-[#B5AF9F]"
            }`}>
            Balaji Namkeen Bhandar • Administrative Portal
          </p>
        </div>
      </div>
    </div>
  );
};
