"use client";
import {
  initialLocationPoints,
  LocationPoint,
} from "@/data/locationPoints";
import { OnlineOrder, OnlineOrderStatus } from "@/data/orders";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  Eye,
  EyeOff,
  FilePlus2,
  LogOut,
  Megaphone,
  PackagePlus,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  MapPin,
  ClipboardList,
} from "lucide-react";
import AiPosLogo from "@/components/AiPosLogo";
import { Article, initialArticles } from "@/data/articles";
import { Product, products as initialProducts } from "@/data/products";
import { AppUser, initialUsers } from "@/data/users";

type AdminTab =
  | "dashboard"
  | "products"
  | "stock"
  | "reports"
  | "cashiers"
  | "articles"
  | "locations"
  | "online-orders";

type Transaction = {
  id: string;
  date: string;
  items: {
    id: number;
    sku: string;
    name: string;
    price: number;
    qty: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  change: number;
  paymentMethod: "cash" | "qris" | "card";
  cashier: string;
};

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

function yearKey() {
  return new Date().toISOString().slice(0, 4);
}

export default function AdminMasterPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<LocationPoint[]>([]);
const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);

const [locationForm, setLocationForm] = useState({
  label: "",
  area: "",
  roomNumber: "",
  note: "",
  lat: "",
  lng: "",
});
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockKeyword, setStockKeyword] = useState("");

  const [productForm, setProductForm] = useState({
    sku: "",
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "🛍️",
    isPromo: false,
    discount: "",
  });

  const [cashierForm, setCashierForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [articleForm, setArticleForm] = useState({
    title: "",
    subtitle: "",
    category: "",
    image: "🔥",
    content: "",
    ctaLabel: "Lihat Detail",
    gradient: "from-fuchsia-500 via-pink-500 to-cyan-400",
    isActive: true,
  });

  useEffect(() => {
    const userRaw = localStorage.getItem("aipos_current_user") || localStorage.getItem("youth_pos_user");

    if (!userRaw) {
      router.push("/login");
      return;
    }
    const savedLocations = localStorage.getItem("aipos_location_points");
const savedOnlineOrders = localStorage.getItem("aipos_online_orders");

if (savedLocations) {
  setLocations(JSON.parse(savedLocations));
} else {
  setLocations(initialLocationPoints);
  localStorage.setItem(
    "aipos_location_points",
    JSON.stringify(initialLocationPoints)
  );
}

if (savedOnlineOrders) {
  setOnlineOrders(JSON.parse(savedOnlineOrders));
}
    const user = JSON.parse(userRaw);

    if (user.role !== "admin-master") {
      alert("Akses ditolak. Halaman ini khusus Admin Master.");
      router.push("/login");
      return;
    }

    const savedProducts = localStorage.getItem("youth_pos_products");
    const savedArticles = localStorage.getItem("youth_pos_articles");
    const savedUsers = localStorage.getItem("aipos_users");
    const savedTransactions = localStorage.getItem("youth_pos_transactions");

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialProducts);
      localStorage.setItem("youth_pos_products", JSON.stringify(initialProducts));
    }

    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    } else {
      setArticles(initialArticles);
      localStorage.setItem("youth_pos_articles", JSON.stringify(initialArticles));
    }

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(initialUsers);
      localStorage.setItem("aipos_users", JSON.stringify(initialUsers));
    }

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, [router]);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem("youth_pos_products", JSON.stringify(products));
    }
  }, [products]);
  useEffect(() => {
  if (locations.length > 0) {
    localStorage.setItem("aipos_location_points", JSON.stringify(locations));
  }
}, [locations]);

useEffect(() => {
  localStorage.setItem("aipos_online_orders", JSON.stringify(onlineOrders));
}, [onlineOrders]);
  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem("youth_pos_articles", JSON.stringify(articles));
    }
  }, [articles]);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("aipos_users", JSON.stringify(users));
    }
  }, [users]);

  const todayTransactions = transactions.filter(
    (trx) => trx.date.slice(0, 10) === todayKey()
  );

  const monthTransactions = transactions.filter(
    (trx) => trx.date.slice(0, 7) === monthKey()
  );

  const yearTransactions = transactions.filter(
    (trx) => trx.date.slice(0, 4) === yearKey()
  );

  const todayRevenue = todayTransactions.reduce((acc, trx) => acc + trx.total, 0);
  const monthRevenue = monthTransactions.reduce((acc, trx) => acc + trx.total, 0);
  const yearRevenue = yearTransactions.reduce((acc, trx) => acc + trx.total, 0);

  const totalStock = products.reduce((acc, item) => acc + item.stock, 0);
  const lowStock = products.filter((item) => item.stock <= 10).length;
  const activeCashiers = users.filter(
    (user) => user.role === "cashier" && user.isActive
  ).length;

  const filteredStock = useMemo(() => {
    const q = stockKeyword.toLowerCase();

    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [stockKeyword, products]);

  function logout() {
    localStorage.removeItem("aipos_current_user");
    localStorage.removeItem("youth_pos_user");
    router.push("/login");
  }

  function addProduct(e: React.FormEvent) {
    e.preventDefault();

    if (
      !productForm.sku ||
      !productForm.name ||
      !productForm.category ||
      !productForm.price ||
      !productForm.stock
    ) {
      alert("Lengkapi data produk.");
      return;
    }

    const skuExists = products.some(
      (item) => item.sku.toLowerCase() === productForm.sku.toLowerCase()
    );

    if (skuExists) {
      alert("SKU sudah digunakan.");
      return;
    }

    const product: Product = {
      id: Date.now(),
      sku: productForm.sku,
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      normalPrice: undefined,
      stock: Number(productForm.stock),
      sold: 0,
      isPromo: productForm.isPromo,
      discount: productForm.isPromo ? Number(productForm.discount || 0) : undefined,
      image: productForm.image || "🛍️",
      badgeColor: "from-cyan-400 to-fuchsia-400",
    };

    setProducts((prev) => [product, ...prev]);

    setProductForm({
      sku: "",
      name: "",
      category: "",
      price: "",
      stock: "",
      image: "🛍️",
      isPromo: false,
      discount: "",
    });

    alert("Produk berhasil ditambahkan.");
  }

  function updateStock(id: number, stock: number) {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock } : item))
    );
  }

  function deleteProduct(id: number) {
    if (!confirm("Hapus produk ini?")) return;
    setProducts((prev) => prev.filter((item) => item.id !== id));
  }

  function addCashier(e: React.FormEvent) {
    e.preventDefault();

    if (!cashierForm.name || !cashierForm.email || !cashierForm.password) {
      alert("Lengkapi data kasir.");
      return;
    }

    const emailExists = users.some(
      (user) => user.email.toLowerCase() === cashierForm.email.toLowerCase()
    );

    if (emailExists) {
      alert("Email sudah digunakan.");
      return;
    }

    const newCashier: AppUser = {
      id: Date.now(),
      name: cashierForm.name,
      email: cashierForm.email,
      password: cashierForm.password,
      role: "cashier",
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newCashier, ...prev]);

    setCashierForm({
      name: "",
      email: "",
      password: "",
    });

    alert("User kasir berhasil dibuat.");
  }
  function addLocation(e: React.FormEvent) {
  e.preventDefault();

  if (
    !locationForm.label ||
    !locationForm.area ||
    !locationForm.roomNumber ||
    !locationForm.lat ||
    !locationForm.lng
  ) {
    alert("Lengkapi titik lokasi.");
    return;
  }

  const newLocation: LocationPoint = {
    id: Date.now(),
    label: locationForm.label,
    area: locationForm.area,
    roomNumber: locationForm.roomNumber,
    note: locationForm.note,
    lat: Number(locationForm.lat),
    lng: Number(locationForm.lng),
    isActive: true,
  };

  setLocations((prev) => [newLocation, ...prev]);

  setLocationForm({
    label: "",
    area: "",
    roomNumber: "",
    note: "",
    lat: "",
    lng: "",
  });

  alert("Titik kos/rumah berhasil ditambahkan.");
}

function toggleLocation(id: number) {
  setLocations((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    )
  );
}

function deleteLocation(id: number) {
  if (!confirm("Hapus titik lokasi ini?")) return;
  setLocations((prev) => prev.filter((item) => item.id !== id));
}

function updateOrderStatus(id: string, status: OnlineOrderStatus) {
  setOnlineOrders((prev) =>
    prev.map((order) => (order.id === id ? { ...order, status } : order))
  );
}
  function toggleUser(id: number) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user
      )
    );
  }

  function deleteUser(id: number) {
    const target = users.find((user) => user.id === id);

    if (target?.role === "admin-master") {
      alert("Admin Master utama tidak boleh dihapus.");
      return;
    }

    if (!confirm("Hapus user ini?")) return;

    setUsers((prev) => prev.filter((user) => user.id !== id));
  }

  function addArticle(e: React.FormEvent) {
    e.preventDefault();

    if (
      !articleForm.title ||
      !articleForm.subtitle ||
      !articleForm.category ||
      !articleForm.content
    ) {
      alert("Lengkapi data artikel.");
      return;
    }

    const newArticle: Article = {
      id: Date.now(),
      title: articleForm.title,
      subtitle: articleForm.subtitle,
      category: articleForm.category,
      image: articleForm.image,
      content: articleForm.content,
      ctaLabel: articleForm.ctaLabel || "Lihat Detail",
      gradient: articleForm.gradient,
      isActive: articleForm.isActive,
      createdAt: new Date().toISOString(),
    };

    setArticles((prev) => [newArticle, ...prev]);

    setArticleForm({
      title: "",
      subtitle: "",
      category: "",
      image: "🔥",
      content: "",
      ctaLabel: "Lihat Detail",
      gradient: "from-fuchsia-500 via-pink-500 to-cyan-400",
      isActive: true,
    });

    alert("Banner artikel berhasil dibuat.");
  }

  function toggleArticle(id: number) {
    setArticles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  }

  function deleteArticle(id: number) {
    if (!confirm("Hapus artikel ini?")) return;
    setArticles((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050510] text-white">
      <div className="fixed inset-0 -z-10 noise" />
      <div className="fixed inset-0 -z-10 grid-glow opacity-50" />
      <div className="fixed right-0 top-0 -z-10 h-[460px] w-[460px] rounded-full bg-fuchsia-500/20 blur-[130px]" />
      <div className="fixed bottom-0 left-0 -z-10 h-[460px] w-[460px] rounded-full bg-cyan-400/20 blur-[130px]" />

      <div className="mx-auto max-w-7xl px-5 py-6">
        <nav className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <AiPosLogo />
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/70">
              <ShieldCheck size={16} className="text-fuchsia-200" />
              Admin Master Control Center
            </div>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Kelola semua sistem AI-POS
            </h2>
            <p className="mt-2 text-white/45">
              Produk, stok, laporan, banner, dan user kasir.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/"
              className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15"
            >
              Homepage
            </a>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100 hover:bg-red-500/25"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>

        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<BarChart3 size={18} />} label="Dashboard" />
          <TabButton active={tab === "products"} onClick={() => setTab("products")} icon={<PackagePlus size={18} />} label="Tambah Produk" />
          <TabButton active={tab === "stock"} onClick={() => setTab("stock")} icon={<Boxes size={18} />} label="Stok Barang" />
          <TabButton active={tab === "reports"} onClick={() => setTab("reports")} icon={<CalendarDays size={18} />} label="Laporan" />
          <TabButton active={tab === "cashiers"} onClick={() => setTab("cashiers")} icon={<Users size={18} />} label="User Kasir" />
          <TabButton active={tab === "articles"} onClick={() => setTab("articles")} icon={<Megaphone size={18} />} label="Banner Artikel" />
          <TabButton active={tab === "online-orders"} onClick={() => setTab("online-orders")} icon={<ClipboardList size={18} />} label="Pesanan Online"/>
          <TabButton
          active={tab === "locations"}
          onClick={() => setTab("locations")}
          icon={<MapPin size={18} />}
          label="Titik Kos"
          />
        </div>

        {tab === "dashboard" && (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Omzet Hari Ini" value={formatRupiah(todayRevenue)} desc={`${todayTransactions.length} transaksi`} />
            <MetricCard title="Omzet Bulan Ini" value={formatRupiah(monthRevenue)} desc={`${monthTransactions.length} transaksi`} />
            <MetricCard title="Total Stok" value={String(totalStock)} desc={`${products.length} produk aktif`} />
            <MetricCard title="Kasir Aktif" value={String(activeCashiers)} desc={`${lowStock} produk stok menipis`} />
          </section>
        )}

        {tab === "products" && (
          <section className="glass rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">Tambah Produk</h2>
            <p className="mt-1 text-white/45">
              Produk yang dibuat admin akan tampil di homepage dan POS kasir.
            </p>

            <form onSubmit={addProduct} className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="SKU / Barcode" value={productForm.sku} onChange={(v) => setProductForm((p) => ({ ...p, sku: v }))} placeholder="Contoh: DRK-010" />
              <Input label="Nama Produk" value={productForm.name} onChange={(v) => setProductForm((p) => ({ ...p, name: v }))} placeholder="Contoh: Lychee Tea" />
              <Input label="Kategori" value={productForm.category} onChange={(v) => setProductForm((p) => ({ ...p, category: v }))} placeholder="Drink / Food / Dessert" />
              <Input label="Harga" type="number" value={productForm.price} onChange={(v) => setProductForm((p) => ({ ...p, price: v }))} placeholder="25000" />
              <Input label="Stok Awal" type="number" value={productForm.stock} onChange={(v) => setProductForm((p) => ({ ...p, stock: v }))} placeholder="50" />
              <Input label="Emoji Produk" value={productForm.image} onChange={(v) => setProductForm((p) => ({ ...p, image: v }))} placeholder="🥤" />

              <label className="rounded-3xl border border-white/10 bg-black/25 p-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={productForm.isPromo}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, isPromo: e.target.checked }))
                    }
                  />
                  <span className="font-bold">Jadikan barang promo</span>
                </div>
              </label>

              {productForm.isPromo && (
                <Input label="Diskon Promo (%)" type="number" value={productForm.discount} onChange={(v) => setProductForm((p) => ({ ...p, discount: v }))} placeholder="20" />
              )}

              <button className="rounded-3xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-6 py-4 font-black md:col-span-2 animated-gradient">
                Simpan Produk
              </button>
            </form>
          </section>
        )}
        {tab === "online-orders" && (
  <section className="glass rounded-[2rem] p-6">
    <div className="mb-6">
      <h2 className="text-2xl font-black">Pesanan Online Member</h2>
      <p className="text-white/45">
        Monitor pesanan pickup dari member.
      </p>
    </div>

    <div className="space-y-4">
      {onlineOrders.map((order) => (
        <div
          key={order.id}
          className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-black">{order.id}</p>
              <p className="text-sm text-white/45">
                {new Date(order.createdAt).toLocaleString("id-ID")}
              </p>
              <p className="mt-2 text-sm text-white/60">
                Member: {order.memberName} · {order.memberEmail}
              </p>
              <p className="mt-1 text-sm text-white/60">
                Lokasi: {order.pickupLocationLabel} · {order.pickupRoomNumber}
              </p>
              <p className="text-sm text-white/40">
                Catatan titik: {order.pickupNote}
              </p>
              {order.customerNote && (
                <p className="mt-2 text-sm text-[#f7e7b6]">
                  Catatan customer: {order.customerNote}
                </p>
              )}
            </div>

            <div className="min-w-48">
              <label className="text-sm text-white/45">Status</label>
              <select
                value={order.status}
                onChange={(e) =>
                  updateOrderStatus(
                    order.id,
                    e.target.value as OnlineOrderStatus
                  )
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm text-white/60"
                >
                  <span>
                    {item.name} x {item.qty}
                  </span>
                  <span>
                    Rp {(item.price * item.qty).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between text-xl font-black">
              <span>Total</span>
              <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      ))}

      {onlineOrders.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45">
          Belum ada pesanan online.
        </div>
      )}
    </div>
  </section>
)}
{tab === "locations" && (
  <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
    <div className="glass h-fit rounded-[2rem] p-6">
      <h2 className="text-2xl font-black">Tambah Titik Kos/Rumah</h2>
      <p className="mt-1 text-white/45">
        Titik ini akan dipilih member saat pesan pickup.
      </p>

      <form onSubmit={addLocation} className="mt-6 space-y-4">
        <Input
          label="Nama Lokasi"
          value={locationForm.label}
          onChange={(v) => setLocationForm((p) => ({ ...p, label: v }))}
          placeholder="Kos Melati"
        />

        <Input
          label="Area"
          value={locationForm.area}
          onChange={(v) => setLocationForm((p) => ({ ...p, area: v }))}
          placeholder="Gang Utama"
        />

        <Input
          label="Nomor Rumah/Kamar"
          value={locationForm.roomNumber}
          onChange={(v) => setLocationForm((p) => ({ ...p, roomNumber: v }))}
          placeholder="Kamar 01"
        />

        <Input
          label="Catatan"
          value={locationForm.note}
          onChange={(v) => setLocationForm((p) => ({ ...p, note: v }))}
          placeholder="Dekat gerbang hitam"
        />

        <Input
          label="Latitude"
          value={locationForm.lat}
          onChange={(v) => setLocationForm((p) => ({ ...p, lat: v }))}
          placeholder="-6.2"
        />

        <Input
          label="Longitude"
          value={locationForm.lng}
          onChange={(v) => setLocationForm((p) => ({ ...p, lng: v }))}
          placeholder="106.816666"
        />

        <button className="w-full rounded-3xl bg-[#d6b26e] py-4 font-black text-black">
          Simpan Titik
        </button>
      </form>
    </div>

    <div className="glass rounded-[2rem] p-6">
      <h2 className="text-2xl font-black">Daftar Titik Kos/Rumah</h2>

      <div className="mt-5 space-y-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]"
          >
            <div className="grid gap-4 p-5 md:grid-cols-[1fr_260px]">
              <div>
                <p className="font-black">{location.label}</p>
                <p className="text-sm text-white/45">
                  {location.area} · {location.roomNumber}
                </p>
                <p className="text-sm text-white/35">{location.note}</p>
                <p className="mt-2 text-xs text-white/30">
                  {location.lat}, {location.lng}
                </p>
              </div>

              <iframe
                title={location.label}
                src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=17&output=embed`}
                className="h-36 w-full rounded-2xl border border-white/10"
                loading="lazy"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 p-4">
              <button
                onClick={() => toggleLocation(location.id)}
                className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                  location.isActive
                    ? "bg-emerald-500/15 text-emerald-100"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {location.isActive ? "Aktif" : "Nonaktif"}
              </button>

              <button
                onClick={() => deleteLocation(location.id)}
                className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}

        {locations.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45">
            Belum ada titik lokasi.
          </div>
        )}
      </div>
    </div>
  </section>
)}
        {tab === "stock" && (
          <section className="glass rounded-[2rem] p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-black">Cek & Update Stok Barang</h2>
                <p className="text-white/45">
                  Admin Master bisa memonitor dan mengubah stok.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/30 px-5 py-4 lg:w-96">
                <Search size={19} className="text-white/35" />
                <input
                  value={stockKeyword}
                  onChange={(e) => setStockKeyword(e.target.value)}
                  placeholder="Cari SKU, nama, kategori..."
                  className="w-full bg-transparent outline-none placeholder:text-white/35"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredStock.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-4 md:grid-cols-[1fr_160px_160px_auto] md:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.badgeColor} text-3xl`}>
                      {item.image}
                    </div>
                    <div>
                      <p className="font-black">{item.name}</p>
                      <p className="text-sm text-white/45">
                        {item.sku} · {item.category}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-white/45">Harga</p>
                    <p className="font-bold">{formatRupiah(item.price)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-white/45">Stok</p>
                    <input
                      type="number"
                      value={item.stock}
                      onChange={(e) => updateStock(item.id, Number(e.target.value))}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 outline-none"
                    />
                  </div>

                  <button
                    onClick={() => deleteProduct(item.id)}
                    className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "reports" && (
          <section className="grid gap-5 lg:grid-cols-3">
            <ReportCard title="Harian" revenue={todayRevenue} transactions={todayTransactions.length} />
            <ReportCard title="Bulanan" revenue={monthRevenue} transactions={monthTransactions.length} />
            <ReportCard title="Tahunan" revenue={yearRevenue} transactions={yearTransactions.length} />

            <div className="glass rounded-[2rem] p-6 lg:col-span-3">
              <h3 className="text-2xl font-black">Transaksi Terbaru</h3>
              <div className="mt-5 space-y-3">
                {transactions.slice(0, 8).map((trx) => (
                  <div
                    key={trx.id}
                    className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-black">{trx.id}</p>
                      <p className="text-sm text-white/45">
                        {new Date(trx.date).toLocaleString("id-ID")} · {trx.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                    <p className="text-xl font-black">{formatRupiah(trx.total)}</p>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45">
                    Belum ada transaksi.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {tab === "cashiers" && (
          <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <div className="glass h-fit rounded-[2rem] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                  <UserPlus />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Tambah Kasir</h2>
                  <p className="text-sm text-white/45">Buat akun kasir baru.</p>
                </div>
              </div>

              <form onSubmit={addCashier} className="space-y-4">
                <Input label="Nama Kasir" value={cashierForm.name} onChange={(v) => setCashierForm((p) => ({ ...p, name: v }))} placeholder="Contoh: Rani" />
                <Input label="Email" value={cashierForm.email} onChange={(v) => setCashierForm((p) => ({ ...p, email: v }))} placeholder="rani@aipos.com" />
                <Input label="Password" value={cashierForm.password} onChange={(v) => setCashierForm((p) => ({ ...p, password: v }))} placeholder="password kasir" />

                <button className="w-full rounded-3xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-4 font-black">
                  Tambah User Kasir
                </button>
              </form>
            </div>

            <div className="glass rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Daftar User</h2>
              <div className="mt-5 space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-black">{user.name}</p>
                      <p className="text-sm text-white/45">
                        {user.email} · {user.role}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleUser(user.id)}
                        className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                          user.isActive
                            ? "bg-emerald-500/15 text-emerald-100"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </button>

                      <button
                        onClick={() => deleteUser(user.id)}
                        className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === "articles" && (
          <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <div className="glass h-fit rounded-[2rem] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                  <FilePlus2 />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Banner Artikel</h2>
                  <p className="text-sm text-white/45">Tampil di homepage.</p>
                </div>
              </div>

              <form onSubmit={addArticle} className="space-y-4">
                <Input label="Judul" value={articleForm.title} onChange={(v) => setArticleForm((p) => ({ ...p, title: v }))} placeholder="Promo Weekend" />
                <Input label="Subtitle" value={articleForm.subtitle} onChange={(v) => setArticleForm((p) => ({ ...p, subtitle: v }))} placeholder="Deskripsi singkat" />
                <Input label="Kategori" value={articleForm.category} onChange={(v) => setArticleForm((p) => ({ ...p, category: v }))} placeholder="Promo" />
                <Input label="Emoji" value={articleForm.image} onChange={(v) => setArticleForm((p) => ({ ...p, image: v }))} placeholder="🔥" />

                <label>
                  <span className="text-sm text-white/55">Isi Artikel</span>
                  <textarea
                    value={articleForm.content}
                    onChange={(e) =>
                      setArticleForm((p) => ({ ...p, content: e.target.value }))
                    }
                    rows={5}
                    placeholder="Tulis detail promo..."
                    className="mt-2 w-full resize-none rounded-3xl border border-white/10 bg-black/30 px-5 py-4 outline-none placeholder:text-white/30"
                  />
                </label>

                <button className="w-full rounded-3xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-4 font-black">
                  Publish Banner
                </button>
              </form>
            </div>

            <div className="glass rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Daftar Banner</h2>
              <div className="mt-5 space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
                    <div className={`bg-gradient-to-r ${article.gradient} p-5`}>
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-white/70">{article.category}</p>
                          <h3 className="text-2xl font-black">{article.title}</h3>
                          <p className="mt-1 text-sm text-white/75">{article.subtitle}</p>
                        </div>
                        <div className="text-5xl">{article.image}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <p className="line-clamp-1 text-sm text-white/45">{article.content}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleArticle(article.id)}
                          className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${
                            article.isActive
                              ? "bg-emerald-500/15 text-emerald-100"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {article.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                          {article.isActive ? "Aktif" : "Nonaktif"}
                        </button>
                        <button
                          onClick={() => deleteArticle(article.id)}
                          className="flex items-center gap-2 rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100"
                        >
                          <Trash2 size={16} />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
        active
          ? "bg-white text-black"
          : "bg-white/10 text-white hover:bg-white/15"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MetricCard({
  title,
  value,
  desc,
}: {
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="glass rounded-[2rem] p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
        <BarChart3 />
      </div>
      <p className="text-sm text-white/45">{title}</p>
      <h3 className="mt-2 text-3xl font-black">{value}</h3>
      <p className="mt-2 text-sm text-white/45">{desc}</p>
    </div>
  );
}

function ReportCard({
  title,
  revenue,
  transactions,
}: {
  title: string;
  revenue: number;
  transactions: number;
}) {
  return (
    <div className="glass rounded-[2rem] p-6">
      <p className="text-sm text-white/45">Laporan {title}</p>
      <h3 className="mt-3 text-3xl font-black">{formatRupiah(revenue)}</h3>
      <p className="mt-2 text-white/45">{transactions} transaksi</p>
    </div>
  );
}

function Input({
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
      <span className="text-sm text-white/55">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-3xl border border-white/10 bg-black/30 px-5 py-4 outline-none placeholder:text-white/30"
      />
    </label>
  );
  
}