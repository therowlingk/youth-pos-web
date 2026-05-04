"use client";
import ScrollReveal from "@/components/ScrollReveal";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgePercent,
  Filter,
  Search,
  Shell,
  SlidersHorizontal,
  Waves,
} from "lucide-react";
import AiPosLogo from "@/components/AiPosLogo";
import { Product, products as initialProducts } from "@/data/products";

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

type StockFilter = "all" | "safe" | "medium" | "low" | "empty";
type PromoFilter = "all" | "promo" | "normal";
type SortType = "name" | "price-low" | "price-high" | "stock-low" | "stock-high" | "sold-high";

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [promoFilter, setPromoFilter] = useState<PromoFilter>("all");
  const [sortType, setSortType] = useState<SortType>("name");

  useEffect(() => {
    const savedProducts = localStorage.getItem("youth_pos_products");

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      localStorage.setItem("youth_pos_products", JSON.stringify(initialProducts));
    }
  }, []);

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(products.map((item) => item.category)))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((item) => {
      const q = keyword.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchesCategory = category === "all" || item.category === category;

      const matchesPromo =
        promoFilter === "all" ||
        (promoFilter === "promo" && item.isPromo) ||
        (promoFilter === "normal" && !item.isPromo);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "safe" && item.stock > 20) ||
        (stockFilter === "medium" && item.stock > 10 && item.stock <= 20) ||
        (stockFilter === "low" && item.stock > 0 && item.stock <= 10) ||
        (stockFilter === "empty" && item.stock <= 0);

      return matchesSearch && matchesCategory && matchesPromo && matchesStock;
    });

    result = [...result].sort((a, b) => {
      if (sortType === "name") return a.name.localeCompare(b.name);
      if (sortType === "price-low") return a.price - b.price;
      if (sortType === "price-high") return b.price - a.price;
      if (sortType === "stock-low") return a.stock - b.stock;
      if (sortType === "stock-high") return b.stock - a.stock;
      if (sortType === "sold-high") return b.sold - a.sold;
      return 0;
    });

    return result;
  }, [products, keyword, category, stockFilter, promoFilter, sortType]);

  const totalStock = products.reduce((acc, item) => acc + item.stock, 0);
  const lowStock = products.filter((item) => item.stock > 0 && item.stock <= 10).length;
  const emptyStock = products.filter((item) => item.stock <= 0).length;
  const promoCount = products.filter((item) => item.isPromo).length;

  return (
    <main className="relative min-h-screen overflow-hidden ocean-bg text-[#06243a]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[8%] top-[12%] h-80 w-80 rounded-full bg-cyan-300/45 blur-[110px] float-soft" />
        <div className="absolute right-[6%] top-[20%] h-96 w-96 rounded-full bg-white/80 blur-[120px]" />
        <span className="bubble left-[12%] top-[75%] h-5 w-5" />
        <span className="bubble right-[20%] top-[78%] h-6 w-6" style={{ animationDelay: "1.3s" }} />
      </div>

      <nav className="sticky top-0 z-40 border-b border-sky-900/10 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <AiPosLogo dark />

          <a
            href="/"
            className="flex items-center gap-2 rounded-full bg-[#06243a] px-4 py-2 text-sm font-black text-white"
          >
            <ArrowLeft size={16} />
            Homepage
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="scroll-reveal mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-black text-sky-700 shadow-sm">
            <Waves size={17} />
            Live stock catalogue
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Cek stok produk secara <span className="ocean-gradient-text">real-time.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-black/55">
            Cari produk, filter berdasarkan kategori, promo, dan status stok.
            Cocok untuk pelanggan mengecek ketersediaan sebelum datang ke warung.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <MiniStat title="Total Produk" value={`${products.length}`} />
          <MiniStat title="Total Stok" value={`${totalStock}`} />
          <MiniStat title="Stok Menipis" value={`${lowStock}`} />
          <MiniStat title="Promo Aktif" value={`${promoCount}`} />
        </div>

        <div className="ocean-card scroll-reveal rounded-[2rem] p-5">
          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_180px]">
            <div className="flex items-center gap-3 rounded-2xl border border-sky-900/10 bg-white px-4 py-3">
              <Search size={18} className="text-sky-700/60" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari nama, SKU, kategori..."
                className="w-full bg-transparent outline-none placeholder:text-black/35"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-2xl border border-sky-900/10 bg-white px-4 py-3 outline-none"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "Semua Kategori" : item}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              className="rounded-2xl border border-sky-900/10 bg-white px-4 py-3 outline-none"
            >
              <option value="all">Semua Stok</option>
              <option value="safe">Aman</option>
              <option value="medium">Medium</option>
              <option value="low">Menipis</option>
              <option value="empty">Habis</option>
            </select>

            <select
              value={promoFilter}
              onChange={(e) => setPromoFilter(e.target.value as PromoFilter)}
              className="rounded-2xl border border-sky-900/10 bg-white px-4 py-3 outline-none"
            >
              <option value="all">Semua Produk</option>
              <option value="promo">Promo</option>
              <option value="normal">Normal</option>
            </select>

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="rounded-2xl border border-sky-900/10 bg-white px-4 py-3 outline-none"
            >
              <option value="name">Nama A-Z</option>
              <option value="price-low">Harga Termurah</option>
              <option value="price-high">Harga Termahal</option>
              <option value="stock-low">Stok Terkecil</option>
              <option value="stock-high">Stok Terbanyak</option>
              <option value="sold-high">Terlaris</option>
            </select>
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-black/45">
            <SlidersHorizontal size={17} />
            Menampilkan {filteredProducts.length} produk
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((item, index) => (
  <ScrollReveal key={item.id} delay={index * 60} direction="up">
    <div className="rounded-3xl border border-sky-900/10 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-5 flex items-start justify-between">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.badgeColor} text-4xl`}
                  >
                    {item.image}
                  </div>

                  {item.isPromo && (
                    <span className="flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-sky-700">
                      <BadgePercent size={14} />
                      Promo
                    </span>
                  )}
                </div>

                <p className="text-sm text-black/45">{item.sku} · {item.category}</p>
                <h3 className="mt-1 text-xl font-black">{item.name}</h3>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-sm text-black/40">Harga</p>
                    <p className="text-xl font-black text-sky-700">
                      {formatRupiah(item.price)}
                    </p>
                  </div>

                  <StockBadge stock={item.stock} />
                </div>
              </div>
  </ScrollReveal>
))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-3xl border border-dashed border-sky-900/20 bg-white/60 p-12 text-center">
              <Shell className="mx-auto text-sky-700" size={48} />
              <h3 className="mt-4 text-2xl font-black">Produk tidak ditemukan</h3>
              <p className="mt-2 text-black/50">
                Coba ubah keyword atau filter pencarian.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="ocean-card rounded-3xl p-5">
      <p className="text-sm text-black/45">{title}</p>
      <p className="mt-2 text-3xl font-black text-sky-700">{value}</p>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <div className="rounded-2xl bg-red-100 px-4 py-3 text-right">
        <p className="text-xs text-red-500">Stock</p>
        <p className="font-black text-red-600">Habis</p>
      </div>
    );
  }

  if (stock <= 10) {
    return (
      <div className="rounded-2xl bg-red-100 px-4 py-3 text-right">
        <p className="text-xs text-red-500">Stock</p>
        <p className="font-black text-red-600">{stock}</p>
      </div>
    );
  }

  if (stock <= 20) {
    return (
      <div className="rounded-2xl bg-yellow-100 px-4 py-3 text-right">
        <p className="text-xs text-yellow-600">Stock</p>
        <p className="font-black text-yellow-700">{stock}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-right">
      <p className="text-xs text-emerald-600">Stock</p>
      <p className="font-black text-emerald-700">{stock}</p>
    </div>
  );
}