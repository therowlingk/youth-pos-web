"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, ShoppingBag } from "lucide-react";
import AiPosLogo from "@/components/AiPosLogo";
import { AppUser, initialUsers } from "@/data/users";

export default function LoginPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [email, setEmail] = useState("kasir@aipos.com");
  const [password, setPassword] = useState("kasir123");
  const [error, setError] = useState("");

  useEffect(() => {
  const userRaw =
    localStorage.getItem("aipos_current_user") ||
    localStorage.getItem("youth_pos_user");

  if (!userRaw) {
    router.push("/login");
    return;
  }

  const user = JSON.parse(userRaw);

  if (user.role !== "cashier") {
    alert("Akses ditolak. Halaman POS khusus kasir.");
    router.push("/login");
  }
}, [router]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const user = users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password &&
        item.isActive
    );

    if (!user) {
      setError("Email atau password salah, atau user tidak aktif.");
      return;
    }

    localStorage.setItem(
      "aipos_current_user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    );

    /**
     * Backward compatibility buat kode lama yang masih cek youth_pos_user.
     * Nanti pelan-pelan bisa diganti semua ke aipos_current_user.
     */
    localStorage.setItem(
      "youth_pos_user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    );

    if (user.role === "admin-master") {
      router.push("/admin-master");
    } else {
      router.push("/pos");
    }
  }

  function fillKasir() {
    setEmail("kasir@aipos.com");
    setPassword("kasir123");
  }

  function fillMaster() {
    setEmail("master@aipos.com");
    setPassword("master123");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050510] px-5 text-white">
      <div className="fixed inset-0 -z-10 noise" />
      <div className="fixed inset-0 -z-10 grid-glow opacity-60" />

      <div className="fixed left-[10%] top-[12%] -z-10 h-72 w-72 rounded-full bg-cyan-400/25 blur-[110px] animate-float-slow" />
      <div className="fixed right-[10%] bottom-[10%] -z-10 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-[120px] animate-pulse-glow" />

      <div className="glass w-full max-w-md rounded-[2rem] p-7 soft-glow">
        <a
          href="/"
          className="mb-8 inline-flex text-sm text-white/50 hover:text-white"
        >
          ← Kembali ke homepage
        </a>

        <div className="mb-8">
          <AiPosLogo />
          <h2 className="mt-7 text-3xl font-black">Login AI-POS</h2>
          <p className="mt-2 text-sm text-white/45">
            Admin Master mengelola sistem. Kasir hanya masuk ke POS.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={fillKasir}
            className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-left hover:bg-white/[0.12]"
          >
            <ShoppingBag size={20} className="mb-2 text-cyan-200" />
            <p className="font-black">Kasir</p>
            <p className="text-xs text-white/45">Akses POS</p>
          </button>

          <button
            type="button"
            onClick={fillMaster}
            className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-left hover:bg-white/[0.12]"
          >
            <ShieldCheck size={20} className="mb-2 text-fuchsia-200" />
            <p className="font-black">Admin Master</p>
            <p className="text-xs text-white/45">Full control</p>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-white/60">Email</label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
              <Mail size={18} className="text-white/35" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-white/30"
                placeholder="Email"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60">Password</label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
              <Lock size={18} className="text-white/35" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-white/30"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 py-4 font-black transition hover:scale-[1.01] animated-gradient">
            Masuk
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-white/[0.06] p-4 text-sm text-white/50">
          <p className="font-bold text-white">Demo akun:</p>
          <p>Admin: master@aipos.com / master123</p>
          <p>Kasir: kasir@aipos.com / kasir123</p>
        </div>
      </div>
    </main>
  );
}