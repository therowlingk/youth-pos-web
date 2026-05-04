export type OnlineOrderItem = {
  id: number;
  sku: string;
  name: string;
  price: number;
  qty: number;
};

export type OnlineOrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type OnlineOrder = {
  id: string;
  memberName: string;
  memberEmail: string;
  items: OnlineOrderItem[];
  subtotal: number;
  serviceType: "pickup";
  pickupLocationId: number;
  pickupLocationLabel: string;
  pickupRoomNumber: string;
  pickupNote: string;
  customerNote: string;
  status: OnlineOrderStatus;
  createdAt: string;
};