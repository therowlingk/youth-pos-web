export type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  normalPrice?: number;
  stock: number;
  sold: number;
  isPromo: boolean;
  discount?: number;
  image: string;
  badgeColor: string;
};

export const products: Product[] = [
  {
    id: 1,
    sku: "DRK-001",
    name: "Iced Matcha Cloud",
    category: "Drink",
    price: 22000,
    normalPrice: 28000,
    stock: 34,
    sold: 420,
    isPromo: true,
    discount: 21,
    image: "🍵",
    badgeColor: "from-emerald-400 to-lime-300",
  },
  {
    id: 2,
    sku: "DRK-002",
    name: "Kopi Susu Aren",
    category: "Drink",
    price: 18000,
    stock: 18,
    sold: 610,
    isPromo: false,
    image: "☕",
    badgeColor: "from-amber-400 to-orange-300",
  },
  {
    id: 3,
    sku: "FD-001",
    name: "Butter Croissant",
    category: "Bakery",
    price: 25000,
    normalPrice: 32000,
    stock: 8,
    sold: 370,
    isPromo: true,
    discount: 22,
    image: "🥐",
    badgeColor: "from-yellow-300 to-orange-300",
  },
  {
    id: 4,
    sku: "FD-002",
    name: "Spicy Chicken Rice",
    category: "Food",
    price: 35000,
    stock: 26,
    sold: 455,
    isPromo: false,
    image: "🍗",
    badgeColor: "from-red-400 to-pink-400",
  },
  {
    id: 5,
    sku: "DST-001",
    name: "Red Velvet Slice",
    category: "Dessert",
    price: 28000,
    normalPrice: 35000,
    stock: 6,
    sold: 280,
    isPromo: true,
    discount: 20,
    image: "🍰",
    badgeColor: "from-pink-400 to-rose-300",
  },
  {
    id: 6,
    sku: "DRK-003",
    name: "Lemon Spark Tea",
    category: "Drink",
    price: 16000,
    stock: 48,
    sold: 235,
    isPromo: false,
    image: "🍋",
    badgeColor: "from-cyan-300 to-blue-300",
  },
  {
    id: 7,
    sku: "FD-003",
    name: "Truffle Fries",
    category: "Snack",
    price: 24000,
    normalPrice: 30000,
    stock: 14,
    sold: 315,
    isPromo: true,
    discount: 20,
    image: "🍟",
    badgeColor: "from-violet-400 to-fuchsia-300",
  },
  {
    id: 8,
    sku: "DST-002",
    name: "Choco Lava Mini",
    category: "Dessert",
    price: 27000,
    stock: 11,
    sold: 390,
    isPromo: false,
    image: "🍫",
    badgeColor: "from-stone-500 to-yellow-700",
  },
];