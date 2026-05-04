"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  LogOut,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import AiPosLogo from "@/components/AiPosLogo";
import { products as initialProducts, Product } from "@/data/products";
import {
  initialLocationPoints,
  LocationPoint,
} from "@/data/locationPoints";
import { OnlineOrder, OnlineOrderItem } from "@/data/orders";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: "admin-master" | "cashier" | "member";
};

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function MemberPage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [keyword, setKeyword] = useState("");
  const [cart, setCart] = useState<OnlineOrderItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null
  );
  const [customerNote, setCustomerNote] = useState("");
  const [successOrder, setSuccessOrder] = useState<OnlineOrder | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("aipos_current_user");

    if (!raw) {
      router.push("/");
      return;
    }

    const parsed = JSON.parse(raw);

    if (parsed.role !== "member" && parsed.role !== "cashier") {
      router.push("/");
      return;
    }

    setUser(parsed);

    const savedProducts = localStorage.getItem("youth_pos_products");
    const savedLocations = localStorage.getItem("aipos_location_points");
    const savedOrders = localStorage.getItem("aipos_online_orders");

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialProducts);
      localStorage.setItem("youth_pos_products", JSON.stringify(initialProducts));
    }

    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    } else {
      setLocations(initialLocationPoints);
      localStorage.setItem(
        "aipos_location_points",
        JSON.stringify(initialLocationPoints)
      );
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, [router]);

  useEffect(() => {
    localStorage.setItem("aipos_online_orders", JSON.stringify(orders));
  }, [orders]);

  const activeLocations = locations.filter((item) => item.isActive);

  const filteredProducts = useMemo(() => {
    const q = keyword.toLowerCase();

    return products.filter(
      (item) =>
        item.stock > 0 &&
        (item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q))
    );
  }, [keyword, products]);

  const selectedLocation =
    activeLocations.find((item) => item.id === selectedLocationId) || null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  function logout() {
    localStorage.removeItem("aipos_current_user");
    localStorage.removeItem("youth_pos_user");
    router.push("/");
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);

      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          qty: 1,
        },
      ];
    });
  }

  function decreaseQty(id: number) {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  }

  function increaseQty(id: number) {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
    );
  }

  function removeItem(id: number) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function submitOrder() {
    if (!user) return;

    if (cart.length === 0) {
      alert("Keranjang masih kosong.");
      return;
    }

    if (!selectedLocation) {
      alert("Pilih titik kos/nomor rumah dulu.");
      return;
    }

    const order: OnlineOrder = {
      id: `ORD-${Date.now()}`,
      memberName: user.name,
      memberEmail: user.email,
      items: cart,
      subtotal,
      serviceType: "pickup",
      pickupLocationId: selectedLocation.id,
      pickupLocationLabel: selectedLocation.label,
      pickupRoomNumber: selectedLocation.roomNumber,
      pickupNote: selectedLocation.note,
      customerNote,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [order, ...prev]);
    setSuccessOrder(order);
    setCart([]);
    setCustomerNote("");
  }

  if (!user) return null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080706] text-white">
      <div className="fixed inset-0 -z-10 luxury-noise" />
      <div className="fixed inset-0 -z-10 grid-luxury opacity-40" />

      <div className="mx-auto max-w-7xl px-5 py-6">
        <nav className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <AiPosLogo />

          <div className="flex items-center gap-3">
            <a
              href="/choose-role"
              className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15"
            >
              Pilih Role
            </a>
            <button
              onClick={logout}
              className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100"
            >
              <LogOut size={18} />
            </button>
          </div>
        </nav>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_390px]">
          <div className="reveal-card">
            <p className="mb-4 inline-flex rounded-full border border-[#d6b26e]/25 bg-[#d6b26e]/10 px-4 py-2 text-sm font-bold text-[#f7e7b6]">
              Member pickup order
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-tight md:text-6xl">
              Pesan dari kos,{" "}
              <span className="gold-text">ambil saat sudah siap.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-white/50">
              Pilih menu, tentukan titik kos/nomor rumah, lalu pesanan akan
              masuk ke admin/warung untuk disiapkan.
            </p>
          </div>

          <div className="luxury-glass rounded-[2rem] p-5 reveal-card">
            <div className="mb-4 flex items-center gap-3">
              <MapPin className="text-[#f7e7b6]" />
              <div>
                <h2 className="font-black">Titik kos/rumah</h2>
                <p className="text-sm text-white/45">
                  Pilih lokasi sekitar warung.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {activeLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocationId(location.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedLocationId === location.id
                      ? "border-[#d6b26e] bg-[#d6b26e]/15"
                      : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                  }`}
                >
                  <p className="font-black">{location.label}</p>
                  <p className="text-sm text-white/45">
                    {location.area} · {location.roomNumber}
                  </p>
                  <p className="text-xs text-white/35">{location.note}</p>
                </button>
              ))}
            </div>

            {selectedLocation && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                <iframe
                  title="Map preview"
                  src={`https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=17&output=embed`}
                  className="h-48 w-full"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="luxury-glass rounded-[2rem] p-5">
            <div className="mb-5 flex items-center gap-3 rounded-3xl border border-white/10 bg-black/30 px-5 py-4">
              <Search className="text-white/35" size={20} />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari menu..."
                className="w-full bg-transparent outline-none placeholder:text-white/35"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="reveal-card rounded-3xl border border-white/10 bg-white/[0.055] p-5 text-left transition hover:-translate-y-1 hover:bg-white/[0.09]"
                >
                  <div
                    className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${product.badgeColor} text-4xl`}
                  >
                    {product.image}
                  </div>
                  <p className="text-sm text-white/40">{product.category}</p>
                  <h3 className="text-lg font-black">{product.name}</h3>
                  <div className="mt-4 flex items-end justify-between">
                    <p className="font-black text-[#f7e7b6]">
                      {formatRupiah(product.price)}
                    </p>
                    <p className="text-xs text-white/35">
                      Stok {product.stock}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="luxury-glass h-fit rounded-[2rem] p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d6b26e] text-black">
                <ShoppingBag />
              </div>
              <div>
                <h2 className="text-2xl font-black">Order Saya</h2>
                <p className="text-sm text-white/45">{cart.length} item</p>
              </div>
            </div>

            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-white/45">
                        {formatRupiah(item.price)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-white/40 hover:text-red-300"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="font-black">{item.qty}</span>
                      <button
                        onClick={() => increaseQty(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <p className="font-black">
                      {formatRupiah(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/40">
                  Belum ada pesanan.
                </div>
              )}
            </div>

            <label className="mt-5 block">
              <span className="text-sm text-white/50">Catatan pesanan</span>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                rows={3}
                placeholder="Contoh: tanpa es, gula sedikit..."
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/30"
              />
            </label>

            <div className="mt-5 border-t border-white/10 pt-5">
              <div className="flex justify-between text-xl font-black">
                <span>Total</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>

              <button
                onClick={submitOrder}
                className="shine-effect mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d6b26e] px-6 py-4 font-black text-black"
              >
                Kirim Pesanan Pickup
              </button>
            </div>
          </aside>
        </section>
      </div>

      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-md">
          <div className="luxury-glass max-w-md rounded-[2rem] p-7 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400 text-black">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-3xl font-black">Pesanan masuk</h2>
            <p className="mt-3 text-white/50">
              Nomor order: {successOrder.id}. Silakan tunggu konfirmasi warung.
            </p>
            <button
              onClick={() => setSuccessOrder(null)}
              className="mt-6 w-full rounded-2xl bg-[#d6b26e] px-6 py-4 font-black text-black"
            >
              Oke
            </button>
          </div>
        </div>
      )}
    </main>
  );
}