"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  History,
  LogOut,
  Minus,
  PackagePlus,
  Plus,
  Printer,
  QrCode,
  Receipt,
  ScanLine,
  Search,
  ShoppingCart,
  Trash2,
  WalletCards,
} from "lucide-react";
import { Product, products as initialProducts } from "@/data/products";
import AiPosLogo from "@/components/AiPosLogo";
type CartItem = {
  id: number;
  sku: string;
  name: string;
  price: number;
  qty: number;
};

type PaymentMethod = "cash" | "qris" | "card";

type Transaction = {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  change: number;
  paymentMethod: PaymentMethod;
  cashier: string;
};

type PosTab = "cashier" | "add-product" | "barcode" | "reports" | "history";

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

export default function PosPage() {
  const router = useRouter();

  const [tab, setTab] = useState<PosTab>("cashier");
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [keyword, setKeyword] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [qrisStatus, setQrisStatus] = useState<"idle" | "waiting" | "paid">(
    "idle"
  );

  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "🛍️",
    isPromo: false,
    discount: "",
  });

  useEffect(() => {
  const userRaw =
    localStorage.getItem("aipos_current_user") ||
    localStorage.getItem("youth_pos_user");

  if (!userRaw) {
    router.push("/");
    return;
  }

  const user = JSON.parse(userRaw);

  if (user.role !== "cashier") {
    alert("Akses ditolak. Halaman POS khusus kasir.");
    router.push("/choose-role");
  }
}, [router]);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem("youth_pos_products", JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
  const userRaw = localStorage.getItem("youth_pos_user");

  if (!userRaw) {
    router.push("/login");
    return;
  }

  const user = JSON.parse(userRaw);

  if (user.role !== "Kasir") {
    alert("Akses ditolak. Halaman POS khusus Kasir.");
    router.push("/login");
  }
}, [router]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const q = keyword.toLowerCase();

      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [keyword, products]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = 0;
  const tax = Math.round((subtotal - discount) * 0.11);
  const total = subtotal - discount + tax;
  const paidAmount = paymentMethod === "cash" ? Number(cashAmount || 0) : total;
  const change = paymentMethod === "cash" ? Math.max(paidAmount - total, 0) : 0;

  const todayTransactions = transactions.filter(
    (trx) => trx.date.slice(0, 10) === todayKey()
  );

  const monthTransactions = transactions.filter(
    (trx) => trx.date.slice(0, 7) === monthKey()
  );

  const todayRevenue = todayTransactions.reduce((acc, trx) => acc + trx.total, 0);
  const monthRevenue = monthTransactions.reduce((acc, trx) => acc + trx.total, 0);

  const todayItemsSold = todayTransactions.reduce((acc, trx) => {
    return acc + trx.items.reduce((itemAcc, item) => itemAcc + item.qty, 0);
  }, 0);

  const monthlyItemsSold = monthTransactions.reduce((acc, trx) => {
    return acc + trx.items.reduce((itemAcc, item) => itemAcc + item.qty, 0);
  }, 0);

  function logout() {
  localStorage.removeItem("aipos_current_user");
  localStorage.removeItem("youth_pos_user");
  router.push("/");
  }

  function addToCart(product: Product) {
    if (product.stock <= 0) {
      alert("Stok produk habis.");
      return;
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);

      if (exists) {
        if (exists.qty >= product.stock) {
          alert("Jumlah melebihi stok tersedia.");
          return prev;
        }

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
    const product = products.find((item) => item.id === id);
    const cartItem = cart.find((item) => item.id === id);

    if (!product || !cartItem) return;

    if (cartItem.qty >= product.stock) {
      alert("Jumlah melebihi stok tersedia.");
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function scanBarcode() {
    const code = barcodeInput.trim().toLowerCase();

    if (!code) return;

    const product = products.find(
      (item) =>
        item.sku.toLowerCase() === code || item.name.toLowerCase() === code
    );

    if (!product) {
      alert("Produk dengan barcode/SKU tersebut tidak ditemukan.");
      return;
    }

    addToCart(product);
    setBarcodeInput("");
    setTab("cashier");
  }

  function simulateQrisPayment() {
    if (cart.length === 0) {
      alert("Cart masih kosong.");
      return;
    }

    setPaymentMethod("qris");
    setQrisStatus("waiting");

    setTimeout(() => {
      setQrisStatus("paid");
    }, 2500);
  }

  function addProduct(e: React.FormEvent) {
    e.preventDefault();

    if (
      !newProduct.sku ||
      !newProduct.name ||
      !newProduct.category ||
      !newProduct.price ||
      !newProduct.stock
    ) {
      alert("Lengkapi data produk.");
      return;
    }

    const skuExists = products.some(
      (item) => item.sku.toLowerCase() === newProduct.sku.toLowerCase()
    );

    if (skuExists) {
      alert("SKU sudah digunakan.");
      return;
    }

    const product: Product = {
      id: Date.now(),
      sku: newProduct.sku,
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      normalPrice: undefined,
      stock: Number(newProduct.stock),
      sold: 0,
      isPromo: newProduct.isPromo,
      discount: newProduct.isPromo ? Number(newProduct.discount || 0) : undefined,
      image: newProduct.image || "🛍️",
      badgeColor: "from-cyan-400 to-fuchsia-400",
    };

    setProducts((prev) => [product, ...prev]);

    setNewProduct({
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
    setTab("cashier");
  }

  function canCheckout() {
    if (cart.length === 0) return false;

    if (paymentMethod === "cash") {
      return paidAmount >= total;
    }

    if (paymentMethod === "qris") {
      return qrisStatus === "paid";
    }

    return true;
  }

  function checkout() {
    if (!canCheckout()) {
      alert("Pembayaran belum valid.");
      return;
    }

    const transaction: Transaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      tax,
      discount,
      total,
      paidAmount,
      change,
      paymentMethod,
      cashier: "Kasir Demo",
    };

    setTransactions((prev) => [transaction, ...prev]);

    setProducts((prev) =>
      prev.map((product) => {
        const cartItem = cart.find((item) => item.id === product.id);

        if (!cartItem) return product;

        return {
          ...product,
          stock: product.stock - cartItem.qty,
          sold: product.sold + cartItem.qty,
        };
      })
    );

    printReceipt(transaction);

    setCart([]);
    setCashAmount("");
    setQrisStatus("idle");
    setPaymentMethod("cash");

    alert("Transaksi berhasil.");
  }

  function printReceipt(transaction: Transaction) {
    const receiptWindow = window.open("", "_blank", "width=420,height=650");

    if (!receiptWindow) return;

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Struk ${transaction.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #111;
            }

            .center {
              text-align: center;
            }

            .line {
              border-top: 1px dashed #333;
              margin: 14px 0;
            }

            .row {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              margin: 6px 0;
              font-size: 14px;
            }

            .item {
              margin-bottom: 10px;
            }

            .muted {
              color: #666;
              font-size: 12px;
            }

            .total {
              font-size: 18px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="center">
            <h2><AiPosLogo /></h2>
            <p class="muted">Modern Cashier System</p>
          </div>

          <div class="line"></div>

          <p class="muted">No: ${transaction.id}</p>
          <p class="muted">Tanggal: ${new Date(transaction.date).toLocaleString(
            "id-ID"
          )}</p>
          <p class="muted">Kasir: ${transaction.cashier}</p>

          <div class="line"></div>

          ${transaction.items
            .map(
              (item) => `
              <div class="item">
                <strong>${item.name}</strong>
                <div class="row">
                  <span>${item.qty} x ${formatRupiah(item.price)}</span>
                  <span>${formatRupiah(item.qty * item.price)}</span>
                </div>
              </div>
            `
            )
            .join("")}

          <div class="line"></div>

          <div class="row">
            <span>Subtotal</span>
            <span>${formatRupiah(transaction.subtotal)}</span>
          </div>

          <div class="row">
            <span>PPN 11%</span>
            <span>${formatRupiah(transaction.tax)}</span>
          </div>

          <div class="row total">
            <span>Total</span>
            <span>${formatRupiah(transaction.total)}</span>
          </div>

          <div class="row">
            <span>Metode</span>
            <span>${transaction.paymentMethod.toUpperCase()}</span>
          </div>

          <div class="row">
            <span>Dibayar</span>
            <span>${formatRupiah(transaction.paidAmount)}</span>
          </div>

          <div class="row">
            <span>Kembali</span>
            <span>${formatRupiah(transaction.change)}</span>
          </div>

          <div class="line"></div>

          <div class="center">
            <p>Terima kasih 🙌</p>
            <p class="muted">Barang yang sudah dibeli tidak dapat dikembalikan.</p>
          </div>

          <script>
            window.print();
          </script>
        </body>
      </html>
    `);

    receiptWindow.document.close();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050510] text-white">
      <div className="fixed inset-0 -z-10 noise" />
      <div className="fixed inset-0 -z-10 grid-glow opacity-60" />

      <div className="fixed left-[8%] top-[12%] -z-10 h-80 w-80 rounded-full bg-cyan-400/25 blur-[120px] animate-float-slow" />
      <div className="fixed right-[8%] top-[20%] -z-10 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[130px] animate-pulse-glow" />
      <div className="fixed bottom-[8%] left-[35%] -z-10 h-72 w-72 rounded-full bg-lime-400/10 blur-[120px]" />
      <div className="fixed inset-0 -z-10 noise" />

      <div className="mx-auto max-w-7xl px-5 py-6">
        <nav className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black">Cashier POS</h1>
            <p className="text-white/45">
              Transaksi, pembayaran, barcode, produk, dan laporan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
          <TabButton
            active={tab === "cashier"}
            onClick={() => setTab("cashier")}
            icon={<ShoppingCart size={18} />}
            label="Kasir"
          />
          <TabButton
            active={tab === "barcode"}
            onClick={() => setTab("barcode")}
            icon={<ScanLine size={18} />}
            label="Scan Barcode"
          />
          <TabButton
            active={tab === "add-product"}
            onClick={() => setTab("add-product")}
            icon={<PackagePlus size={18} />}
            label="Tambah Produk"
          />
          <TabButton
            active={tab === "reports"}
            onClick={() => setTab("reports")}
            icon={<BarChart3 size={18} />}
            label="Laporan"
          />
          <TabButton
            active={tab === "history"}
            onClick={() => setTab("history")}
            icon={<History size={18} />}
            label="Riwayat"
          />
        </div>

        {tab === "cashier" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_410px]">
            <section className="glass rounded-[2rem] p-5">
              <div className="mb-5 flex items-center gap-3 rounded-3xl border border-white/10 bg-black/30 px-5 py-4">
                <Search size={20} className="text-white/35" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Cari produk berdasarkan nama, SKU, kategori..."
                  className="w-full bg-transparent outline-none placeholder:text-white/35"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left transition hover:-translate-y-1 hover:bg-white/[0.1]"
                  >
                    <div
                      className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.badgeColor} text-4xl`}
                    >
                      {item.image}
                    </div>

                    <p className="text-sm text-white/45">{item.sku}</p>
                    <h3 className="text-lg font-black">{item.name}</h3>
                    <p className="text-sm text-white/45">{item.category}</p>

                    <div className="mt-4 flex items-end justify-between">
                      <p className="font-black text-cyan-200">
                        {formatRupiah(item.price)}
                      </p>
                      <p className="text-sm text-white/45">Stock {item.stock}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <CartPanel
              cart={cart}
              subtotal={subtotal}
              tax={tax}
              total={total}
              cashAmount={cashAmount}
              setCashAmount={setCashAmount}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              qrisStatus={qrisStatus}
              simulateQrisPayment={simulateQrisPayment}
              decreaseQty={decreaseQty}
              increaseQty={increaseQty}
              removeFromCart={removeFromCart}
              clearCart={() => setCart([])}
              checkout={checkout}
              canCheckout={canCheckout()}
              paidAmount={paidAmount}
              change={change}
            />
          </div>
        )}

        {tab === "barcode" && (
          <section className="glass rounded-[2rem] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
                <ScanLine />
              </div>
              <div>
                <h2 className="text-2xl font-black">Scan Barcode / SKU</h2>
                <p className="text-white/45">
                  Scanner barcode biasanya otomatis mengetik kode lalu menekan
                  Enter. Masukkan SKU produk untuk simulasi.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <input
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") scanBarcode();
                }}
                placeholder="Contoh: DRK-001"
                className="rounded-3xl border border-white/10 bg-black/30 px-5 py-4 outline-none placeholder:text-white/35"
                autoFocus
              />

              <button
                onClick={scanBarcode}
                className="rounded-3xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-4 font-black"
              >
                Tambah ke Cart
              </button>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <h3 className="mb-3 font-black">Daftar SKU Demo</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {products.slice(0, 9).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setBarcodeInput(item.sku)}
                    className="rounded-2xl bg-black/25 p-4 text-left hover:bg-black/40"
                  >
                    <p className="font-bold">{item.sku}</p>
                    <p className="text-sm text-white/45">{item.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === "add-product" && (
          <section className="glass rounded-[2rem] p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-black">Tambah Produk</h2>
              <p className="text-white/45">
                Produk baru akan tersimpan di browser menggunakan localStorage.
              </p>
            </div>

            <form onSubmit={addProduct} className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="SKU / Barcode"
                value={newProduct.sku}
                onChange={(value) =>
                  setNewProduct((prev) => ({ ...prev, sku: value }))
                }
                placeholder="Contoh: DRK-009"
              />

              <FormInput
                label="Nama Produk"
                value={newProduct.name}
                onChange={(value) =>
                  setNewProduct((prev) => ({ ...prev, name: value }))
                }
                placeholder="Contoh: Strawberry Milk"
              />

              <FormInput
                label="Kategori"
                value={newProduct.category}
                onChange={(value) =>
                  setNewProduct((prev) => ({ ...prev, category: value }))
                }
                placeholder="Drink / Food / Dessert"
              />

              <FormInput
                label="Harga"
                value={newProduct.price}
                onChange={(value) =>
                  setNewProduct((prev) => ({ ...prev, price: value }))
                }
                placeholder="25000"
                type="number"
              />

              <FormInput
                label="Stock Awal"
                value={newProduct.stock}
                onChange={(value) =>
                  setNewProduct((prev) => ({ ...prev, stock: value }))
                }
                placeholder="50"
                type="number"
              />

              <FormInput
                label="Emoji Produk"
                value={newProduct.image}
                onChange={(value) =>
                  setNewProduct((prev) => ({ ...prev, image: value }))
                }
                placeholder="🥤"
              />

              <label className="rounded-3xl border border-white/10 bg-black/25 p-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newProduct.isPromo}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        isPromo: e.target.checked,
                      }))
                    }
                  />
                  <span className="font-bold">Jadikan produk promo</span>
                </div>
              </label>

              {newProduct.isPromo && (
                <FormInput
                  label="Diskon Promo (%)"
                  value={newProduct.discount}
                  onChange={(value) =>
                    setNewProduct((prev) => ({ ...prev, discount: value }))
                  }
                  placeholder="20"
                  type="number"
                />
              )}

              <button className="rounded-3xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-4 font-black md:col-span-2">
                Simpan Produk
              </button>
            </form>
          </section>
        )}

        {tab === "reports" && (
          <section className="grid gap-5 lg:grid-cols-2">
            <ReportCard
              icon={<CalendarDays />}
              title="Laporan Harian"
              subtitle={new Date().toLocaleDateString("id-ID")}
              revenue={todayRevenue}
              transactions={todayTransactions.length}
              itemsSold={todayItemsSold}
            />

            <ReportCard
              icon={<BarChart3 />}
              title="Laporan Bulanan"
              subtitle={new Date().toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
              revenue={monthRevenue}
              transactions={monthTransactions.length}
              itemsSold={monthlyItemsSold}
            />

            <div className="glass rounded-[2rem] p-6 lg:col-span-2">
              <h3 className="mb-5 text-2xl font-black">Ringkasan Metode Pembayaran</h3>

              <div className="grid gap-4 md:grid-cols-3">
                <PaymentSummary
                  title="Cash"
                  value={transactions.filter((t) => t.paymentMethod === "cash").length}
                  icon={<Banknote />}
                />
                <PaymentSummary
                  title="QRIS"
                  value={transactions.filter((t) => t.paymentMethod === "qris").length}
                  icon={<QrCode />}
                />
                <PaymentSummary
                  title="Card"
                  value={transactions.filter((t) => t.paymentMethod === "card").length}
                  icon={<CreditCard />}
                />
              </div>
            </div>
          </section>
        )}

        {tab === "history" && (
          <section className="glass rounded-[2rem] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Riwayat Transaksi</h2>
                <p className="text-white/45">
                  Semua transaksi yang sudah checkout.
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirm("Hapus semua transaksi?")) {
                    setTransactions([]);
                  }
                }}
                className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100"
              >
                Clear History
              </button>
            </div>

            <div className="space-y-3">
              {transactions.map((trx) => (
                <div
                  key={trx.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-black">{trx.id}</p>
                      <p className="text-sm text-white/45">
                        {new Date(trx.date).toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm text-white/45">
                        {trx.items.length} produk · {trx.paymentMethod.toUpperCase()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-xl font-black">
                        {formatRupiah(trx.total)}
                      </p>

                      <button
                        onClick={() => printReceipt(trx)}
                        className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold"
                      >
                        <Printer size={17} />
                        Struk
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45">
                  Belum ada transaksi.
                </div>
              )}
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

function CartPanel({
  cart,
  subtotal,
  tax,
  total,
  cashAmount,
  setCashAmount,
  paymentMethod,
  setPaymentMethod,
  qrisStatus,
  simulateQrisPayment,
  decreaseQty,
  increaseQty,
  removeFromCart,
  clearCart,
  checkout,
  canCheckout,
  paidAmount,
  change,
}: {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  cashAmount: string;
  setCashAmount: (value: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  qrisStatus: "idle" | "waiting" | "paid";
  simulateQrisPayment: () => void;
  decreaseQty: (id: number) => void;
  increaseQty: (id: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  checkout: () => void;
  canCheckout: boolean;
  paidAmount: number;
  change: number;
}) {
  return (
    <aside className="glass h-fit rounded-[2rem] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
            <ShoppingCart />
          </div>
          <div>
            <h2 className="text-2xl font-black">Cart</h2>
            <p className="text-sm text-white/45">{cart.length} jenis item</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="rounded-xl bg-red-500/15 px-3 py-2 text-xs font-bold text-red-100"
          >
            Clear
          </button>
        )}
      </div>

      <div className="max-h-[300px] space-y-3 overflow-auto pr-1">
        {cart.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-black/25 p-4"
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-white/45">
                  {item.sku} · {formatRupiah(item.price)}
                </p>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
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
                  <Minus size={16} />
                </button>
                <span className="font-black">{item.qty}</span>
                <button
                  onClick={() => increaseQty(item.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"
                >
                  <Plus size={16} />
                </button>
              </div>

              <p className="font-black">{formatRupiah(item.price * item.qty)}</p>
            </div>
          </div>
        ))}

        {cart.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/45">
            Belum ada item di cart.
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-black">Metode Pembayaran</h3>

        <div className="grid grid-cols-3 gap-2">
          <PaymentButton
            active={paymentMethod === "cash"}
            onClick={() => setPaymentMethod("cash")}
            icon={<Banknote size={17} />}
            label="Cash"
          />
          <PaymentButton
            active={paymentMethod === "qris"}
            onClick={() => setPaymentMethod("qris")}
            icon={<QrCode size={17} />}
            label="QRIS"
          />
          <PaymentButton
            active={paymentMethod === "card"}
            onClick={() => setPaymentMethod("card")}
            icon={<CreditCard size={17} />}
            label="Card"
          />
        </div>

        {paymentMethod === "cash" && (
          <div className="mt-4">
            <label className="text-sm text-white/50">Nominal cash diterima</label>
            <input
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder="Contoh: 100000"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/30"
            />
          </div>
        )}

        {paymentMethod === "qris" && (
          <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-5 text-center">
            <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-3xl bg-white text-black">
              <QrCode size={96} />
            </div>

            <p className="font-black">QRIS Payment</p>
            <p className="text-sm text-white/45">
              Total: {formatRupiah(total)}
            </p>

            <button
              onClick={simulateQrisPayment}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-3 font-black"
            >
              Generate QRIS
            </button>

            {qrisStatus === "waiting" && (
              <p className="mt-3 text-sm font-bold text-yellow-200">
                Menunggu pembayaran...
              </p>
            )}

            {qrisStatus === "paid" && (
              <p className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-emerald-200">
                <CheckCircle2 size={17} />
                Pembayaran QRIS terdeteksi
              </p>
            )}
          </div>
        )}

        {paymentMethod === "card" && (
          <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-5">
            <div className="mb-3 flex items-center gap-3">
              <WalletCards className="text-cyan-200" />
              <div>
                <p className="font-black">Card / Debit</p>
                <p className="text-sm text-white/45">
                  Simulasi pembayaran kartu.
                </p>
              </div>
            </div>

            <p className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm font-bold text-emerald-100">
              Status: Approved
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
        <div className="flex justify-between text-white/60">
          <span>Subtotal</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>

        <div className="flex justify-between text-white/60">
          <span>PPN 11%</span>
          <span>{formatRupiah(tax)}</span>
        </div>

        <div className="flex justify-between text-xl font-black">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div>

        {paymentMethod === "cash" && (
          <>
            <div className="flex justify-between text-white/60">
              <span>Dibayar</span>
              <span>{formatRupiah(paidAmount)}</span>
            </div>

            <div className="flex justify-between text-white/60">
              <span>Kembali</span>
              <span>{formatRupiah(change)}</span>
            </div>
          </>
        )}

        <button
          onClick={checkout}
          disabled={!canCheckout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-4 font-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Receipt size={19} />
          Checkout & Cetak Struk
        </button>
      </div>
    </aside>
  );
}

function PaymentButton({
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
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-3 text-xs font-black ${
        active ? "bg-white text-black" : "bg-white/10 text-white"
      }`}
    >
      {icon}
      {label}
    </button>
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

function ReportCard({
  icon,
  title,
  subtitle,
  revenue,
  transactions,
  itemsSold,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  revenue: number;
  transactions: number;
  itemsSold: number;
}) {
  return (
    <div className="glass rounded-[2rem] p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="text-white/45">{subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-3xl bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 p-5">
          <p className="text-sm text-white/55">Omzet</p>
          <p className="text-3xl font-black">{formatRupiah(revenue)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white/[0.06] p-5">
            <p className="text-sm text-white/55">Transaksi</p>
            <p className="text-2xl font-black">{transactions}</p>
          </div>

          <div className="rounded-3xl bg-white/[0.06] p-5">
            <p className="text-sm text-white/55">Item Terjual</p>
            <p className="text-2xl font-black">{itemsSold}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentSummary({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
        {icon}
      </div>
      <p className="text-sm text-white/45">{title}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}