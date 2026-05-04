"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut, ShoppingBag, Store, UserRound } from "lucide-react";
import AiPosLogo from "@/components/AiPosLogo";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: "admin-master" | "cashier" | "member";
};

export default function ChooseRolePage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("aipos_current_user");

    if (!raw) {
      router.push("/");
      return;
    }

    const parsed = JSON.parse(raw);
    setUser(parsed);

    if (parsed.role === "admin-master") {
      router.push("/admin-master");
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("aipos_current_user");
    localStorage.removeItem("youth_pos_user");
    router.push("/");
  }

  if (!user) return null;

  const canOpenCashier = user.role === "cashier";
  const canOpenMember = user.role === "member" || user.role === "cashier";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080706] text-white">
      <div className="fixed inset-0 -z-10 luxury-noise" />
      <div className="fixed inset-0 -z-10 grid-luxury opacity-50" />
      <div className="fixed left-[12%] top-[18%] -z-10 h-80 w-80 rounded-full bg-[#d6b26e]/20 blur-[130px] animate-float-lux" />

      <div className="mx-auto max-w-6xl px-5 py-6">
        <nav className="mb-16 flex items-center justify-between">
          <AiPosLogo />
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>

        <section className="mx-auto max-w-4xl text-center reveal-card">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#d6b26e] text-black">
            <Store size={30} />
          </div>

          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            Halo, <span className="gold-text">{user.name}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-white/50">
            Pilih akses yang tersedia untuk akun kamu.
          </p>
        </section>

        <section className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          <AccessCard
            title="Member Order"
            description="Pesan online, pilih titik kos/nomor rumah, lalu ambil di warung."
            icon={<UserRound size={30} />}
            disabled={!canOpenMember}
            href="/member"
          />

          <AccessCard
            title="Kasir POS"
            description="Akses sistem kasir, transaksi, pembayaran, struk, barcode, dan laporan."
            icon={<ShoppingBag size={30} />}
            disabled={!canOpenCashier}
            href="/pos"
          />
        </section>
      </div>
    </main>
  );
}

function AccessCard({
  title,
  description,
  icon,
  disabled,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  disabled: boolean;
  href: string;
}) {
  if (disabled) {
    return (
      <div className="luxury-glass rounded-[2rem] p-7 opacity-40">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          {icon}
        </div>
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="mt-3 text-white/50">{description}</p>
        <p className="mt-6 text-sm font-bold text-red-200">
          Tidak tersedia untuk role ini.
        </p>
      </div>
    );
  }

  return (
    <a
      href={href}
      className="group luxury-glass shine-effect rounded-[2rem] p-7 transition hover:-translate-y-1"
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d6b26e] text-black">
        {icon}
      </div>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-3 text-white/50">{description}</p>

      <div className="mt-7 flex items-center gap-2 font-black text-[#f7e7b6]">
        Masuk
        <ArrowRight size={18} className="transition group-hover:translate-x-1" />
      </div>
    </a>
  );
}