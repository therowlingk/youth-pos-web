export type UserRole = "admin-master" | "cashier" | "member";

export type AppUser = {
  id: number;
  name: string;
  fullName?: string;
  nickname?: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  kosLocationId?: number;
  kosLabel?: string;
  manualAddress?: string;
  addressNote?: string;
  createdAt: string;
};

export const initialUsers: AppUser[] = [
  {
    id: 1,
    name: "Owner AI POS",
    fullName: "Owner AI POS",
    nickname: "Owner",
    email: "owner@aipos.com",
    password: "owner123",
    role: "admin-master",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Kasir Demo",
    fullName: "Kasir Demo",
    nickname: "Kasir",
    email: "kasir@aipos.com",
    password: "kasir123",
    role: "cashier",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Member Demo",
    fullName: "Member Demo",
    nickname: "Member",
    email: "member@aipos.com",
    password: "member123",
    role: "member",
    isActive: true,
    kosLocationId: 1,
    kosLabel: "Kos Melati - Kamar 01",
    createdAt: new Date().toISOString(),
  },
];