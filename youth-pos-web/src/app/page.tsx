"use client";

import ScrollReveal from "@/components/ScrollReveal";
import { Article, initialArticles } from "@/data/articles";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgePercent,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  UserPlus,
  X,
  Waves,
Shell,
Fish,
Anchor,
Sailboat,
} from "lucide-react";
import AiPosLogo from "@/components/AiPosLogo";
import { products as initialProducts, Product } from "@/data/products";
import { AppUser, initialUsers } from "@/data/users";
import {
  initialLocationPoints,
  LocationPoint,
} from "@/data/locationPoints";

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

type ModalType = "login" | "register" | null;

export default function HomePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [locations, setLocations] =
    useState<LocationPoint[]>(initialLocationPoints);

  const [keyword, setKeyword] = useState("");
  const [modal, setModal] = useState<ModalType>(null);

  const [loginEmail, setLoginEmail] = useState("member@aipos.com");
  const [loginPassword, setLoginPassword] = useState("member123");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    nickname: "",
    email: "",
    password: "",
    kosLocationId: "",
    useManualAddress: false,
    manualAddress: "",
    addressNote: "",
  });

  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    const savedProducts = localStorage.getItem("youth_pos_products");
    const savedArticles = localStorage.getItem("youth_pos_articles");
    const savedUsers = localStorage.getItem("aipos_users");
    const savedLocations = localStorage.getItem("aipos_location_points");

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      localStorage.setItem("youth_pos_products", JSON.stringify(initialProducts));
    }

    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    } else {
      localStorage.setItem("youth_pos_articles", JSON.stringify(initialArticles));
    }

    if (savedUsers) {
        const parsedUsers: AppUser[] = JSON.parse(savedUsers);

         const mergedUsers = [
         ...parsedUsers,
         ...initialUsers.filter(
         (defaultUser) =>
        !parsedUsers.some(
          (savedUser) =>
            savedUser.email.toLowerCase() === defaultUser.email.toLowerCase()
        )
       ),
    ];

  setUsers(mergedUsers);
  localStorage.setItem("aipos_users", JSON.stringify(mergedUsers));
} else {
  setUsers(initialUsers);
  localStorage.setItem("aipos_users", JSON.stringify(initialUsers));
}

    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    } else {
      localStorage.setItem(
        "aipos_location_points",
        JSON.stringify(initialLocationPoints)
      );
    }
  }, []);

  const activeArticles = articles.filter((article) => article.isActive);

  const bestSellers = [...products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);

  const promoProducts = products.filter((item) => item.isPromo);

  const filteredProducts = useMemo(() => {
    const q = keyword.toLowerCase();

    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)
    );
  }, [keyword, products]);

  const activeLocations = locations.filter((item) => item.isActive);

  const selectedLocation =
    activeLocations.find(
      (item) => item.id === Number(registerForm.kosLocationId)
    ) || null;

  const totalStock = products.reduce((acc, item) => acc + item.stock, 0);
  const lowStock = products.filter((item) => item.stock <= 10).length;

  function openLogin() {
    setModal("login");
    setLoginError("");
    setShowPassword(false);
  }

  function openRegister() {
    setModal("register");
    setRegisterError("");
  }

  function closeModal() {
    setModal(null);
    setLoginError("");
    setRegisterError("");
  }

  function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setLoginError("");

  const mergedUsers = [
    ...users,
    ...initialUsers.filter(
      (defaultUser) =>
        !users.some(
          (savedUser) =>
            savedUser.email.toLowerCase() === defaultUser.email.toLowerCase()
        )
    ),
  ];

  localStorage.setItem("aipos_users", JSON.stringify(mergedUsers));

  const user = mergedUsers.find(
    (item) =>
      item.email.toLowerCase().trim() === loginEmail.toLowerCase().trim() &&
      item.password === loginPassword &&
      item.isActive
  );

  if (!user) {
    setLoginError("Email atau password salah, atau akun belum aktif.");
    return;
  }

  const normalizedRole =
  user.role === "cashier" || String(user.role).toLowerCase() === "kasir"
    ? "cashier"
    : user.role === "admin-master" || String(user.role).toLowerCase().includes("admin")
      ? "admin-master"
      : "member";

localStorage.removeItem("aipos_current_user");
localStorage.removeItem("youth_pos_user");

localStorage.setItem(
  "aipos_current_user",
  JSON.stringify({
    id: user.id,
    name: user.nickname || user.name,
    fullName: user.fullName || user.name,
    email: user.email,
    role: normalizedRole,
    kosLocationId: user.kosLocationId,
    kosLabel: user.kosLabel,
    manualAddress: user.manualAddress,
  })
);

localStorage.setItem(
  "youth_pos_user",
  JSON.stringify({
    id: user.id,
    name: user.nickname || user.name,
    fullName: user.fullName || user.name,
    email: user.email,
    role: normalizedRole,
  })
);

    if (user.role === "admin-master") {
    router.push("/admin-master");
    return;
  }

  if (user.role === "cashier") {
    router.push("/pos");
    return;
  }

  router.push("/member");
}

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegisterError("");

    if (
      !registerForm.fullName ||
      !registerForm.nickname ||
      !registerForm.email ||
      !registerForm.password
    ) {
      setRegisterError("Nama, panggilan, email, dan password wajib diisi.");
      return;
    }

    if (!registerForm.useManualAddress && !registerForm.kosLocationId) {
      setRegisterError("Pilih kos/titik lokasi atau gunakan alamat manual.");
      return;
    }

    if (registerForm.useManualAddress && !registerForm.manualAddress) {
      setRegisterError("Alamat manual wajib diisi.");
      return;
    }

    const emailExists = users.some(
      (item) => item.email.toLowerCase() === registerForm.email.toLowerCase()
    );

    if (emailExists) {
      setRegisterError("Email sudah terdaftar. Silakan login.");
      return;
    }

    const location = activeLocations.find(
      (item) => item.id === Number(registerForm.kosLocationId)
    );

    const newMember: AppUser = {
      id: Date.now(),
      name: registerForm.nickname,
      fullName: registerForm.fullName,
      nickname: registerForm.nickname,
      email: registerForm.email,
      password: registerForm.password,
      role: "member",
      isActive: true,
      kosLocationId: registerForm.useManualAddress ? undefined : location?.id,
      kosLabel: registerForm.useManualAddress
        ? "Alamat manual"
        : location
          ? `${location.label} - ${location.roomNumber}`
          : undefined,
      manualAddress: registerForm.useManualAddress
        ? registerForm.manualAddress
        : undefined,
      addressNote: registerForm.addressNote,
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [newMember, ...users];
    setUsers(nextUsers);
    localStorage.setItem("aipos_users", JSON.stringify(nextUsers));

    localStorage.setItem(
      "aipos_current_user",
      JSON.stringify({
        id: newMember.id,
        name: newMember.nickname,
        fullName: newMember.fullName,
        email: newMember.email,
        role: newMember.role,
        kosLocationId: newMember.kosLocationId,
        kosLabel: newMember.kosLabel,
        manualAddress: newMember.manualAddress,
      })
    );

    router.push("/member");
  }

  return (
  <main className="min-h-screen app-home-bg text-[#06243a]">
    <nav className="sticky top-0 z-40 border-b border-sky-900/10 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <AiPosLogo dark />

        <div className="flex items-center gap-2">
          <button
            onClick={openLogin}
            className="rounded-full border border-sky-900/10 bg-white px-4 py-2 text-xs font-black text-[#06243a] shadow-sm"
          >
            Login
          </button>

          <button
            onClick={openRegister}
            className="rounded-full bg-[#06243a] px-4 py-2 text-xs font-black text-white shadow-md"
          >
            Daftar
          </button>
        </div>
      </div>
    </nav>
<section id="promo" className="mx-auto max-w-6xl px-4 pb-2 pt-6">
  <ScrollReveal direction="up">
    <div className="mb-4 flex items-end justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">
          Promo
        </p>
        <h2 className="text-2xl font-black text-[#06243a]">
          Promo & Artikel
        </h2>
      </div>

      <button
        onClick={openRegister}
        className="text-sm font-black text-sky-700"
      >
        Daftar
      </button>
    </div>
  </ScrollReveal>

  <div className="app-scroll flex gap-4 overflow-x-auto pb-3">
    {activeArticles.map((article, index) => (
      <ScrollReveal key={article.id} delay={index * 90} direction="right">
        <button
          type="button"
          onClick={openRegister}
          className={`min-w-[280px] max-w-[280px] overflow-hidden rounded-[1.7rem] bg-gradient-to-br ${article.gradient} p-5 text-left text-white shadow-lg transition hover:-translate-y-1 md:min-w-[360px] md:max-w-[360px]`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em]">
                {article.category}
              </div>

              <h3 className="text-xl font-black leading-tight">
                {article.title}
              </h3>

              <p className="mt-2 line-clamp-2 text-sm text-white/80">
                {article.subtitle}
              </p>
            </div>

            <div className="rounded-2xl bg-white/20 p-3 text-4xl backdrop-blur">
              {article.image}
            </div>
          </div>

          <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-black">
            {article.ctaLabel || "Lihat Promo"}
          </span>
        </button>
      </ScrollReveal>
    ))}
  </div>

  {activeArticles.length === 0 && (
    <div className="rounded-3xl border border-dashed border-sky-900/20 bg-white/70 p-8 text-center text-black/50">
      Belum ada promo aktif.
    </div>
  )}
</section>

    <section className="mx-auto max-w-6xl px-4 py-6">
      <ScrollReveal direction="zoom">
      <div className="app-reveal rounded-[2rem] bg-gradient-to-br from-sky-500 to-cyan-400 p-5 text-white shadow-xl shadow-sky-500/20 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold text-white/80">
              Selamat datang di AI POS
            </p>

            <h1 className="max-w-2xl text-3xl font-black leading-tight md:text-5xl">
              Pesan dari kos, cek promo, ambil di warung.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 md:text-base">
              Lihat menu, promo, best seller, dan daftar sebagai member untuk
              pesan online.
            </p>
          </div>

          <div className="hidden rounded-[1.8rem] bg-white/20 p-5 text-6xl backdrop-blur md:block">
            🌊
          </div>
        </div>
      </div>
</ScrollReveal>
<ScrollReveal delay={120}>
      <div className="app-reveal mt-5 grid grid-cols-4 gap-3">
        <button
          onClick={openLogin}
          className="app-card rounded-3xl p-4 text-center transition hover:-translate-y-1"
        >
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            🔐
          </div>
          <p className="text-xs font-black">Login</p>
        </button>

        <button
          onClick={openRegister}
          className="app-card hover-lift rounded-3xl p-4 text-center transition hover:-translate-y-1"
        >
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
            👤
          </div>
          <p className="text-xs font-black">Daftar</p>
        </button>

        <a
          href="/stock"
          className="app-card hover-lift rounded-3xl p-4 text-center transition hover:-translate-y-1"
        >
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            📦
          </div>
          <p className="text-xs font-black">Stock</p>
        </a>

        <a
          href="#promo"
          className="app-card hover-lift rounded-3xl p-4 text-center transition hover:-translate-y-1"
        >
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            🎟️
          </div>
          <p className="text-xs font-black">Promo</p>
        </a>
      </div>
    </ScrollReveal>  
    </section>

        <section id="best-seller" className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">
            Paling Laris
          </p>
          <h2 className="text-2xl font-black">Best Seller</h2>
        </div>

        <a href="/stock" className="text-sm font-black text-sky-700">
          Lihat stock
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {bestSellers.map((item, index) => (
  <ScrollReveal key={item.id} delay={index * 80} direction="up">
    <div className="app-card hover-lift rounded-[1.5rem] p-4 transition hover:-translate-y-1">
            <div className="mb-4 flex items-start justify-between">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.badgeColor} text-3xl`}
              >
                {item.image}
              </div>

              <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-black text-sky-700">
                #{index + 1}
              </span>
            </div>

            <p className="text-xs text-black/45">{item.category}</p>
            <h3 className="line-clamp-1 font-black">{item.name}</h3>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] text-black/40">Harga</p>
                <p className="text-sm font-black text-sky-700">
                  {formatRupiah(item.price)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-black/40">Terjual</p>
                <p className="text-sm font-black">{item.sold}</p>
              </div>
            </div>
              </div>
  </ScrollReveal>
))}
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 py-6 pb-20">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">
            Diskon
          </p>
          <h2 className="text-2xl font-black">Barang Promo</h2>
        </div>

        <a href="/stock" className="text-sm font-black text-sky-700">
          Semua produk
        </a>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {promoProducts.map((item, index) => (
  <ScrollReveal key={item.id} delay={index * 80} direction="left">
    <div className="app-card hover-lift flex items-center gap-4 rounded-[1.5rem] p-4 transition hover:-translate-y-1">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.badgeColor} text-4xl`}
            >
              {item.image}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-cyan-100 px-2 py-1 text-[10px] font-black text-sky-700">
                  -{item.discount}%
                </span>
                <span className="text-xs text-black/40">{item.sku}</span>
              </div>

              <h3 className="line-clamp-1 font-black">{item.name}</h3>
              <p className="text-sm font-black text-sky-700">
                {formatRupiah(item.price)}
              </p>

              <p className="mt-1 text-xs text-black/45">
                Stock {item.stock}
              </p>
            </div>
              </div>
  </ScrollReveal>
))}
      </div>
    </section>

    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-full border border-sky-900/10 bg-white/90 p-2 shadow-2xl backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={openLogin}
          className="rounded-full px-4 py-3 text-xs font-black text-[#06243a]"
        >
          Login
        </button>

        <button
          onClick={openRegister}
          className="rounded-full bg-[#06243a] px-4 py-3 text-xs font-black text-white"
        >
          Daftar
        </button>

        <a
          href="/stock"
          className="rounded-full px-4 py-3 text-center text-xs font-black text-[#06243a]"
        >
          Stock
        </a>
      </div>
    </div>

    {modal === "login" && (
      <LoginModal
        email={loginEmail}
        password={loginPassword}
        showPassword={showPassword}
        error={loginError}
        setEmail={setLoginEmail}
        setPassword={setLoginPassword}
        setShowPassword={setShowPassword}
        onSubmit={handleLogin}
        onClose={closeModal}
        onOpenRegister={openRegister}
      />
    )}

    {modal === "register" && (
      <RegisterModal
        form={registerForm}
        setForm={setRegisterForm}
        error={registerError}
        locations={activeLocations}
        selectedLocation={selectedLocation}
        onSubmit={handleRegister}
        onClose={closeModal}
        onOpenLogin={openLogin}
      />
    )}
  </main>
);
}

function LoginModal({
  email,
  password,
  showPassword,
  error,
  setEmail,
  setPassword,
  setShowPassword,
  onSubmit,
  onClose,
  onOpenRegister,
}: {
  email: string;
  password: string;
  showPassword: boolean;
  error: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setShowPassword: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onOpenRegister: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-[2rem] bg-white p-6 text-black shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-black/5 hover:bg-black/10"
        >
          <X size={18} />
        </button>

        <div className="mb-7">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#06243a] text-white">
            <Store />
          </div>
          <h2 className="text-3xl font-black">Login aiman pos</h2>
          <p className="mt-2 text-sm leading-6 text-black/45">
            Masuk sebagai member, kasir, atau owner. Admin tetap hidden dan tidak
            ditampilkan di homepage.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label>
            <span className="text-sm font-bold text-black/60">Email</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-[#f0f9ff] px-4 py-4">
              <Mail size={18} className="text-black/35" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                className="w-full bg-transparent outline-none placeholder:text-black/30"
              />
            </div>
          </label>

          <label>
            <span className="text-sm font-bold text-black/60">Password</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-[#f0f9ff] px-4 py-4">
              <Lock size={18} className="text-black/35" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="w-full bg-transparent outline-none placeholder:text-black/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-black/40 hover:text-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button className="shine-button flex w-full items-center justify-center gap-2 rounded-2xl bg-[#06243a] px-6 py-4 font-black text-white">
            Login
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-5 rounded-2xl bg-[#e0f2fe] p-4 text-sm text-black/55">
          <p className="font-bold text-black">Belum punya akun?</p>
          <button
            onClick={onOpenRegister}
            className="mt-2 font-black text-[#0369a1]"
          >
            Daftar member sekarang
          </button>
        </div>

        <div className="mt-4 text-xs text-black/40">
          <p>Demo member: member@aipos.com / member123</p>
          <p>Demo kasir: kasir@aipos.com / kasir123</p>
        </div>
      </div>
    </div>
  );
}

function RegisterModal({
  form,
  setForm,
  error,
  locations,
  selectedLocation,
  onSubmit,
  onClose,
  onOpenLogin,
}: {
  form: {
    fullName: string;
    nickname: string;
    email: string;
    password: string;
    kosLocationId: string;
    useManualAddress: boolean;
    manualAddress: string;
    addressNote: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      nickname: string;
      email: string;
      password: string;
      kosLocationId: string;
      useManualAddress: boolean;
      manualAddress: string;
      addressNote: string;
    }>
  >;
  error: string;
  locations: LocationPoint[];
  selectedLocation: LocationPoint | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onOpenLogin: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 py-8 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-auto rounded-[2rem] bg-white p-6 text-black shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-black/5 hover:bg-black/10"
        >
          <X size={18} />
        </button>

        <div className="mb-7">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0ea5e9] text-white">
            <UserPlus />
          </div>
          <h2 className="text-3xl font-black">Daftar Member</h2>
          <p className="mt-2 text-sm leading-6 text-black/45">
            Buat akun untuk pesan online dan ambil pesanan di warung.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <FormInput
            label="Nama Lengkap"
            value={form.fullName}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, fullName: value }))
            }
            placeholder="Contoh: Ahmad Rizki Pratama"
          />

          <FormInput
            label="Nama Panggilan"
            value={form.nickname}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, nickname: value }))
            }
            placeholder="Contoh: Rizki"
          />

          <FormInput
            label="Email"
            value={form.email}
            onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
            placeholder="nama@email.com"
          />

          <FormInput
            label="Password"
            value={form.password}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, password: value }))
            }
            placeholder="password"
            type="password"
          />

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 rounded-2xl bg-[#e0f2fe] p-4">
              <input
                type="checkbox"
                checked={form.useManualAddress}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    useManualAddress: e.target.checked,
                  }))
                }
              />
              <span className="font-black">
                Saya ingin mengisi alamat manual
              </span>
            </label>
          </div>

          {!form.useManualAddress && (
            <>
              <label className="md:col-span-2">
                <span className="text-sm font-bold text-black/60">
                  Pilih Kos / Titik Rumah
                </span>
                <select
                  value={form.kosLocationId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      kosLocationId: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f0f9ff] px-4 py-4 outline-none"
                >
                  <option value="">Pilih titik lokasi</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.label} - {location.roomNumber} - {location.area}
                    </option>
                  ))}
                </select>
              </label>

              {selectedLocation && (
                <div className="md:col-span-2 overflow-hidden rounded-3xl border border-black/10 bg-[#f0f9ff]">
                  <div className="flex items-start gap-3 p-4">
                    <MapPin className="mt-1 text-[#0369a1]" />
                    <div>
                      <p className="font-black">{selectedLocation.label}</p>
                      <p className="text-sm text-black/50">
                        {selectedLocation.area} · {selectedLocation.roomNumber}
                      </p>
                      <p className="text-sm text-black/40">
                        {selectedLocation.note}
                      </p>
                    </div>
                  </div>

                  <iframe
                    title="Map lokasi kos"
                    src={`https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=17&output=embed`}
                    className="h-64 w-full"
                    loading="lazy"
                  />
                </div>
              )}
            </>
          )}

          {form.useManualAddress && (
            <label className="md:col-span-2">
              <span className="text-sm font-bold text-black/60">
                Alamat Manual
              </span>
              <textarea
                value={form.manualAddress}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    manualAddress: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Contoh: Kos Putra Mandiri, kamar 12, gang sebelah warung..."
                className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-[#f0f9ff] px-4 py-4 outline-none placeholder:text-black/30"
              />
            </label>
          )}

          <label className="md:col-span-2">
            <span className="text-sm font-bold text-black/60">
              Catatan Tambahan
            </span>
            <textarea
              value={form.addressNote}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, addressNote: e.target.value }))
              }
              rows={3}
              placeholder="Contoh: kalau pagar tertutup, chat dulu..."
              className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-[#f0f9ff] px-4 py-4 outline-none placeholder:text-black/30"
            />
          </label>

          {error && (
            <div className="md:col-span-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button className="shine-button md:col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-[#06243a] px-6 py-4 font-black text-white">
            Daftar & Masuk
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-black/50">
          Sudah punya akun?{" "}
          <button onClick={onOpenLogin} className="font-black text-[#0369a1]">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label>
      <span className="text-sm font-bold text-black/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f0f9ff] px-4 py-4 outline-none placeholder:text-black/30"
      />
    </label>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="scroll-reveal rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur">
      <p className="text-xs text-black/45">{title}</p>
      <p className="mt-1 text-lg font-black text-[#075985]">{value}</p>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="scroll-reveal">
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#0369a1]/70">
        <Shell size={15} />
        {eyebrow}
      </div>
      <h2 className="text-2xl font-black tracking-tight text-[#06243a] md:text-4xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
        {description}
      </p>
    </div>
  );
}