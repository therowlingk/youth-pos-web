export type Article = {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  content: string;
  ctaLabel: string;
  gradient: string;
  isActive: boolean;
  createdAt: string;
};

export const initialArticles: Article[] = [
  {
    id: 1,
    title: "Buy 1 Get 1 Kopi Susu Aren",
    subtitle: "Promo khusus minggu ini untuk pelanggan setia Youth POS.",
    category: "Promo Mingguan",
    image: "☕",
    content:
      "Nikmati promo Buy 1 Get 1 untuk Kopi Susu Aren selama periode promo berlangsung. Promo ini cocok untuk kamu yang datang bareng teman, nongkrong sore, atau butuh boost energi sebelum kerja. Promo berlaku selama stok tersedia dan tidak dapat digabung dengan promo lainnya.",
    ctaLabel: "Lihat Detail Promo",
    gradient: "from-amber-400 via-orange-500 to-pink-500",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Dessert Day: Diskon 20%",
    subtitle: "Red Velvet dan Choco Lava lagi turun harga hari ini.",
    category: "Dessert Promo",
    image: "🍰",
    content:
      "Hari ini adalah Dessert Day. Semua dessert pilihan mendapatkan diskon sampai 20%. Cocok untuk teman minum kopi atau hadiah kecil buat orang terdekat. Promo hanya berlaku untuk pembelian langsung di outlet.",
    ctaLabel: "Cek Dessert",
    gradient: "from-fuchsia-500 via-pink-500 to-rose-400",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "New Menu: Lemon Spark Tea",
    subtitle: "Minuman segar baru dengan rasa citrus yang ringan.",
    category: "Menu Baru",
    image: "🍋",
    content:
      "Lemon Spark Tea hadir sebagai menu baru dengan sensasi segar, ringan, dan cocok untuk cuaca panas. Dibuat dengan lemon tea dan sparkling sensation yang bikin rasanya lebih modern.",
    ctaLabel: "Coba Sekarang",
    gradient: "from-cyan-400 via-blue-500 to-emerald-400",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];