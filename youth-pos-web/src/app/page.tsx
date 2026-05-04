"use client";

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
import { Article, initialArticles } from "@/data/articles";
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

  localStorage.setItem(
    "aipos_current_user",
    JSON.stringify({
      id: user.id,
      name: user.nickname || user.name,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role,
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
      role: user.role,
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
    <main className="relative min-h-screen overflow-hidden ocean-bg text-[#06243a]">
      <div className="pointer-events-none fixed inset-0 -z-10">
  <div className="absolute left-[8%] top-[12%] h-80 w-80 rounded-full bg-cyan-300/45 blur-[110px] float-soft" />
  <div className="absolute right-[6%] top-[20%] h-96 w-96 rounded-full bg-white/80 blur-[120px]" />
  <div className="absolute bottom-[6%] left-[38%] h-72 w-72 rounded-full bg-blue-300/25 blur-[110px]" />

  <span className="bubble left-[12%] top-[70%] h-5 w-5" />
  <span className="bubble left-[24%] top-[78%] h-3 w-3" style={{ animationDelay: "1s" }} />
  <span className="bubble right-[18%] top-[72%] h-6 w-6" style={{ animationDelay: "1.7s" }} />
  <span className="bubble right-[32%] top-[82%] h-4 w-4" style={{ animationDelay: "2.4s" }} />
</div>
      
      <nav className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur-2xl">
  <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
    <AiPosLogo dark />

    <div className="hidden items-center gap-5 text-xs font-bold uppercase tracking-[0.14em] text-black/50 md:flex">
      <a href="#promo" className="hover:text-[#0369a1]">
        Promo
      </a>
      <a href="#best-seller" className="hover:text-[#0369a1]">
        Best Seller
      </a>
      <a href="#stock" className="hover:text-[#0369a1]">
        Stock
      </a>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={openLogin}
        className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        Login
      </button>

      <button
        onClick={openRegister}
        className="rounded-full bg-[#06243a] px-4 py-2 text-xs font-black text-white shadow-md transition hover:-translate-y-0.5"
      >
        Daftar
      </button>
    </div>
  </div>
</nav>

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pt-14">
        <div className="scroll-reveal">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0ea5e9]/30 bg-white/70 px-4 py-2 text-sm font-black text-[#075985] shadow-sm">
            <Waves size={16} />
            Warung online dengan pickup cepat
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-[1] tracking-tight text-[#06243a] md:text-6xl">
            Belanja menu favorit,{" "}
            <span className="gold-gradient-text">cek stok live</span>, ambil di
            warung.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
            aiman pos menampilkan promo, best seller, dan stok barang secara public.
            Member bisa daftar, pilih kos atau isi alamat manual, lalu pesan
            online untuk diambil di warung.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={openRegister}
              className="shine-button group inline-flex items-center justify-center gap-2 rounded-xl bg-[#06243a] px-5 py-3 text-sm font-black text-white shadow-xl shadow-black/15 transition hover:-translate-y-0.5"
            >
              Daftar Member
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </button>

            <a
              href="#stock"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/75 px-5 py-3 text-sm font-black text-black shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Cek Live Stock
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl gap-4 md:grid-cols-3">
            <StatCard title="Produk" value={`${products.length} item`} />
            <StatCard title="Promo" value={`${promoProducts.length} aktif`} />
            <StatCard title="Stok Live" value={`${totalStock} pcs`} />
          </div>
        </div>

        <div className="scroll-reveal ecom-card ecom-glow rounded-[2.5rem] p-5">
          <div className="overflow-hidden rounded-[2rem] bg-[#06243a] text-white">
            <div className="border-b border-white/10 p-5">
              <p className="text-sm text-white/45">Live Catalogue</p>
              <div className="mt-2 flex items-center justify-between">
                <h2 className="text-2xl font-black">Hot Picks Hari Ini</h2>
                <span className="rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-200">
                  Open
                </span>
              </div>
            </div>

            <div className="space-y-3 p-5">
              {bestSellers.slice(0, 3).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.1]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.badgeColor} text-3xl`}
                    >
                      {item.image}
                    </div>

                    <div>
                      <p className="font-black">{item.name}</p>
                      <p className="text-sm text-white/45">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-white/35">Rank</p>
                    <p className="text-xl font-black text-[#f7d892]">
                      #{index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-black/45">Stok Menipis</p>
              <p className="mt-2 text-3xl font-black text-red-500">
                {lowStock}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-black/45">Pickup Area</p>
              <p className="mt-2 text-3xl font-black text-[#0369a1]">Kos</p>
            </div>
          </div>
        </div>
      </section>
<div className="relative h-20 overflow-hidden">
  <div className="ocean-wave-layer" />
</div>
      <section className="border-y border-black/10 bg-white/45 py-4 backdrop-blur">
        <div className="overflow-hidden">
          <div className="marquee-track flex w-max gap-8 px-5 text-sm font-black uppercase tracking-[0.2em] text-black/45">
            <span>Live Stock</span>
            <span>Promo Harian</span>
            <span>Pickup di Warung</span>
            <span>Best Seller</span>
            <span>Pesan dari Kos</span>
            <span>Live Stock</span>
            <span>Promo Harian</span>
            <span>Pickup di Warung</span>
            <span>Best Seller</span>
            <span>Pesan dari Kos</span>
          </div>
        </div>
      </section>

      <section id="promo" className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle
          eyebrow="Promo"
          title="Promo & Artikel Warung"
          description="Banner promo yang bisa dikelola oleh admin-master."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {activeArticles.map((article, index) => (
            <div
              key={article.id}
              className={`scroll-reveal group relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${article.gradient} p-6 text-white shadow-2xl transition hover:-translate-y-1 ${
                index === 0 ? "lg:col-span-2" : ""
              }`}
            >
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/20 blur-3xl transition group-hover:scale-125" />
              <div className="relative z-10 flex min-h-[250px] flex-col justify-between">
                <div>
                  <div className="mb-5 inline-flex rounded-full bg-black/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
                    {article.category}
                  </div>
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h3
                        className={`font-black leading-tight ${
                          index === 0 ? "text-4xl md:text-5xl" : "text-3xl"
                        }`}
                      >
                        {article.title}
                      </h3>
                      <p className="mt-4 max-w-xl text-white/80">
                        {article.subtitle}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] bg-white/20 p-4 text-5xl backdrop-blur">
                      {article.image}
                    </div>
                  </div>
                </div>

                <button
                  onClick={openRegister}
                  className="mt-8 w-fit rounded-full bg-white px-5 py-3 text-sm font-black text-black"
                >
                  Daftar & Pesan
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="best-seller" className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle
          eyebrow="Paling Laris"
          title="Best Seller"
          description="Produk favorit pelanggan yang paling sering dibeli."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((item, index) => (
            <div
              key={item.id}
              className="scroll-reveal ecom-card group relative overflow-hidden rounded-[1.8rem] p-5 transition hover:-translate-y-1"
            >
              <div className="mb-8 flex items-start justify-between">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${item.badgeColor} text-4xl shadow-xl`}
                >
                  {item.image}
                </div>

                <div className="rounded-full bg-[#0ea5e9]/15 px-3 py-1 text-sm font-black text-[#075985]">
                  #{index + 1}
                </div>
              </div>

              <p className="text-sm text-black/45">{item.category}</p>
              <h3 className="mt-1 text-xl font-black">{item.name}</h3>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-sm text-black/45">Terjual</p>
                  <p className="text-2xl font-black">{item.sold}</p>
                </div>

                <div className="flex items-center gap-1 rounded-full bg-yellow-400/25 px-3 py-2 text-yellow-700">
                  <Star size={15} fill="currentColor" />
                  <span className="text-sm font-bold">Hot</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle
          eyebrow="Diskon"
          title="Barang Lagi Promo"
          description="Produk dengan harga spesial yang sedang berjalan."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {promoProducts.map((item) => (
            <div
              key={item.id}
              className="scroll-reveal ecom-card relative overflow-hidden rounded-[2rem] p-6 transition hover:-translate-y-1"
            >
              <div className="mb-6 flex items-center justify-between">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${item.badgeColor} text-5xl shadow-xl`}
                >
                  {item.image}
                </div>

                <div className="rounded-full bg-[#06243a] px-4 py-2 text-sm font-black text-white">
                  -{item.discount}%
                </div>
              </div>

              <p className="text-sm text-black/45">{item.sku}</p>
              <h3 className="mt-1 text-2xl font-black">{item.name}</h3>
              <p className="mt-1 text-black/50">{item.category}</p>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  {item.normalPrice && (
                    <p className="text-sm text-black/35 line-through">
                      {formatRupiah(item.normalPrice)}
                    </p>
                  )}
                  <p className="text-2xl font-black text-[#0369a1]">
                    {formatRupiah(item.price)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#e0f2fe] px-4 py-3 text-right">
                  <p className="text-xs text-black/40">Stock</p>
                  <p className="font-black">{item.stock}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="stock" className="mx-auto max-w-7xl px-5 py-16 pb-28">
        <div className="scroll-reveal ecom-card rounded-[2rem] p-5 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="Live Stock"
              title="Cek Stok Produk"
              description="Cari produk berdasarkan nama, kategori, atau SKU tanpa login."
            />

            <div className="flex w-full items-center gap-3 rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm lg:max-w-md">
              <Search size={20} className="text-black/40" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Contoh: matcha, DRK-001, dessert..."
                className="w-full bg-transparent text-black outline-none placeholder:text-black/35"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="scroll-reveal grid gap-4 rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm md:grid-cols-[1fr_auto_auto] md:items-center"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.badgeColor} text-4xl`}
                  >
                    {item.image}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black">{item.name}</h3>
                      {item.isPromo && (
                        <span className="rounded-full bg-[#0ea5e9]/20 px-3 py-1 text-xs font-bold text-[#075985]">
                          Promo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-black/45">
                      {item.sku} · {item.category}
                    </p>
                  </div>
                </div>

                <div className="md:text-right">
                  <p className="text-sm text-black/40">Harga</p>
                  <p className="font-black">{formatRupiah(item.price)}</p>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#e0f2fe] px-4 py-3 md:min-w-44">
                  <div>
                    <p className="text-xs text-black/40">Stock</p>
                    <p className="text-2xl font-black">{item.stock}</p>
                  </div>

                  {item.stock <= 10 ? (
                    <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-600">
                      Menipis
                    </span>
                  ) : item.stock <= 20 ? (
                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-700">
                      Medium
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700">
                      Aman
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <button
        onClick={openRegister}
        className="shine-button fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#06243a] px-5 py-4 font-black text-white shadow-2xl shadow-black/25 transition hover:scale-105"
      >
        <Sailboat size={20} />
        Daftar
      </button>

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